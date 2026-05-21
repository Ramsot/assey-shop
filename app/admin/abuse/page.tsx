import { getAbuseReports } from "@/modules/admin/admin.actions";
import { 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  CheckCircle2,
  Trash2,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default async function AbuseReportsPage() {
  const reports = await getAbuseReports();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Security & Abuse Reports</h1>
          <p className="text-white/50 text-sm">Monitor suspicious activity and bypass attempts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm font-bold">
          <Trash2 className="w-4 h-4" />
          Clear All Logs
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Severity</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Details</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Device/IP</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        report.severity === "HIGH" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        report.severity === "MEDIUM" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      )}>
                        {report.severity === "HIGH" ? <AlertTriangle className="w-3 h-3" /> :
                         report.severity === "MEDIUM" ? <Info className="w-3 h-3" /> :
                         <ShieldAlert className="w-3 h-3" />}
                        {report.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-white/90">{report.type.replace(/_/g, " ")}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white/50 max-w-xs truncate">{report.details}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-blue-400">{report.macAddress || "-"}</span>
                        <span className="text-[10px] text-white/30 font-mono">{report.ipAddress || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">
                      {format(new Date(report.createdAt), "MMM d, HH:mm")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {report.isResolved ? (
                        <span className="text-green-400 inline-flex items-center gap-1 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          Resolved
                        </span>
                      ) : (
                        <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-4">
                          Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/30">
                    <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p>No abuse reports found. Your network is safe!</p>
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
