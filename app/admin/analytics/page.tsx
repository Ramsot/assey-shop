import { getAnalytics, getRevenueData } from "@/modules/admin/admin.actions";
import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight, Download, Calendar } from "lucide-react";
import { RevenueChart } from "./analytics-charts";
import { AnalyticsExport } from "./analytics-export";
import { safeSerialize } from "@/lib/safe-serializer";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const stats = await getAnalytics();
  const revenueData = await getRevenueData();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">System Analytics</h1>
          <p className="text-white/50 text-sm">Real-time performance metrics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
          <AnalyticsExport stats={stats} revenueData={revenueData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/[0.08] transition-all">
            <p className="text-white/40 text-sm font-medium mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                stat.trending === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {stat.trending === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold">Revenue Growth</h3>
              <p className="text-white/40 text-sm">Daily revenue collection for the last 7 days</p>
            </div>
          </div>
          <RevenueChart data={safeSerialize(revenueData)} />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col">
          <h3 className="text-lg font-bold mb-6">Retention Overview</h3>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <TrendingUp className="w-16 h-16 text-white/10 mb-6" />
            <h4 className="text-md font-bold mb-2">User Loyalty</h4>
            <p className="text-white/30 text-sm max-w-[200px] mx-auto">Cohort analysis and return customer metrics are being processed.</p>
          </div>
          <button className="w-full mt-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium">
            View Retention Details
          </button>
        </div>
      </div>
    </div>
  );
}
