"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, BarChart3, TrendingUp, Users, ShoppingBag, DollarSign, Calendar } from "lucide-react";

const reportDefs = [
  { id: "orders", label: "Order Report", description: "All orders with status, payment, and totals", icon: ShoppingBag },
  { id: "customers", label: "Customer Report", description: "All customers with spend, orders, and status", icon: Users },
  { id: "products", label: "Product Performance", description: "Products with stock, price, and category", icon: BarChart3 },
  { id: "coupons", label: "Coupon Report", description: "All coupons with usage and expiry", icon: TrendingUp },
  { id: "reviews", label: "Reviews Report", description: "All reviews with ratings and status", icon: FileText },
  { id: "newsletter", label: "Subscriber Report", description: "Newsletter subscribers with source and status", icon: DollarSign },
];

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
}

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/admin/api/analytics")
      .then((r) => r.json())
      .then((json) => { if (json.success) setAnalytics(json.data); })
      .catch(() => {});
  }, []);

  const downloadCSV = async (id: string) => {
    setGenerating(id);
    try {
      const res = await fetch(`/admin/api/${id}?pageSize=10000`);
      const json = await res.json();
      if (!json.success || !json.data?.length) { setGenerating(null); return; }

      const rows = json.data;
      const headers = Object.keys(rows[0]).filter((k) => !["_count", "__v"].includes(k));
      const csv = [
        headers.join(","),
        ...rows.map((row: Record<string, unknown>) =>
          headers.map((h) => {
            const v = row[h];
            if (v === null || v === undefined) return "";
            if (typeof v === "object") return `"${JSON.stringify(v).replace(/"/g, '""')}"`;
            return `"${String(v).replace(/"/g, '""')}"`;
          }).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${id}-report-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    setGenerating(null);
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const summaryCards = analytics ? [
    { label: "Total Revenue", value: `TSh ${analytics.totalRevenue.toLocaleString()}` },
    { label: "Total Orders", value: String(analytics.totalOrders) },
    { label: "Avg Order Value", value: `TSh ${Math.round(analytics.avgOrderValue).toLocaleString()}` },
    { label: "Total Customers", value: String(analytics.totalCustomers) },
  ] : [
    { label: "Total Revenue", value: "—" },
    { label: "Total Orders", value: "—" },
    { label: "Avg Order Value", value: "—" },
    { label: "Total Customers", value: "—" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium text-ink">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Generate and download store reports</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((s, i) => (
          <motion.div key={i} variants={item} className="rounded-xl border border-border bg-paper p-5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div variants={item} className="rounded-xl border border-border bg-paper overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-serif text-lg text-ink">Available Reports</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Download reports as CSV or PDF</p>
        </div>
        <div className="divide-y divide-border">
          {reportDefs.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-6 py-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent p-2">
                  <r.icon className="h-5 w-5 text-ink" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </div>
              </div>
              <button onClick={() => downloadCSV(r.id)}
                disabled={generating === r.id}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-medium text-ink hover:bg-accent disabled:opacity-50 transition-colors">
                <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                {generating === r.id ? "Generating..." : "Download CSV"}
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-paper p-5 text-center">
          <Calendar className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-2 text-sm font-medium text-ink">Custom Date Range</p>
          <p className="text-xs text-muted-foreground">Generate reports for specific period</p>
        </div>
        <div className="rounded-xl border border-border bg-paper p-5 text-center">
          <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-2 text-sm font-medium text-ink">Scheduled Reports</p>
          <p className="text-xs text-muted-foreground">Set up automatic report delivery</p>
        </div>
        <div className="rounded-xl border border-border bg-paper p-5 text-center">
          <TrendingUp className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-2 text-sm font-medium text-ink">Export All Data</p>
          <p className="text-xs text-muted-foreground">Full data export in JSON format</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
