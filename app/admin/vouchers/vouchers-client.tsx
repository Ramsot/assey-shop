"use client";

import { useState } from "react";
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
  Loader2
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredVouchers = vouchers.filter(v => {
    const matchesSearch = v.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         v.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         v.user?.phoneNumber?.includes(searchTerm);
    const matchesPackage = !selectedPackage || v.packageId === selectedPackage;
    return matchesSearch && matchesPackage;
  });

  const handleExportPDF = () => {
    alert("Exporting PDF... (Feature in development)");
  };

  const handleBulkGenerate = () => {
    alert("Bulk Generate... (Feature in development)");
  };

  return (
    <div className="space-y-8">
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
            Export PDF
          </button>
          <button 
            onClick={handleBulkGenerate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all text-sm font-bold shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            Bulk Generate
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Vouchers", value: total.toString(), icon: Ticket, color: "text-blue-500" },
          { label: "Active Now", value: vouchers.filter(v => v.status === "ACTIVE").length.toString(), icon: CheckCircle2, color: "text-green-500" },
          { label: "Expired", value: vouchers.filter(v => v.status === "EXPIRED").length.toString(), icon: XCircle, color: "text-red-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/5">
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-white/50 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
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
            {packages.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <Filter className="w-5 h-5 text-white/50" />
          </button>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Code</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Package</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Activated At</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredVouchers.length > 0 ? (
                filteredVouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-blue-400">{voucher.code}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{voucher.package.name}</span>
                        <span className="text-[10px] text-white/30 uppercase tracking-widest">{voucher.package.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        voucher.status === "ACTIVE" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                        voucher.status === "PENDING" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20"
                      )}>
                        {voucher.status === "ACTIVE" ? <CheckCircle2 className="w-3 h-3" /> :
                         voucher.status === "PENDING" ? <Clock className="w-3 h-3" /> :
                         <XCircle className="w-3 h-3" />}
                        {voucher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">
                      {voucher.activatedAt ? format(new Date(voucher.activatedAt), "MMM d, HH:mm") : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-lg hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-5 h-5 text-white/30" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/30 text-sm italic">
                    No vouchers found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
