"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewNavigationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", location: "header", items: "", isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let items = [];
      try { items = JSON.parse(form.items || "[]"); }
      catch { alert("Items must be valid JSON"); setLoading(false); return; }

      const res = await fetch("/admin/api/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/admin/navigation");
        router.refresh();
      } else {
        alert(json.error || "Failed to create navigation");
      }
    } catch { alert("Error creating navigation"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/navigation" className="rounded-xl p-2 text-muted-foreground hover:bg-accent transition-colors">
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">New Navigation Menu</h1>
          <p className="text-sm text-muted-foreground">Create a new navigation menu</p>
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
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Location</label>
            <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold">
              <option value="header">Header</option>
              <option value="footer">Footer</option>
              <option value="sidebar">Sidebar</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">
            Items <span className="text-muted-foreground normal-case font-normal">(JSON array)</span>
          </label>
          <textarea rows={10} value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })}
            placeholder='[{"label":"Home","url":"/","children":[]}]'
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold font-mono" />
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
            {loading ? "Saving..." : "Save Navigation"}
          </button>
          <Link href="/admin/navigation"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-ink hover:bg-accent transition-colors">
            Cancel
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
