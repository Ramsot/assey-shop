"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Edit, Trash2, Shield } from "lucide-react";
import { apiFetch } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Role {
  id: string;
  name: string;
  description: string;
  permissionsCount: number;
  isSystem: boolean;
  createdAt: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchRoles = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError("");
    try {
      const json = await apiFetch<{ success: boolean; data: Role[]; error?: string }>("/admin/api/roles", { signal: controller.signal });
      if (json.success) setRoles(json.data);
      else setError(json.error || "Failed to load");
    } catch {
      setError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this role?")) return;
    setDeletingId(id);
    try {
      await apiFetch(`/admin/api/roles/${id}`, { method: "DELETE" });
      fetchRoles();
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
      <div>
        <h1 className="font-serif text-3xl font-medium text-ink">Roles</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage user roles and permissions</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-border bg-paper overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Role Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Permissions</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">System</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : roles.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No roles found</td></tr>
              ) : (
                roles.map((r, i) => (
                  <motion.tr key={r.id} variants={item}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                        <span className="font-medium text-ink">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{r.description}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-medium text-ink">{r.permissionsCount}</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.isSystem ? (
                        <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-[10px] font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">System</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Custom</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" aria-label="Edit role" asChild>
                          <Link href={`/admin/roles/${r.id}/edit`}>
                            <Edit className="h-4 w-4" strokeWidth={1.5} />
                          </Link>
                        </Button>
                        {!r.isSystem && (
                          <Button variant="ghost" size="icon" aria-label="Delete role" onClick={() => handleDelete(r.id)} disabled={deletingId === r.id} className="text-red-500 hover:text-red-700">
                            {deletingId === r.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                            ) : (
                              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                            )}
                          </Button>
                        )}
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
