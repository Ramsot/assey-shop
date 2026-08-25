"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { apiFetch } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavMenu {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  itemsCount: number;
  createdAt: string;
}

export default function NavigationMenuPage() {
  const [menus, setMenus] = useState<NavMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchMenus = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError("");
    try {
      const json = await apiFetch<{ success: boolean; data: NavMenu[]; error?: string }>("/admin/api/navigation", { signal: controller.signal });
      if (json.success) setMenus(json.data);
      else setError(json.error || "Failed to load");
    } catch {
      setError("Failed to load navigation menus");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMenus(); }, [fetchMenus]);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const handleToggle = async (id: string, current: boolean) => {
    setTogglingId(id);
    try {
      await apiFetch(`/admin/api/navigation/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      fetchMenus();
    } catch {
      // handle error
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu?")) return;
    setDeletingId(id);
    try {
      await apiFetch(`/admin/api/navigation/${id}`, { method: "DELETE" });
      fetchMenus();
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
          <h1 className="font-serif text-3xl font-medium text-ink">Navigation Menus</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage navigation menus</p>
        </div>
        <Button disabled className="opacity-50">
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Add Menu
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-border bg-paper overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Items</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : menus.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No menus found</td></tr>
              ) : (
                menus.map((m, i) => (
                  <motion.tr key={m.id} variants={item}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">{m.name}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{m.location}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.itemsCount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${m.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"}`}>
                        {m.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" aria-label="Edit menu" asChild>
                          <Link href={`/admin/navigation/${m.id}/edit`}>
                            <Edit className="h-4 w-4" strokeWidth={1.5} />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" aria-label={m.isActive ? "Deactivate menu" : "Activate menu"} onClick={() => handleToggle(m.id, m.isActive)} disabled={togglingId === m.id}>
                          {togglingId === m.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                          ) : m.isActive ? (
                            <ToggleRight className="h-4 w-4 text-green-600" strokeWidth={1.5} />
                          ) : (
                            <ToggleLeft className="h-4 w-4" strokeWidth={1.5} />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Delete menu" onClick={() => handleDelete(m.id)} disabled={deletingId === m.id} className="text-red-500 hover:text-red-700">
                          {deletingId === m.id ? (
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
