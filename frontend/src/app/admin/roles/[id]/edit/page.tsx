"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch(`/admin/api/roles/${params.id}`);
        const json = await res.json();
        if (json.success) {
          const r = json.data;
          setForm({
            name: r.name || "",
            description: r.description || "",
          });
        } else {
          alert(json.error || "Failed to load role");
        }
      } catch {
        alert("Error loading role");
      } finally {
        setFetching(false);
      }
    };
    fetchRole();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/admin/api/roles/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/admin/roles");
        router.refresh();
      } else {
        alert(json.error || "Failed to update role");
      }
    } catch { alert("Error updating role"); }
    finally { setLoading(false); }
  };

  if (fetching) return (
    <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/roles" className="rounded-xl p-2 text-muted-foreground hover:bg-accent transition-colors">
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">Edit Role</h1>
          <p className="text-sm text-muted-foreground">Update role details</p>
        </div>
      </div>

      <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-paper p-6 space-y-6">

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Name *</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50 transition-colors">
            <Save className="h-4 w-4" strokeWidth={1.5} />
            {loading ? "Saving..." : "Update Role"}
          </button>
          <Link href="/admin/roles"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-ink hover:bg-accent transition-colors">
            Cancel
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
