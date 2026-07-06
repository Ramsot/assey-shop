"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Search, Eye } from "lucide-react";

export default function SEOPage() {
  const [form, setForm] = useState({
    metaTitle: "ASSEY Atelier — Luxury African Fashion",
    metaDescription: "Discover ASSEY Atelier, a Tanzanian luxury fashion brand blending traditional African craftsmanship with contemporary design.",
    ogTitle: "ASSEY Atelier — Luxury African Fashion",
    ogDescription: "Discover ASSEY Atelier, luxury African fashion brand from Tanzania.",
    ogImage: "",
    ogType: "website",
    twitterCard: "summary_large_image",
    canonicalUrl: "https://asseyatelier.com",
    robotsTxt: "index, follow",
    googleAnalyticsId: "",
    googleTagManagerId: "",
    facebookPixelId: "",
    schemaMarkup: "",
    sitemapEnabled: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        <h1 className="font-serif text-3xl font-medium text-ink">SEO Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Search engine optimization settings</p>
      </div>

      <motion.form variants={item} onSubmit={handleSubmit} className="rounded-xl border border-border bg-paper p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="font-serif text-lg text-ink flex items-center gap-2"><Search className="h-4 w-4" strokeWidth={1.5} /> Meta Tags</h2>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Meta Title</label>
            <input type="text" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
            <p className="mt-1 text-[10px] text-muted-foreground">{form.metaTitle.length} characters</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Meta Description</label>
            <textarea rows={3} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Canonical URL</label>
            <input type="text" value={form.canonicalUrl} onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Robots</label>
            <select value={form.robotsTxt} onChange={(e) => setForm({ ...form, robotsTxt: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold">
              <option value="index, follow">index, follow</option>
              <option value="noindex, follow">noindex, follow</option>
              <option value="index, nofollow">index, nofollow</option>
              <option value="noindex, nofollow">noindex, nofollow</option>
            </select>
          </div>
        </div>

        <div className="border-t border-border pt-6 space-y-4">
          <h2 className="font-serif text-lg text-ink flex items-center gap-2"><Eye className="h-4 w-4" strokeWidth={1.5} /> Open Graph</h2>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">OG Title</label>
            <input type="text" value={form.ogTitle} onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">OG Description</label>
            <textarea rows={2} value={form.ogDescription} onChange={(e) => setForm({ ...form, ogDescription: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">OG Image URL</label>
            <input type="text" value={form.ogImage} onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">OG Type</label>
            <select value={form.ogType} onChange={(e) => setForm({ ...form, ogType: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold">
              <option value="website">website</option>
              <option value="article">article</option>
              <option value="product">product</option>
            </select>
          </div>
        </div>

        <div className="border-t border-border pt-6 space-y-4">
          <h2 className="font-serif text-lg text-ink">Tracking & Analytics</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Google Analytics ID</label>
              <input type="text" value={form.googleAnalyticsId} onChange={(e) => setForm({ ...form, googleAnalyticsId: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Google Tag Manager ID</label>
              <input type="text" value={form.googleTagManagerId} onChange={(e) => setForm({ ...form, googleTagManagerId: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Facebook Pixel ID</label>
              <input type="text" value={form.facebookPixelId} onChange={(e) => setForm({ ...form, facebookPixelId: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 space-y-4">
          <h2 className="font-serif text-lg text-ink">Schema & Advanced</h2>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Schema Markup (JSON-LD)</label>
            <textarea rows={6} value={form.schemaMarkup} onChange={(e) => setForm({ ...form, schemaMarkup: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold font-mono" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.sitemapEnabled} onChange={(e) => setForm({ ...form, sitemapEnabled: e.target.checked })}
              className="rounded border-border text-ink focus:ring-gold" />
            <span className="text-sm text-ink">Enable XML Sitemap</span>
          </label>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50 transition-colors">
            <Save className="h-4 w-4" strokeWidth={1.5} />
            {saving ? "Saving..." : "Save SEO Settings"}
          </button>
          {saved && <span className="text-xs text-green-600">Settings saved!</span>}
        </div>
      </motion.form>
    </motion.div>
  );
}
