"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface Role {
  id: string;
  name: string;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState({
    name: "", email: "", roleId: "", isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, rolesRes] = await Promise.all([
          fetch(`/admin/api/users/${params.id}`),
          fetch("/admin/api/roles"),
        ]);
        const userJson = await userRes.json();
        const rolesJson = await rolesRes.json();
        if (userJson.success) {
          const u = userJson.data;
          setForm({
            name: u.name || "",
            email: u.email || "",
            roleId: u.roleId || "",
            isActive: u.isActive ?? true,
          });
        } else {
          alert(userJson.error || "Failed to load user");
        }
        if (rolesJson.success) setRoles(rolesJson.data || []);
      } catch {
        alert("Error loading user");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/admin/api/users/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/admin/users");
        router.refresh();
      } else {
        alert(json.error || "Failed to update user");
      }
    } catch { alert("Error updating user"); }
    finally { setLoading(false); }
  };

  if (fetching) return (
    <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="rounded-xl p-2 text-muted-foreground hover:bg-accent transition-colors">
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">Edit User</h1>
          <p className="text-sm text-muted-foreground">Update user details</p>
        </div>
      </div>

      <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-paper p-6 space-y-6">

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Role</label>
            <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold">
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="rounded border-border text-ink focus:ring-gold" />
          <span className="text-sm text-ink">Active</span>
        </label>

        <div className="flex gap-3 pt-4 border-t border-border">
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50 transition-colors">
            <Save className="h-4 w-4" strokeWidth={1.5} />
            {loading ? "Saving..." : "Update User"}
          </button>
          <Link href="/admin/users"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-ink hover:bg-accent transition-colors">
            Cancel
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
