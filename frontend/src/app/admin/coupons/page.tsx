"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { apiFetch } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  usageCount: number;
  maxUses: number | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchCoupons = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError("");
    try {
      const json = await apiFetch<{ success: boolean; data: Coupon[]; error?: string }>("/admin/api/coupons", { signal: controller.signal });
      if (json.success) setCoupons(json.data);
      else setError(json.error || "Failed to load");
    } catch {
      setError("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const handleToggle = async (id: string, current: boolean) => {
    setTogglingId(id);
    try {
      await apiFetch(`/admin/api/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      fetchCoupons();
    } catch {
      // handle error
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    setDeletingId(id);
    try {
      await apiFetch(`/admin/api/coupons/${id}`, { method: "DELETE" });
      fetchCoupons();
    } catch {
      // handle error
    } finally {
      setDeletingId(null);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">Coupons</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage discount coupons</p>
        </div>
        <Link href="/admin/coupons/new"
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 transition-colors">
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Add Coupon
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-border bg-paper overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Discount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Usage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Expires</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No coupons found</td></tr>
              ) : (
                coupons.map((c, i) => (
                  <motion.tr key={c.id} variants={item}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-ink">{c.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-ink font-medium">
                        {c.discountType === "percentage" ? `${c.discountValue}%` : `TSh ${c.discountValue.toLocaleString()}`}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-1">({c.discountType})</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.usageCount}{c.maxUses ? ` / ${c.maxUses}` : ""}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${c.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"}`}>
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" aria-label={c.isActive ? "Deactivate coupon" : "Activate coupon"} onClick={() => handleToggle(c.id, c.isActive)} disabled={togglingId === c.id}>
                          {togglingId === c.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                          ) : c.isActive ? (
                            <ToggleRight className="h-4 w-4 text-green-600" strokeWidth={1.5} />
                          ) : (
                            <ToggleLeft className="h-4 w-4" strokeWidth={1.5} />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Delete coupon" onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} className="text-red-500 hover:text-red-700">
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
    </motion.div>
  );
}
