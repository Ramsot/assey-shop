"use client";

import { useState, useTransition } from "react";
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Trash2,
  Copy,
  Package,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface VouchersClientProps {
  initialVouchers: any[];
  total: number;
  packages: any[];
}

export function VouchersClient({ initialVouchers, total, packages }: VouchersClientProps) {
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [totalCount, setTotalCount] = useState(total);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkPackage, setBulkPackage] = useState(packages[0]?.id || "");
  const [bulkRouter, setBulkRouter] = useState("");
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch =
      v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.user?.phoneNumber?.includes(searchTerm);
    const matchesPackage = !selectedPackage || v.packageId === selectedPackage;
    return matchesSearch && matchesPackage;
  });

  const handleExportPDF = () => {
    const rows = filteredVouchers.map((v, i) => [
      i + 1,
      v.code,
      v.package?.name || "-",
      v.status,
      v.activatedAt ? format(new Date(v.activatedAt), "yyyy-MM-dd HH:mm") : "-",
    ]);

    const csvContent = [
      ["No.", "Code", "Package", "Status", "Activated At"].join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vouchers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkGenerate = () => {
    setBulkPackage(packages[0]?.id || "");
    setBulkCount(10);
    setBulkRouter("");
    setShowBulkModal(true);
  };

  const confirmBulkGenerate = () => {
    if (!bulkPackage || bulkCount < 1) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/vouchers/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packageId: bulkPackage,
            count: bulkCount,
            routerId: bulkRouter || undefined,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to generate vouchers");
        }
        const data = await res.json();
        setShowBulkModal(false);
        setMessage({ type: "success", text: `${data.count} vouchers generated successfully!` });
        setTimeout(() => setMessage(null), 3000);
        // Refresh by reloading
        window.location.reload();
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Failed to generate vouchers" });
      }
    });
  };

  const handleDeleteVoucher = (id: string) => {
    if (!confirm("Delete this voucher permanently?")) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/vouchers/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete");
        setVouchers(vouchers.filter((v) => v.id !== id));
        setTotalCount((c) => c - 1);
        setMessage({ type: "success", text: "Voucher deleted" });
        setTimeout(() => setMessage(null), 2000);
      } catch {
        setMessage({ type: "error", text: "Failed to delete voucher" });
      }
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setMessage({ type: "success", text: `Copied: ${code}` });
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <div className="space-y-8">
      {message && (
        <div
          className={cn(
            "p-4 rounded-2xl text-sm font-medium border",
            message.type === "success"
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          )}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Voucher Management</h1>
          <p className="text-white/50 text-sm">Generate and monitor internet access codes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handleBulkGenerate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all text-sm font-bold shadow-lg shadow-blue-600/20"
          >
            <Layers className="w-4 h-4" />
            Bulk Generate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Total Vouchers",
            value: totalCount.toString(),
            icon: Ticket,
            color: "text-blue-500",
          },
          {
            label: "Active Now",
            value: vouchers.filter((v) => v.status === "ACTIVE").length.toString(),
            icon: CheckCircle2,
            color: "text-green-500",
          },
          {
            label: "Pending",
            value: vouchers.filter((v) => v.status === "PENDING").length.toString(),
            icon: Clock,
            color: "text-amber-500",
          },
          {
            label: "Expired",
            value: vouchers.filter((v) => v.status === "EXPIRED").length.toString(),
            icon: XCircle,
            color: "text-red-500",
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/5">
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-white/50 text-xs font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
                <h3 className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 border border-white/10 p-4 rounded-2xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search by code or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:border-blue-500/50 transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            className="flex-1 md:flex-none bg-[#1a1a1a] border border-white/10 rounded-xl py-2.5 px-4 outline-none text-sm cursor-pointer hover:bg-white/10 transition-all text-white"
          >
            <option value="">All Packages</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <Filter className="w-5 h-5 text-white/50" />
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">
                  Code
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">
                  Package
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">
                  User
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">
                  Activated At
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredVouchers.length > 0 ? (
                filteredVouchers.map((voucher) => (
                  <tr
                    key={voucher.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-400">{voucher.code}</span>
                        <button
                          onClick={() => handleCopyCode(voucher.code)}
                          className="p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy code"
                        >
                          <Copy className="w-3 h-3 text-white/40" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{voucher.package?.name}</span>
                        <span className="text-[10px] text-white/30 uppercase tracking-widest">
                          {voucher.package?.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          voucher.status === "ACTIVE"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : voucher.status === "PENDING"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                        )}
                      >
                        {voucher.status === "ACTIVE" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : voucher.status === "PENDING" ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {voucher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">
                      {voucher.user?.email || voucher.user?.phoneNumber || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">
                      {voucher.activatedAt
                        ? format(new Date(voucher.activatedAt), "MMM d, HH:mm")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleCopyCode(voucher.code)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                          title="Copy code"
                        >
                          <Copy className="w-4 h-4 text-white/30" />
                        </button>
                        <button
                          onClick={() => handleDeleteVoucher(voucher.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400"
                          title="Delete voucher"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/10 transition-all">
                          <MoreVertical className="w-5 h-5 text-white/30" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-white/30 text-sm italic"
                  >
                    No vouchers found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showBulkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              Bulk Generate Vouchers
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-white/30 uppercase tracking-wider ml-1 block mb-1.5">
                  Package
                </label>
                <select
                  value={bulkPackage}
                  onChange={(e) => setBulkPackage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500/50 transition-all text-sm"
                >
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {Number(p.price).toLocaleString()} TZS
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-white/30 uppercase tracking-wider ml-1 block mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={bulkCount}
                  onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500/50 transition-all text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/30 uppercase tracking-wider ml-1 block mb-1.5">
                  Router ID (optional)
                </label>
                <input
                  type="text"
                  value={bulkRouter}
                  onChange={(e) => setBulkRouter(e.target.value)}
                  placeholder="Leave empty for any router"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500/50 transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowBulkModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkGenerate}
                disabled={isPending || !bulkPackage}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Generate {bulkCount}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
