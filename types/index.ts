import type { Prisma } from "@prisma/client";

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "OPERATOR";

export type VoucherStatus = "PENDING" | "ACTIVE" | "EXPIRED" | "USED";

export type PackageType = "TIME" | "DATA" | "UNLIMITED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "COMPLETED" | "FAILED";

export type RouterStatus = "ONLINE" | "OFFLINE";

export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH";

export type AbuseType =
  | "MAC_SPOOFING"
  | "CONCURRENT_SESSIONS"
  | "SESSION_CLONING"
  | "BYPASS_ATTEMPT";

export type PaymentMethod = "MPESA" | "AIRTEL" | "HALOPESA" | "WEBHOOK";

export interface AdminSession {
  userId: string;
  role: string;
  type: "access" | "refresh";
}

export interface VoucherWithPackage extends Prisma.VoucherGetPayload<{
  include: { package: true; router: true; user: true };
}> {}

export interface RouterWithCount extends Prisma.RouterGetPayload<{
  include: { _count: { select: { vouchers: true; sessions: true } } };
}> {}

export interface UserWithCount extends Prisma.UserGetPayload<{
  include: { _count: { select: { vouchers: true; payments: true; sessions: true } } };
}> {}

export interface PaymentWithUser extends Prisma.PaymentGetPayload<{
  include: { user: true };
}> {}

export interface DashboardStats {
  activeSessionsCount: number;
  vouchersSoldToday: number;
  newUsersToday: number;
  totalRevenue: number;
  recentAlerts: Prisma.AbuseReportGetPayload<{
    select: { id: true; type: true; details: true; severity: true; createdAt: true };
  }>[];
}

export interface TrafficDataPoint {
  name: string;
  users: number;
  traffic: number;
}

export interface RevenueDataPoint {
  name: string;
  revenue: number;
}

export interface AnalyticsStat {
  label: string;
  value: string;
  change: string;
  trending: "up" | "down";
}

export interface PublicStats {
  activeUsers: number;
  totalVouchers: number;
  coverage: string;
}
