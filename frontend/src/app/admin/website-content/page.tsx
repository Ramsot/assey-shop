"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, FileCode, Globe } from "lucide-react";

interface ContentPage {
  id: string;
  key: string;
  title: string;
  content: string;
  updatedAt: string;
}

const defaultPages: ContentPage[] = [
  { id: "about", key: "about_us", title: "About Us", content: "Welcome to ASSEY Atelier, where African heritage meets contemporary luxury fashion.", updatedAt: "" },
  { id: "shipping", key: "shipping_info", title: "Shipping Information", content: "We offer worldwide shipping with tracking on all orders.", updatedAt: "" },
  { id: "returns", key: "returns_policy", title: "Returns & Exchanges", content: "We accept returns within 14 days of delivery for unused items.", updatedAt: "" },
  { id: "faq", key: "faq_content", title: "FAQ", content: "Frequently asked questions about our products and services.", updatedAt: "" },
  { id: "terms", key: "terms_conditions", title: "Terms & Conditions", content: "Please read these terms carefully before using our website.", updatedAt: "" },
  { id: "privacy", key: "privacy_policy", title: "Privacy Policy", content: "Your privacy is important to us. This policy outlines how we handle your data.", updatedAt: "" },
  { id: "hero", key: "hero_text", title: "Hero Section Text", content: "Discover the art of African luxury fashion.", updatedAt: "" },
  { id: "footer", key: "footer_text", title: "Footer Copyright", content: "© 2026 ASSEY Atelier. All rights reserved.", updatedAt: "" },
];

export default function WebsiteContentPage() {
  const [pages, setPages] = useState<ContentPage[]>(defaultPages);
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/admin/api/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.content) {
          const content = res.data.content;
          const merged = defaultPages.map((dp) => {
            return { ...dp, content: content[dp.key] ?? dp.content };
          });
          setPages(merged);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (page: ContentPage) => {
    setEditing(page.id);
    setEditContent(page.content);
  };

  const handleSave = async (page: ContentPage) => {
    setSaving(true);
    try {
      const res = await fetch("/admin/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulk: [{ key: page.key, value: editContent, group: "content" }] }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to save content");
      setPages(pages.map((p) => p.id === page.id ? { ...p, content: editContent } : p));
      setEditing(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving content");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-ink" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium text-ink">Website Content</h1>
        <p className="mt-1 text-sm text-muted-foreground">Edit text content across your website</p>
      </div>

      {saved && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">Content saved successfully!</div>
      )}

      <div className="grid gap-4">
        {pages.map((page, i) => (
          <motion.div key={page.id} variants={item}
            className="rounded-xl border border-border bg-paper overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => handleEdit(page)}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent p-2">
                  <FileCode className="h-4 w-4 text-ink" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{page.title}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{page.key}</p>
                </div>
              </div>
              {!editing || editing !== page.id ? (
                <span className="text-xs text-muted-foreground">Click to edit</span>
              ) : null}
            </div>
            {editing === page.id && (
              <div className="border-t border-border px-5 py-4 space-y-3">
                <textarea rows={6} value={editContent} onChange={(e) => setEditContent(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
                <div className="flex gap-2">
                  <button onClick={() => handleSave(page)} disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2 text-xs font-medium text-paper hover:bg-ink/90 disabled:opacity-50 transition-colors">
                    <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setEditing(null)}
                    className="rounded-xl border border-border px-5 py-2 text-xs font-medium text-ink hover:bg-accent transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
