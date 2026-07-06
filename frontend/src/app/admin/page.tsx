"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Package, ShoppingBag, Users, DollarSign, AlertTriangle,
  Plus, TrendingUp, Clock, Eye, ArrowRight, Star,
  Percent, Mail, MessageSquare, BarChart3, CreditCard,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface DashboardData {
  totalProducts: number; activeProducts: number; totalCollections: number;
  totalCustomers: number; newCustomersThisMonth: number;
  pendingOrders: number; processingOrders: number; deliveredOrders: number;
  cancelledOrders: number; totalOrders: number;
  monthlyRevenue: number; totalRevenue: number; averageOrderValue: number;
  websiteVisitors: number; conversionRate: string; lowStockCount: number;
  unreadMessages: number; pendingReviews: number; activeCoupons: number;
  subscriberCount: number;
  recentOrders: { id: string; orderNumber: string; email: string; total: number; status: string; createdAt: string; items: { productName: string }[] }[];
  lowStockProducts: { id: string; name: string; sku: string; stockQty: number }[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemAnim = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin/api/analytics")
      .then((r) => r.json())
      .then((res) => { if (res.success) setData(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-ink" />
          <span className="text-xs text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const d = data || {} as DashboardData;

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={itemAnim} className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening"}. Here&apos;s your store at a glance.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Add Product
        </Link>
      </motion.div>

      <motion.div variants={itemAnim} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Monthly Revenue" value={formatPrice(d.monthlyRevenue || 0)} trend="+12.5%" trendUp color="emerald" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={String(d.totalOrders || 0)} sub={`${d.pendingOrders || 0} pending`} color="blue" />
        <StatCard icon={Users} label="Customers" value={String(d.totalCustomers || 0)} sub={`${d.newCustomersThisMonth || 0} this month`} color="indigo" />
        <StatCard icon={Eye} label="Visitors" value={String(d.websiteVisitors || 0)} sub={`${d.conversionRate || "0%"} conversion`} color="violet" />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemAnim} className="lg:col-span-2 rounded-xl border border-border bg-paper">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Recent Orders</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-ink transition-colors">
              View all <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {(d.recentOrders || []).slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-ink hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{order.email}</td>
                    <td className="px-5 py-3 text-muted-foreground">{order.items?.length || 0} items</td>
                    <td className="px-5 py-3 font-medium text-ink">{formatPrice(order.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusColor[order.status] || "bg-accent text-muted-foreground"}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!d.recentOrders || d.recentOrders.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground text-xs">No orders yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="space-y-4">
          <div className="rounded-xl border border-border bg-paper p-5">
            <h2 className="text-sm font-semibold text-ink">Quick Actions</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <QuickAction href="/admin/products/new" icon={Plus} label="New Product" color="ink" />
              <QuickAction href="/admin/coupons/new" icon={Percent} label="New Coupon" color="gold" />
              <QuickAction href="/admin/newsletter" icon={Mail} label="Newsletter" color="blue" />
              <QuickAction href="/admin/messages" icon={MessageSquare} label="Messages" color="emerald" />
            </div>
          </div>

          {(d.lowStockCount || 0) > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
                <h2 className="text-sm font-semibold">Low Stock Alert</h2>
              </div>
              <p className="mt-1 text-xs text-amber-700">{d.lowStockCount} products running low</p>
              <div className="mt-3 space-y-1.5">
                {(d.lowStockProducts || []).slice(0, 3).map((p) => (
                  <Link key={p.id} href={`/admin/products/${p.id}/edit`} className="flex items-center justify-between rounded-lg bg-amber-100/50 px-3 py-1.5 text-xs hover:bg-amber-100 transition-colors">
                    <span className="text-amber-900 font-medium">{p.name}</span>
                    <span className="text-amber-600">{p.stockQty} left</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-paper p-5">
            <h2 className="text-sm font-semibold text-ink">At a Glance</h2>
            <div className="mt-4 space-y-3">
              <GlanceRow icon={Star} label="Pending Reviews" value={d.pendingReviews || 0} />
              <GlanceRow icon={MessageSquare} label="Unread Messages" value={d.unreadMessages || 0} />
              <GlanceRow icon={Percent} label="Active Coupons" value={d.activeCoupons || 0} />
              <GlanceRow icon={Mail} label="Subscribers" value={d.subscriberCount || 0} />
              <GlanceRow icon={CreditCard} label="Avg. Order Value" value={formatPrice(d.averageOrderValue || 0)} />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, sub, trend, trendUp, color }: {
  icon: React.ElementType; label: string; value: string;
  sub?: string; trend?: string; trendUp?: boolean; color: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", iconBg: "bg-emerald-100 text-emerald-600" },
    blue: { bg: "bg-blue-50", text: "text-blue-700", iconBg: "bg-blue-100 text-blue-600" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-700", iconBg: "bg-indigo-100 text-indigo-600" },
    violet: { bg: "bg-violet-50", text: "text-violet-700", iconBg: "bg-violet-100 text-violet-600" },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className={`rounded-xl border border-border ${c.bg} p-5 transition-all hover:shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className={`rounded-lg ${c.iconBg} p-2.5`}>
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
            <TrendingUp className="h-3 w-3" strokeWidth={2} />
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, color }: { href: string; icon: React.ElementType; label: string; color: string }) {
  const colorMap: Record<string, string> = {
    ink: "bg-ink text-paper hover:bg-ink/90",
    gold: "bg-gold/20 text-gold hover:bg-gold/30",
    blue: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    emerald: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  };
  return (
    <Link href={href} className={`flex flex-col items-center gap-1.5 rounded-lg p-3 text-center transition-all ${colorMap[color] || colorMap.ink}`}>
      <Icon className="h-4 w-4" strokeWidth={1.5} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

function GlanceRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="text-xs font-medium text-ink">{value}</span>
    </div>
  );
}
