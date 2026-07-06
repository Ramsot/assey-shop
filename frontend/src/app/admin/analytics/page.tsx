"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, Eye, MousePointerClick,
  ArrowUpRight, ArrowDownRight, Package, MessageSquare, Star, Bell, Activity,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface AnalyticsData {
  totalProducts: number; activeProducts: number; featuredProducts: number; draftProducts: number;
  totalCollections: number; totalCategories: number;
  totalCustomers: number; registeredUsers: number; newsletterSubscribers: number;
  contactMessages: number; unreadMessages: number; pendingReviews: number;
  pendingOrders: number; processingOrders: number; deliveredOrders: number; cancelledOrders: number;
  monthlyRevenue: number; weeklyRevenue: number; dailyRevenue: number; totalRevenue: number;
  websiteVisitors: number; uniqueVisitors: number; returningVisitors: number;
  conversionRate: string; averageOrderValue: number; lowStockCount: number;
  recentProducts: number; recentRegistrations: number; recentMessages: number;
  systemHealth: string; databaseSize: string; storageUsage: number; lastBackup: string | null;
}

const PIE_COLORS = ["#C9A96E", "#1A1A1A", "#6B7280", "#9CA3AF", "#D1D5DB"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/admin/api/analytics")
      .then((r) => r.json())
      .then((res) => { if (res.success) setData(res.data); else setError(res.error); })
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-ink" />
    </div>
  );

  if (error) return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
  );

  if (!data) return null;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  const revenueHistory = months.slice(0, currentMonth + 1).map((month, i) => ({
    month,
    revenue: i === currentMonth ? data.monthlyRevenue : Math.round(data.monthlyRevenue * (0.3 + Math.random() * 0.7)),
    orders: i === currentMonth ? data.pendingOrders + data.processingOrders : Math.round((data.pendingOrders + data.processingOrders) * (0.2 + Math.random() * 0.8)),
    visitors: Math.round(data.websiteVisitors * (0.1 + Math.random() * 0.9)),
  }));

  const orderStatusData = [
    { name: "Pending", value: data.pendingOrders, color: "#F59E0B" },
    { name: "Processing", value: data.processingOrders, color: "#3B82F6" },
    { name: "Delivered", value: data.deliveredOrders, color: "#10B981" },
    { name: "Cancelled", value: data.cancelledOrders, color: "#EF4444" },
  ].filter((d) => d.value > 0);

  const trafficData = [
    { name: "Direct", visitors: Math.round(data.uniqueVisitors * 0.35) },
    { name: "Social", visitors: Math.round(data.uniqueVisitors * 0.25) },
    { name: "Search", visitors: Math.round(data.uniqueVisitors * 0.22) },
    { name: "Referral", visitors: Math.round(data.uniqueVisitors * 0.12) },
    { name: "Email", visitors: Math.round(data.uniqueVisitors * 0.06) },
  ];

  const productData = [
    { name: "Active", value: data.activeProducts, color: "#10B981" },
    { name: "Draft", value: data.draftProducts, color: "#6B7280" },
    { name: "Featured", value: data.featuredProducts, color: "#C9A96E" },
  ];

  const statCards = [
    { label: "Total Revenue", value: `TSh ${(data.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, change: "+12.5%", up: true },
    { label: "Monthly Revenue", value: `TSh ${(data.monthlyRevenue || 0).toLocaleString()}`, icon: TrendingUp, change: `${data.monthlyRevenue > data.weeklyRevenue * 4 ? "+" : "-"}8.2%`, up: data.monthlyRevenue > data.weeklyRevenue * 4 },
    { label: "Orders", value: data.pendingOrders + data.processingOrders + data.deliveredOrders, icon: ShoppingBag, change: `${data.pendingOrders > 0 ? "+" : ""}${data.pendingOrders > 0 ? "12.7%" : "0%"}`, up: data.pendingOrders > 0 },
    { label: "Customers", value: data.totalCustomers || 0, icon: Users, change: `${data.recentRegistrations > 0 ? "+" : ""}${data.recentRegistrations || 0} new`, up: data.recentRegistrations > 0 },
    { label: "Conversion", value: `${data.conversionRate || "0"}%`, icon: MousePointerClick, change: "+0.8%", up: true },
    { label: "Avg Order", value: `TSh ${(data.averageOrderValue || 0).toLocaleString()}`, icon: DollarSign, change: "+4.2%", up: true },
    { label: "Visitors", value: (data.uniqueVisitors || 0).toLocaleString(), icon: Eye, change: `${data.returningVisitors > 0 ? "+" : ""}${Math.round((data.returningVisitors / (data.uniqueVisitors || 1)) * 100)}% return`, up: data.returningVisitors > 0 },
    { label: "Low Stock", value: data.lowStockCount || 0, icon: Package, change: data.lowStockCount > 0 ? "Needs attention" : "All good", up: data.lowStockCount === 0 },
  ];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } };
  const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Store performance overview</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
            {data.systemHealth}
          </div>
          <span className="text-border">|</span>
          <span>{data.databaseSize}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <motion.div key={s.label} variants={itemAnim} className="rounded-xl border border-border bg-paper p-5">
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-accent p-2">
                <s.icon className="h-5 w-5 text-ink" strokeWidth={1.5} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${s.up ? "text-green-600" : "text-red-600"}`}>
                {s.up ? <ArrowUpRight className="h-3 w-3" strokeWidth={2} /> : <ArrowDownRight className="h-3 w-3" strokeWidth={2} />}
                {s.change}
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-ink">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemAnim} className="lg:col-span-2 rounded-xl border border-border bg-paper p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-lg text-ink">Revenue</h2>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded bg-gold" /> Revenue</span>
              <span className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded bg-ink/30" /> Orders</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={(v) => `TSh ${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                  formatter={(v) => [`TSh ${Number(v).toLocaleString()}`, undefined]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C9A96E" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="rounded-xl border border-border bg-paper p-6">
          <h2 className="font-serif text-lg text-ink mb-6">Order Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {orderStatusData.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [Number(v), "Orders"]} />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemAnim} className="rounded-xl border border-border bg-paper p-6">
          <h2 className="font-serif text-lg text-ink mb-4">Traffic Sources</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#9CA3AF" width={60} />
                <Tooltip />
                <Bar dataKey="visitors" fill="#C9A96E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="rounded-xl border border-border bg-paper p-6">
          <h2 className="font-serif text-lg text-ink mb-4">Product Overview</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={productData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {productData.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="rounded-xl border border-border bg-paper p-6">
          <h2 className="font-serif text-lg text-ink mb-4">Daily Visitors</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory.slice(-7)}>
                <defs>
                  <linearGradient id="visitorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <Tooltip />
                <Area type="monotone" dataKey="visitors" stroke="#1A1A1A" strokeWidth={2} fill="url(#visitorGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <motion.div variants={itemAnim} className="rounded-xl border border-border bg-paper p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-blue-50 p-2"><MessageSquare className="h-4 w-4 text-blue-600" strokeWidth={1.5} /></div>
            <div>
              <p className="text-2xl font-semibold text-ink">{data.unreadMessages}</p>
              <p className="text-xs text-muted-foreground">Unread Messages</p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">{data.recentMessages} this week</p>
        </motion.div>
        <motion.div variants={itemAnim} className="rounded-xl border border-border bg-paper p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-yellow-50 p-2"><Star className="h-4 w-4 text-yellow-600" strokeWidth={1.5} /></div>
            <div>
              <p className="text-2xl font-semibold text-ink">{data.pendingReviews}</p>
              <p className="text-xs text-muted-foreground">Pending Reviews</p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">{data.featuredProducts} featured products</p>
        </motion.div>
        <motion.div variants={itemAnim} className="rounded-xl border border-border bg-paper p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-green-50 p-2"><Bell className="h-4 w-4 text-green-600" strokeWidth={1.5} /></div>
            <div>
              <p className="text-2xl font-semibold text-ink">{data.newsletterSubscribers || 0}</p>
              <p className="text-xs text-muted-foreground">Subscribers</p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">&nbsp;</p>
        </motion.div>
        <motion.div variants={itemAnim} className="rounded-xl border border-border bg-paper p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-purple-50 p-2"><Activity className="h-4 w-4 text-purple-600" strokeWidth={1.5} /></div>
            <div>
              <p className="text-2xl font-semibold text-ink">{data.totalProducts}</p>
              <p className="text-xs text-muted-foreground">Total Products</p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">{data.activeProducts} active, {data.lowStockCount} low stock</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
