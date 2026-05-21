"use server";

import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, endOfDay, format } from "date-fns";

export async function getDashboardStats() {
  const [
    activeSessionsCount,
    vouchersSoldToday,
    newUsersToday,
    totalRevenue,
    recentAlerts
  ] = await Promise.all([
    // 1. Active Sessions
    prisma.session.count({ where: { isActive: true } }),

    // 2. Vouchers Sold Today
    prisma.voucher.count({
      where: {
        activatedAt: {
          gte: startOfDay(new Date()),
        },
      },
    }),

    // 3. New Users Today
    prisma.user.count({
      where: {
        createdAt: {
          gte: startOfDay(new Date()),
        },
      },
    }),

    // 4. Total Revenue (Success Payments)
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),


    // 5. Recent Alerts
    prisma.abuseReport.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        details: true,
        severity: true,
        createdAt: true,
      }
    }),
  ]);

  return {
    activeSessionsCount,
    vouchersSoldToday,
    newUsersToday,
    totalRevenue: totalRevenue._sum.amount || 0,
    recentAlerts,
  };
}

export async function getTrafficData() {
  // Aggregate real session traffic from the last 24 hours in 3-hour intervals
  const now = new Date();
  const data = [];
  
  for (let i = 7; i >= 0; i--) {
    const startTime = subDays(now, i / 8); // ~3 hour intervals
    const endTime = i === 0 ? now : subDays(now, (i - 1) / 8);
    
    const stats = await prisma.session.aggregate({
      where: {
        startTime: { gte: startTime, lte: endTime }
      },
      _sum: {
        bytesIn: true,
        bytesOut: true
      },
      _count: {
        id: true
      }
    });

    const totalBytes = (stats._sum.bytesIn || BigInt(0)) + (stats._sum.bytesOut || BigInt(0));

    data.push({
      name: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      users: stats._count.id || 0,
      traffic: Number(totalBytes) / (1024 * 1024), // MB
    });
  }
  return data;
}

export async function getAnalytics() {
  const now = new Date();
  const lastMonth = subDays(now, 30);
  
  const [
    totalRevenue,
    prevRevenue,
    activeSessions,
    prevSessions,
    newUsers,
    prevUsers,
    vouchersSold,
    prevVouchers
  ] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: "SUCCESS", createdAt: { lt: lastMonth } }, _sum: { amount: true } }),
    prisma.session.count({ where: { isActive: true } }),
    prisma.session.count({ where: { isActive: true, startTime: { lt: lastMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: subDays(now, 30) } } }),
    prisma.user.count({ where: { createdAt: { lt: lastMonth, gte: subDays(lastMonth, 30) } } }),
    prisma.voucher.count({ where: { createdAt: { gte: subDays(now, 30) } } }),
    prisma.voucher.count({ where: { createdAt: { lt: lastMonth, gte: subDays(lastMonth, 30) } } }),
  ]);

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const currentRevenue = Number(totalRevenue._sum.amount || 0);
  const previousRevenue = Number(prevRevenue._sum.amount || 0);

  return [
    { 
      label: "Total Revenue", 
      value: `TZS ${currentRevenue.toLocaleString()}`, 
      change: calculateChange(currentRevenue, previousRevenue),
      trending: currentRevenue >= previousRevenue ? "up" : "down" 
    },
    { 
      label: "Active Sessions", 
      value: activeSessions.toString(), 
      change: calculateChange(activeSessions, prevSessions),
      trending: activeSessions >= prevSessions ? "up" : "down" 
    },
    { 
      label: "New Users", 
      value: newUsers.toString(), 
      change: calculateChange(newUsers, prevUsers),
      trending: newUsers >= prevUsers ? "up" : "down" 
    },
    { 
      label: "Vouchers Sold", 
      value: vouchersSold.toString(), 
      change: calculateChange(vouchersSold, prevVouchers),
      trending: vouchersSold >= prevVouchers ? "up" : "down" 
    },
  ];
}

export async function getRevenueData() {
  const now = new Date();
  const data = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = subDays(now, i);
    const stats = await prisma.payment.aggregate({
      where: {
        status: "SUCCESS",
        createdAt: {
          gte: startOfDay(date),
          lte: endOfDay(date)
        }
      },
      _sum: { amount: true }
    });

    data.push({
      name: format(date, "EEE"),
      revenue: Number(stats._sum.amount || 0)
    });
  }
  return data;
}

export async function getVouchers(page = 1, limit = 10) {
  const [vouchers, total] = await Promise.all([
    prisma.voucher.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: { package: true, router: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.voucher.count(),
  ]);

  return { vouchers, total };
}

export async function getPackages() {
  return await prisma.package.findMany({
    orderBy: { price: "asc" },
  });
}

export async function getRouters() {
  return await prisma.router.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { vouchers: true, sessions: { where: { isActive: true } } }
      }
    }
  });
}

export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { vouchers: true, payments: true, sessions: true }
      }
    }
  });
}

export async function getPayments() {
  return await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });
}

export async function getAbuseReports() {
  return await prisma.abuseReport.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getSettings() {
  const settings = await (prisma as any).systemSetting.findMany();
  return settings.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);
}

export async function saveSettings(settings: Record<string, string>) {
  const operations = Object.entries(settings).map(([key, value]) =>
    (prisma as any).systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  );
  await Promise.all(operations);
  return { success: true };
}

export async function clearAbuseLogs() {
  await prisma.abuseReport.deleteMany();
  return { success: true };
}

export async function resolveAbuseReport(id: string) {
  await prisma.abuseReport.update({
    where: { id },
    data: { isResolved: true }
  });
  return { success: true };
}

export async function getPublicStats() {
  const [activeUsers, totalVouchers] = await Promise.all([
    prisma.session.count({ where: { isActive: true } }),
    prisma.voucher.count(),
  ]);

  return {
    activeUsers,
    totalVouchers,
    coverage: "99.9%"
  };
}




