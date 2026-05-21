"use server";

import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, endOfDay, format } from "date-fns";
import { hashPassword } from "@/modules/auth/password.utils";
import type {
  AnalyticsStat,
  DashboardStats,
  TrafficDataPoint,
  RevenueDataPoint,
  PublicStats,
  VoucherWithPackage,
  RouterWithCount,
  UserWithCount,
  PaymentWithUser,
} from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    activeSessionsCount,
    vouchersSoldToday,
    newUsersToday,
    totalRevenue,
    recentAlerts,
  ] = await Promise.all([
    prisma.session.count({ where: { isActive: true } }),
    prisma.voucher.count({
      where: { activatedAt: { gte: startOfDay(new Date()) } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: startOfDay(new Date()) } },
    }),
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
    prisma.abuseReport.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, type: true, details: true, severity: true, createdAt: true },
    }),
  ]);

  return {
    activeSessionsCount,
    vouchersSoldToday,
    newUsersToday,
    totalRevenue: Number(totalRevenue._sum.amount) || 0,
    recentAlerts,
  };
}

export async function getTrafficData(): Promise<TrafficDataPoint[]> {
  const now = new Date();
  const data: TrafficDataPoint[] = [];

  for (let i = 7; i >= 0; i--) {
    const startTime = subDays(now, i / 8);
    const endTime = i === 0 ? now : subDays(now, (i - 1) / 8);

    const stats = await prisma.session.aggregate({
      where: { startTime: { gte: startTime, lte: endTime } },
      _sum: { bytesIn: true, bytesOut: true },
      _count: { id: true },
    });

    const totalBytes =
      Number(stats._sum.bytesIn || BigInt(0)) + Number(stats._sum.bytesOut || BigInt(0));

    data.push({
      name: startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      users: stats._count.id || 0,
      traffic: totalBytes / (1024 * 1024),
    });
  }
  return data;
}

export async function getAnalytics(): Promise<AnalyticsStat[]> {
  const now = new Date();
  const lastMonth = subDays(now, 30);

  const [totalRevenue, prevRevenue, activeSessions, prevSessions, newUsers, prevUsers, vouchersSold, prevVouchers] =
    await Promise.all([
      prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS", createdAt: { lt: lastMonth } },
        _sum: { amount: true },
      }),
      prisma.session.count({ where: { isActive: true } }),
      prisma.session.count({ where: { isActive: true, startTime: { lt: lastMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: subDays(now, 30) } } }),
      prisma.user.count({
        where: { createdAt: { lt: lastMonth, gte: subDays(lastMonth, 30) } },
      }),
      prisma.voucher.count({ where: { createdAt: { gte: subDays(now, 30) } } }),
      prisma.voucher.count({
        where: { createdAt: { lt: lastMonth, gte: subDays(lastMonth, 30) } },
      }),
    ]);

  const calculateChange = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
  };

  const currentRevenue = Number(totalRevenue._sum.amount || 0);
  const previousRevenue = Number(prevRevenue._sum.amount || 0);

  return [
    {
      label: "Total Revenue",
      value: `TZS ${currentRevenue.toLocaleString()}`,
      change: calculateChange(currentRevenue, previousRevenue),
      trending: currentRevenue >= previousRevenue ? "up" : "down",
    },
    {
      label: "Active Sessions",
      value: activeSessions.toString(),
      change: calculateChange(activeSessions, prevSessions),
      trending: activeSessions >= prevSessions ? "up" : "down",
    },
    {
      label: "New Users",
      value: newUsers.toString(),
      change: calculateChange(newUsers, prevUsers),
      trending: newUsers >= prevUsers ? "up" : "down",
    },
    {
      label: "Vouchers Sold",
      value: vouchersSold.toString(),
      change: calculateChange(vouchersSold, prevVouchers),
      trending: vouchersSold >= prevVouchers ? "up" : "down",
    },
  ];
}

export async function getRevenueData(): Promise<RevenueDataPoint[]> {
  const now = new Date();
  const data: RevenueDataPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = subDays(now, i);
    const stats = await prisma.payment.aggregate({
      where: {
        status: "SUCCESS",
        createdAt: { gte: startOfDay(date), lte: endOfDay(date) },
      },
      _sum: { amount: true },
    });

    data.push({
      name: format(date, "EEE"),
      revenue: Number(stats._sum.amount || 0),
    });
  }
  return data;
}

export async function getVouchers(page = 1, limit = 20): Promise<{
  vouchers: VoucherWithPackage[];
  total: number;
}> {
  const [vouchers, total] = await Promise.all([
    prisma.voucher.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: { package: true, router: true, user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.voucher.count(),
  ]);

  return { vouchers, total };
}

export async function getPackages() {
  return await prisma.package.findMany({ orderBy: { price: "asc" } });
}

export async function getRouters(): Promise<RouterWithCount[]> {
  return await prisma.router.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { vouchers: true, sessions: { where: { isActive: true } } },
      },
    },
  });
}

export async function getUsers(): Promise<UserWithCount[]> {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { vouchers: true, payments: true, sessions: true } },
    },
  });
}

export async function getPayments(): Promise<PaymentWithUser[]> {
  return await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, package: true },
  });
}

export async function getAbuseReports() {
  return await prisma.abuseReport.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getSettings(): Promise<Record<string, string>> {
  const settings = await prisma.systemSetting.findMany();
  return settings.reduce<Record<string, string>>((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});
}

export async function saveSettings(settings: Record<string, string>) {
  const operations = Object.entries(settings).map(([key, value]) =>
    prisma.systemSetting.upsert({
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
    data: { isResolved: true },
  });
  return { success: true };
}

export async function generateVoucher(packageId: string, routerId?: string) {
  const { generateVoucherCode } = await import("@/modules/vouchers/voucher.service");
  const code = generateVoucherCode();
  return await prisma.voucher.create({
    data: { code, packageId, routerId, status: "PENDING" },
    include: { package: true },
  });
}

export async function bulkGenerateVouchers(
  packageId: string,
  count: number,
  routerId?: string
) {
  const { createBulkVouchers } = await import("@/modules/vouchers/voucher.service");
  return await createBulkVouchers(packageId, count, routerId);
}

export async function deleteVoucher(id: string) {
  await prisma.voucher.delete({ where: { id } });
  return { success: true };
}

export async function addRouter(data: {
  name: string;
  ipAddress: string;
  apiPort: number;
  username: string;
  password: string;
  location?: string;
}) {
  const { RouterService } = await import("@/modules/routers/router.service");
  return await RouterService.connectRouter(data);
}

export async function deleteRouter(id: string) {
  await prisma.router.delete({ where: { id } });
  return { success: true };
}

export async function syncRouterStatus(id: string) {
  const { RouterService } = await import("@/modules/routers/router.service");
  return await RouterService.syncRouterStatus(id);
}

export async function getPublicStats(): Promise<PublicStats> {
  const [activeUsers, totalVouchers] = await Promise.all([
    prisma.session.count({ where: { isActive: true } }),
    prisma.voucher.count(),
  ]);

  return {
    activeUsers,
    totalVouchers,
    coverage: "99.9%",
  };
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  const { cookies } = await import("next/headers");
  const { verifyToken } = await import("@/modules/auth/auth.service");
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) throw new Error("Not authenticated");

  const payload = await verifyToken(token);
  if (!payload) throw new Error("Not authenticated");

  const admin = await prisma.admin.findUnique({ where: { id: payload.userId } });
  if (!admin) throw new Error("Admin not found");

  const { verifyPassword } = await import("@/modules/auth/password.utils");
  const valid = await verifyPassword(currentPassword, admin.passwordHash);
  if (!valid) throw new Error("Current password is incorrect");

  const hash = await hashPassword(newPassword);
  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash: hash },
  });

  return { success: true };
}
