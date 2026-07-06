"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Globe, Mail, Phone, MapPin, DollarSign, Clock, Twitter, Instagram, Facebook, Linkedin } from "lucide-react";

interface SettingsGroup {
  name: string;
  icon: React.ElementType;
  fields: { key: string; label: string; type: string; placeholder?: string }[];
}

const settingsGroups: SettingsGroup[] = [
  {
    name: "General", icon: Globe,
    fields: [
      { key: "siteName", label: "Site Name", type: "text", placeholder: "ASSEY Atelier" },
      { key: "siteDescription", label: "Site Description", type: "textarea", placeholder: "Luxury African fashion brand" },
      { key: "siteUrl", label: "Site URL", type: "text", placeholder: "https://asseyatelier.com" },
    ],
  },
  {
    name: "Contact", icon: Mail,
    fields: [
      { key: "contactEmail", label: "Contact Email", type: "email", placeholder: "info@asseyatelier.com" },
      { key: "contactPhone", label: "Phone", type: "text", placeholder: "+255 XXX XXX XXX" },
      { key: "contactAddress", label: "Address", type: "textarea", placeholder: "Dar es Salaam, Tanzania" },
    ],
  },
  {
    name: "Commerce", icon: DollarSign,
    fields: [
      { key: "currency", label: "Currency", type: "text", placeholder: "TZS" },
      { key: "currencySymbol", label: "Currency Symbol", type: "text", placeholder: "TSh" },
      { key: "timezone", label: "Timezone", type: "text", placeholder: "Africa/Dar_es_Salaam" },
      { key: "locale", label: "Locale", type: "text", placeholder: "en-TZ" },
    ],
  },
  {
    name: "Social Links", icon: Twitter,
    fields: [
      { key: "twitterUrl", label: "Twitter / X", type: "url", placeholder: "https://x.com/asseyatelier" },
      { key: "instagramUrl", label: "Instagram", type: "url", placeholder: "https://instagram.com/asseyatelier" },
      { key: "facebookUrl", label: "Facebook", type: "url", placeholder: "https://facebook.com/asseyatelier" },
      { key: "linkedinUrl", label: "LinkedIn", type: "url", placeholder: "https://linkedin.com/company/asseyatelier" },
    ],
  },
  {
    name: "Regional", icon: MapPin,
    fields: [
      { key: "country", label: "Country", type: "text", placeholder: "Tanzania" },
      { key: "language", label: "Language", type: "text", placeholder: "en" },
      { key: "weightUnit", label: "Weight Unit", type: "text", placeholder: "kg" },
      { key: "dimensionUnit", label: "Dimension Unit", type: "text", placeholder: "cm" },
    ],
  },
];

export default function WebsiteSettingsPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const defaults: Record<string, string> = {};
    settingsGroups.forEach((g) => g.fields.forEach((f) => { defaults[f.key] = ""; }));
    setForm(defaults);

    fetch("/admin/api/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          const merged = { ...defaults, ...Object.fromEntries(res.data.map((s: { key: string; value: string }) => [s.key, s.value])) };
          setForm(merged);
        } else setError(res.error || "Failed to load");
      })
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = Object.entries(form).map(([key, value]) => ({ key, value }));
      await fetch("/admin/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Error saving settings");
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
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium text-ink">Website Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure your store settings</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <motion.form variants={item} onSubmit={handleSubmit} className="space-y-6">
        {settingsGroups.map((group) => (
          <div key={group.name} className="rounded-xl border border-border bg-paper p-6 space-y-4">
            <h2 className="font-serif text-lg text-ink flex items-center gap-2">
              <group.icon className="h-4 w-4" strokeWidth={1.5} />
              {group.name}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {group.fields.map((field) => (
                <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea rows={3} value={form[field.key] || ""} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
                  ) : (
                    <input type={field.type} value={form[field.key] || ""} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-3 pt-4">
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50 transition-colors">
            <Save className="h-4 w-4" strokeWidth={1.5} />
            {saving ? "Saving..." : "Save All Settings"}
          </button>
          {saved && <span className="text-xs text-green-600">All settings saved!</span>}
        </div>
      </motion.form>
    </motion.div>
  );
}
