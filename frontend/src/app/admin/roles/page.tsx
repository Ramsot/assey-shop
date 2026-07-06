"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Shield } from "lucide-react";

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

  const fetchRoles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/admin/api/roles");
      const json = await res.json();
      if (json.success) setRoles(json.data);
      else setError(json.error || "Failed to load");
    } catch {
      setError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this role?")) return;
    await fetch(`/admin/api/roles/${id}`, { method: "DELETE" });
    fetchRoles();
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
                        <button
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors"><Edit className="h-4 w-4" strokeWidth={1.5} /></button>
                        {!r.isSystem && (
                          <button onClick={() => handleDelete(r.id)}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" strokeWidth={1.5} /></button>
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
