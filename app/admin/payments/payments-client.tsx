"use client";

import { useState } from "react";
import {
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface PaymentsClientProps {
  initialPayments: any[];
}

export function PaymentsClient({ initialPayments }: PaymentsClientProps) {
  const [payments, setPayments] = useState(initialPayments);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPayments = payments.filter((payment) =>
    payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.user?.phoneNumber?.includes(searchTerm)
  );

  const completedCount = payments.filter(
    (p) => p.status === "SUCCESS" || p.status === "COMPLETED"
  ).length;
  const pendingCount = payments.filter((p) => p.status === "PENDING").length;
  const failedCount = payments.filter((p) => p.status === "FAILED").length;
  const totalRevenue = payments
    .filter((p) => p.status === "SUCCESS" || p.status === "COMPLETED")
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-white/50 text-sm">Monitor revenue and payment statuses</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:border-blue-500/50 transition-all text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: `${totalRevenue.toLocaleString()} TZS`, icon: CreditCard, color: "text-green-500" },
          { label: "Completed", value: completedCount.toString(), icon: CheckCircle2, color: "text-green-500" },
          { label: "Pending", value: pendingCount.toString(), icon: Clock, color: "text-amber-500" },
          { label: "Failed", value: failedCount.toString(), icon: XCircle, color: "text-red-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/5">
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-white/50 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                <h3 className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Reference</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Package</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-blue-400">{payment.reference}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/70">
                        {payment.user?.email || payment.user?.phoneNumber || payment.phoneNumber || "Guest"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">
                      {payment.package?.name || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold">{Number(payment.amount).toLocaleString()} {payment.currency}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          payment.status === "SUCCESS" || payment.status === "COMPLETED"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : payment.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                        )}
                      >
                        {payment.status === "SUCCESS" || payment.status === "COMPLETED" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : payment.status === "PENDING" ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">
                      {format(new Date(payment.createdAt), "MMM d, HH:mm")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/30 text-sm italic">
                    No transactions found matching your search.
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
