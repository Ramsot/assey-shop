import { getVouchers, getPackages } from "@/modules/admin/admin.actions";
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter, 
  Download,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default async function VouchersPage() {
  const { vouchers, total } = await getVouchers();
  const packages = await getPackages();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Voucher Management</h1>
          <p className="text-white/50 text-sm">Generate and monitor internet access codes</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all text-sm font-bold shadow-lg shadow-blue-600/20">
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
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:border-blue-500/50 transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select className="flex-1 md:flex-none bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none text-sm cursor-pointer hover:bg-white/10 transition-all">
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
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Expires At</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vouchers.length > 0 ? (
                vouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-blue-400">{voucher.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{voucher.package.name}</span>
                        <span className="text-xs text-white/30">{voucher.package.speedLimitDown} / {voucher.package.speedLimitUp}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                        voucher.status === "ACTIVE" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                        voucher.status === "PENDING" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20"
                      )}>
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          voucher.status === "ACTIVE" ? "bg-green-400" :
                          voucher.status === "PENDING" ? "bg-blue-400" :
                          "bg-red-400"
                        )} />
                        {voucher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">
                      {voucher.activatedAt ? format(new Date(voucher.activatedAt), "MMM d, HH:mm") : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">
                      {voucher.expiresAt ? format(new Date(voucher.expiresAt), "MMM d, HH:mm") : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-lg hover:bg-white/10 transition-all">
                        <MoreVertical className="w-5 h-5 text-white/30" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/30">
                    <Ticket className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p>No vouchers found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
          <p className="text-xs text-white/30">Showing 1 to {vouchers.length} of {total} vouchers</p>
          <div className="flex items-center gap-2">
            <button disabled className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium disabled:opacity-30">Previous</button>
            <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
