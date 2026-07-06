"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, BarChart3, TrendingUp, Users, ShoppingBag, DollarSign, Calendar } from "lucide-react";

const reports = [
  { id: "sales-summary", label: "Sales Summary", description: "Complete sales data with revenue, orders, and refunds", icon: DollarSign },
  { id: "product-performance", label: "Product Performance", description: "Top selling products, inventory turnover, and margins", icon: BarChart3 },
  { id: "customer-report", label: "Customer Report", description: "New vs returning customers, lifetime value, segments", icon: Users },
  { id: "order-report", label: "Order Report", description: "Order volume, status breakdown, fulfillment times", icon: ShoppingBag },
  { id: "traffic-analysis", label: "Traffic Analysis", description: "Visitors, page views, bounce rate, sources", icon: TrendingUp },
  { id: "financial-summary", label: "Financial Summary", description: "Profit & loss, expenses, tax summary", icon: DollarSign },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);

  const handleDownload = (id: string) => {
    setGenerating(id);
    setTimeout(() => {
      setGenerating(null);
    }, 1500);
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const summaryCards = [
    { label: "Total Revenue", value: "TSh 45,678,000", change: "+12.5%", up: true },
    { label: "Total Orders", value: "1,234", change: "+8.3%", up: true },
    { label: "Avg Order Value", value: "TSh 37,000", change: "+3.8%", up: true },
    { label: "Refund Rate", value: "2.1%", change: "-0.3%", up: false },
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
            <span className={`text-xs font-medium ${s.up ? "text-green-600" : "text-red-600"}`}>{s.change}</span>
          </motion.div>
        ))}
      </div>

      <motion.div variants={item} className="rounded-xl border border-border bg-paper overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-serif text-lg text-ink">Available Reports</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Download reports as CSV or PDF</p>
        </div>
        <div className="divide-y divide-border">
          {reports.map((r) => (
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
              <div className="flex gap-2">
                <button onClick={() => handleDownload(r.id)}
                  disabled={generating === r.id}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-medium text-ink hover:bg-accent disabled:opacity-50 transition-colors">
                  <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {generating === r.id ? "Generating..." : "CSV"}
                </button>
                <button onClick={() => handleDownload(r.id)}
                  disabled={generating === r.id}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-medium text-ink hover:bg-accent disabled:opacity-50 transition-colors">
                  <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
                  PDF
                </button>
              </div>
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
