"use client";

import { useState } from "react";
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface PaymentsClientProps {
  initialPayments: any[];
}

export function PaymentsClient({ initialPayments }: PaymentsClientProps) {
  const [payments, setPayments] = useState(initialPayments);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPayments = payments.filter(payment => 
    payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.user?.phoneNumber?.includes(searchTerm)
  );

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

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Reference</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30 text-right">Details</th>
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
                      <span className="text-sm text-white/70">{payment.user?.email || payment.user?.phoneNumber || "Guest"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold">{Number(payment.amount).toLocaleString()} {payment.currency}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        payment.status === "SUCCESS" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                        payment.status === "PENDING" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20"
                      )}>
                        {payment.status === "SUCCESS" ? <CheckCircle2 className="w-3 h-3" /> :
                         payment.status === "PENDING" ? <Clock className="w-3 h-3" /> :
                         <XCircle className="w-3 h-3" />}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">
                      {format(new Date(payment.createdAt), "MMM d, HH:mm")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-lg hover:bg-white/10 transition-all text-white/30 hover:text-white">
                        <ExternalLink className="w-4 h-4" />
                      </button>
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
