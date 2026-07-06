"use client";

import { Download } from "lucide-react";

interface AnalyticsExportProps {
  stats: { label: string; value: string; change: string; trending: string }[];
  revenueData: { name: string; revenue: number }[];
}

export function AnalyticsExport(_props: AnalyticsExportProps) {
  const handleExport = () => {
    const { format } = require("date-fns");
    const rows = _props.revenueData.map((d) => [d.name, d.revenue.toString()]);
    const statsRows = _props.stats.map((s) => [s.label, s.value, s.change]);

    const csvContent = [
      "Metric,Value,Change",
      ...statsRows.map((r) => r.join(",")),
      "",
      "Day,Revenue (TZS)",
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all text-sm font-bold shadow-lg shadow-blue-600/20"
    >
      <Download className="w-4 h-4" />
      Export Report
    </button>
  );
}
