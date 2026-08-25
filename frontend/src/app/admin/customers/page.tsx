"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, Eye, Trash2, Download, Users, ShoppingBag, DollarSign, AlertTriangle } from "lucide-react";
import { apiFetch } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CustomerItem {
  id: string; email: string; firstName: string; lastName: string; phone: string;
  isSuspended: boolean; totalSpent: number; ordersCount: number; createdAt: string;
  _count: { orders: number; reviews: number };
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "suspended">("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchCustomers = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);
      if (statusFilter === "suspended") params.set("suspended", "true");
      if (statusFilter === "active") params.set("suspended", "false");
      const json = await apiFetch<{ success: boolean; data: CustomerItem[]; total: number; totalPages: number }>(`/admin/api/customers?${params}`, { signal: controller.signal });
      if (json.success) { setCustomers(json.data); setTotal(json.total); setTotalPages(json.totalPages); }
    } catch {
      // Ignore abort errors
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchCustomers(); };
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    setDeletingId(id);
    try {
      await apiFetch(`/admin/api/customers/${id}`, { method: "DELETE" });
      fetchCustomers();
    } catch {
      // handle error
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Orders", "Total Spent", "Status", "Joined"];
    const rows = customers.map((c) => [
      `${c.firstName} ${c.lastName}`,
      c.email,
      c.phone || "",
      String(c.ordersCount || c._count?.orders || 0),
      String(c.totalSpent || 0),
      c.isSuspended ? "Suspended" : "Active",
      new Date(c.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeCount = customers.filter((c) => !c.isSuspended).length;
  const suspendedCount = customers.filter((c) => c.isSuspended).length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const totalOrders = customers.reduce((sum, c) => sum + (c.ordersCount || c._count?.orders || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} total customers</p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4" strokeWidth={1.5} />
          Export CSV
        </Button>
      </div>

      {customers.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Active", value: String(activeCount), icon: Users, color: "text-green-600" },
            { label: "Suspended", value: String(suspendedCount), icon: AlertTriangle, color: "text-red-500" },
            { label: "Total Orders", value: String(totalOrders), icon: ShoppingBag, color: "text-blue-600" },
            { label: "Total Revenue", value: `TSh ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-gold" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-paper px-4 py-3 flex items-center gap-3">
              <s.icon className={`h-5 w-5 flex-shrink-0 ${s.color}`} strokeWidth={1.5} />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-0.5 text-lg font-semibold text-ink">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-paper py-2.5 pl-10 pr-4 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
        </form>
        <div className="flex gap-1 rounded-xl border border-border bg-paper p-1">
          {(["", "active", "suspended"] as const).map((f) => (
            <Button key={f} variant="ghost" size="sm" onClick={() => { setStatusFilter(f); setPage(1); }} className={statusFilter === f ? "bg-ink text-paper" : ""}>
              {f === "" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-paper overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Total Spent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No customers found</td></tr>
              ) : (
                customers.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-medium text-ink">
                          {(c.firstName?.[0] || c.email[0]).toUpperCase()}
                        </div>
                        <span className="font-medium text-ink">{c.firstName} {c.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.ordersCount || c._count?.orders || 0}</td>
                    <td className="px-4 py-3 font-medium text-ink">TSh {(c.totalSpent || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {c.isSuspended ? (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-medium text-red-700">Suspended</span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-medium text-green-700">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" aria-label="View customer" onClick={() => router.push(`/admin/customers/${c.id}`)}>
                          <Eye className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Delete customer" onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} className="text-red-500 hover:text-red-700">
                          {deletingId === c.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                          )}
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
