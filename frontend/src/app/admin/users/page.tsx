"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, ShieldOff, Trash2, UserPlus } from "lucide-react";
import { apiFetch } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch("/admin/api/auth/me")
      .then((r) => r.json())
      .then((res) => { if (res.success) setCurrentUserId(res.data.id); })
      .catch(() => {});
  }, []);

  const fetchUsers = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError("");
    try {
      const json = await apiFetch<{ success: boolean; data: AdminUser[]; error?: string }>("/admin/api/users", { signal: controller.signal });
      if (json.success) setUsers(json.data);
      else setError(json.error || "Failed to load");
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const handleToggleActive = async (id: string, current: boolean) => {
    if (id === currentUserId) {
      if (!confirm("You cannot deactivate your own account. Continue anyway?")) return;
    }
    setActionId(id);
    try {
      await apiFetch(`/admin/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      fetchUsers();
    } catch {
      // handle error
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUserId) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!confirm("Delete this user?")) return;
    setActionId(id);
    try {
      await apiFetch(`/admin/api/users/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch {
      // handle error
    } finally {
      setActionId(null);
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
          <h1 className="font-serif text-3xl font-medium text-ink">Admin Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage admin panel users</p>
        </div>
        <Link href="/admin/users/new"
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 transition-colors">
          <UserPlus className="h-4 w-4" strokeWidth={1.5} />
          New User
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Last Login</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No users found</td></tr>
              ) : (
                users.map((u, i) => (
                  <motion.tr key={u.id} variants={item}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                     <td className="px-4 py-3 font-medium text-ink">
                       {u.name}
                       {u.id === currentUserId && <span className="ml-1.5 rounded bg-gold/20 px-1.5 py-0.25 text-[9px] font-medium text-gold">You</span>}
                     </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-medium text-ink uppercase">{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${u.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"}`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                       <Button variant="ghost" size="icon" aria-label={u.isActive ? "Deactivate user" : "Activate user"} onClick={() => handleToggleActive(u.id, u.isActive)} disabled={actionId === u.id || u.id === currentUserId}>
                         {actionId === u.id ? (
                             <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                           ) : u.isActive ? (
                             <Shield className="h-4 w-4 text-green-600" strokeWidth={1.5} />
                           ) : (
                             <ShieldOff className="h-4 w-4" strokeWidth={1.5} />
                           )}
                       </Button>
                       <Button variant="ghost" size="icon" aria-label="Delete user" onClick={() => handleDelete(u.id)} disabled={actionId === u.id || u.id === currentUserId} className="text-red-500 hover:text-red-700">
                          {actionId === u.id ? (
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
