"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Layout, EyeOff, Eye, ChevronUp, ChevronDown, Edit3, Plus, Save } from "lucide-react";

interface Section {
  id: string;
  type: string;
  title: string;
  isEnabled: boolean;
  sortOrder: number;
  settings: Record<string, string>;
}

export default function HomepageBuilderPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  const fetchSections = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/admin/api/homepage-sections");
      const json = await res.json();
      if (json.success) setSections(json.data.sort((a: Section, b: Section) => a.sortOrder - b.sortOrder));
      else setError(json.error || "Failed to load");
    } catch {
      setError("Failed to load homepage sections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSections(); }, []);

  const handleToggle = async (id: string, current: boolean) => {
    await fetch(`/admin/api/homepage-sections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isEnabled: !current }),
    });
    fetchSections();
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const idx = sections.findIndex((s) => s.id === id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === sections.length - 1) return;
    const newSections = [...sections];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newSections[idx], newSections[swapIdx]] = [newSections[swapIdx], newSections[idx]];
    newSections.forEach((s, i) => (s.sortOrder = i));
    setSections(newSections);
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      hero: "🖼", features: "✨", products: "🛍", categories: "📁", about: "ℹ️", testimonials: "💬", newsletter: "📧", footer: "🔻",
    };
    return icons[type] || "📄";
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
          <h1 className="font-serif text-3xl font-medium text-ink">Homepage Builder</h1>
          <p className="mt-1 text-sm text-muted-foreground">Arrange and configure homepage sections</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 transition-colors">
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Add Section
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-ink" />
        </div>
      ) : sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-paper p-12">
          <Layout className="mb-4 h-12 w-12 text-muted-foreground" strokeWidth={1} />
          <p className="text-lg font-medium text-ink">No sections configured</p>
          <p className="text-sm text-muted-foreground mt-1">Start building your homepage</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, idx) => (
            <motion.div key={section.id} variants={item}
              className="rounded-xl border border-border bg-paper overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => handleMove(section.id, "up")} disabled={idx === 0}
                    className="rounded p-0.5 text-muted-foreground hover:text-ink disabled:opacity-30 transition-colors">
                    <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                  <button onClick={() => handleMove(section.id, "down")} disabled={idx === sections.length - 1}
                    className="rounded p-0.5 text-muted-foreground hover:text-ink disabled:opacity-30 transition-colors">
                    <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
                <span className="text-lg">{getTypeIcon(section.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{section.title}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{section.type}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditing(editing === section.id ? null : section.id)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors">
                    <Edit3 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => handleToggle(section.id, section.isEnabled)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors">
                    {section.isEnabled ? <Eye className="h-4 w-4 text-green-600" strokeWidth={1.5} /> : <EyeOff className="h-4 w-4" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
              {editing === section.id && (
                <div className="border-t border-border px-5 py-4 bg-background space-y-3">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Object.entries(section.settings || {}).map(([key, val]) => (
                      <div key={key}>
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{key}</label>
                        <input type="text" defaultValue={val}
                          className="w-full rounded-xl border border-border bg-paper px-3 py-2 text-xs text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
                      </div>
                    ))}
                  </div>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-medium text-paper hover:bg-ink/90 transition-colors">
                    <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Save Settings
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
