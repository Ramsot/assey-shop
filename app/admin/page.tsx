import Link from "next/link";
import {
  Users,
  Ticket,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { getDashboardStats, getTrafficData } from "@/modules/admin/admin.actions";
import { DashboardCharts } from "./dashboard-charts";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { safeSerialize } from "@/lib/safe-serializer";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [statsData, trafficData] = await Promise.all([
    getDashboardStats(),
    getTrafficData(),
  ]);

  const stats = [
    {
      label: "Active Sessions",
      value: statsData.activeSessionsCount.toString(),
      change: "+12%",
      trend: "up" as const,
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Vouchers Sold Today",
      value: statsData.vouchersSoldToday.toString(),
      change: "+18%",
      trend: "up" as const,
      icon: Ticket,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "New Customers Today",
      value: statsData.newUsersToday.toString(),
      change: "-5%",
      trend: "down" as const,
      icon: Users,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Revenue (TZS)",
      value: `${(Number(statsData.totalRevenue) / 1000000).toFixed(1)}M`,
      change: "+24%",
      trend: "up" as const,
      icon: DollarSign,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/[0.07] transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === "up" ? "text-green-400" : "text-red-400"
                }`}
              >
                {stat.change}
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
              </div>
            </div>
            <div>
              <p className="text-white/50 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 p-8 rounded-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold">Network Traffic</h3>
              <p className="text-sm text-white/50">
                Real-time bandwidth usage across all routers
              </p>
            </div>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500 transition-colors">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <DashboardCharts data={safeSerialize(trafficData)} />
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Recent Alerts</h3>
          <div className="space-y-6">
            {statsData.recentAlerts.length > 0 ? (
              statsData.recentAlerts.map((alert) => (
                <div key={alert.id} className="flex gap-4">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-2",
                      alert.severity === "HIGH"
                        ? "bg-red-500"
                        : alert.severity === "MEDIUM"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                    )}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/30">
                        {alert.type}
                      </span>
                      <span className="text-xs text-white/30">
                        {formatDistanceToNow(new Date(alert.createdAt))} ago
                      </span>
                    </div>
                    <p className="text-sm text-white/80 mt-1">{alert.details}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/30 text-center py-10">
                No recent alerts
              </p>
            )}
          </div>
          <Link
            href="/admin/abuse"
            className="block w-full mt-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium text-center"
          >
            View All Reports
          </Link>
        </div>
      </div>
    </div>
  );
}
