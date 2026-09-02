"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Palette, Eye } from "lucide-react";

const DEFAULTS = {
  primaryColor: "#1a1a2e",
  secondaryColor: "#d4a853",
  accentColor: "#e8e4d9",
  backgroundColor: "#f8f7f4",
  textColor: "#1a1a2e",
  headingFont: "Playfair Display",
  bodyFont: "Inter",
  borderRadius: "12",
  favicon: "",
  logoUrl: "",
  customCss: "",
};

export default function AppearancePage() {
  const [form, setForm] = useState<Record<string, string>>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/admin/api/settings?group=appearance")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.appearance) {
          setForm((prev) => ({ ...prev, ...json.data.appearance }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const bulk = Object.entries(form).map(([key, value]) => ({
        key, value, group: "appearance",
      }));
      const res = await fetch("/admin/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulk }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
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
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium text-ink">Appearance</h1>
        <p className="mt-1 text-sm text-muted-foreground">Customize the admin panel look and feel</p>
      </div>

      <motion.form variants={item} onSubmit={handleSubmit} className="rounded-xl border border-border bg-paper p-6 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Primary Color</label>
            <div className="flex gap-2">
              <input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="h-10 w-10 rounded-lg border border-border cursor-pointer" />
              <input type="text" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold font-mono" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Secondary / Gold Color</label>
            <div className="flex gap-2">
              <input type="color" value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                className="h-10 w-10 rounded-lg border border-border cursor-pointer" />
              <input type="text" value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold font-mono" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Accent Color</label>
            <div className="flex gap-2">
              <input type="color" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                className="h-10 w-10 rounded-lg border border-border cursor-pointer" />
              <input type="text" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold font-mono" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Background Color</label>
            <div className="flex gap-2">
              <input type="color" value={form.backgroundColor} onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                className="h-10 w-10 rounded-lg border border-border cursor-pointer" />
              <input type="text" value={form.backgroundColor} onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold font-mono" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Text Color</label>
            <div className="flex gap-2">
              <input type="color" value={form.textColor} onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                className="h-10 w-10 rounded-lg border border-border cursor-pointer" />
              <input type="text" value={form.textColor} onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold font-mono" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Border Radius (px)</label>
            <input type="number" value={form.borderRadius} onChange={(e) => setForm({ ...form, borderRadius: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Heading Font</label>
            <input type="text" value={form.headingFont} onChange={(e) => setForm({ ...form, headingFont: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Body Font</label>
            <input type="text" value={form.bodyFont} onChange={(e) => setForm({ ...form, bodyFont: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Logo URL</label>
          <input type="text" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Favicon URL</label>
          <input type="text" value={form.favicon} onChange={(e) => setForm({ ...form, favicon: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Custom CSS</label>
          <textarea rows={6} value={form.customCss} onChange={(e) => setForm({ ...form, customCss: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold font-mono" />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50 transition-colors">
            <Save className="h-4 w-4" strokeWidth={1.5} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && <span className="text-xs text-green-600">Changes saved!</span>}
          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
      </motion.form>
    </motion.div>
  );
}
