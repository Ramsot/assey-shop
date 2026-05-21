"use server";

import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, endOfDay } from "date-fns";

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
  // Mocking traffic data for now, in production this would aggregate session bytes
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      name: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      users: Math.floor(Math.random() * 200),
      traffic: Math.floor(Math.random() * 1000),
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

export async function getPublicStats() {
  const [activeUsers, totalVouchers] = await Promise.all([
    prisma.session.count({ where: { isActive: true } }),
    prisma.voucher.count(),
  ]);

  return {
    activeUsers: activeUsers + 100, // Adding some base number for demo
    totalVouchers: totalVouchers + 500,
    coverage: "99.9%"
  };
}




