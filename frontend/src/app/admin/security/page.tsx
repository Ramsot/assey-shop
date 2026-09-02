"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Shield, Key, Clock, Lock } from "lucide-react";

const DEFAULTS = {
  passwordMinLength: "8",
  passwordRequireUppercase: true,
  passwordRequireNumbers: true,
  passwordRequireSymbols: false,
  maxLoginAttempts: "5",
  lockoutDuration: "15",
  sessionTimeout: "60",
  twoFactorEnabled: false,
  twoFactorMethod: "app",
  ipWhitelist: "",
  allowedDomains: "",
  rateLimiting: true,
  rateLimitRequests: "100",
  rateLimitWindow: "15",
  forceHttps: true,
  hstsEnabled: true,
};

export default function SecurityPage() {
  const [form, setForm] = useState<typeof DEFAULTS>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/admin/api/settings?group=security")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.security) {
          const apiData = json.data.security as Record<string, string>;
          setForm((prev) => {
            const merged = { ...prev };
            for (const [k, v] of Object.entries(apiData)) {
              const key = k as keyof typeof DEFAULTS;
              const def = DEFAULTS[key];
              (merged as Record<string, unknown>)[key] =
                typeof def === "boolean" ? v === "true" : v;
            }
            return merged;
          });
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
        key,
        value: typeof value === "boolean" ? String(value) : value,
        group: "security",
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
        <h1 className="font-serif text-3xl font-medium text-ink">Security</h1>
        <p className="mt-1 text-sm text-muted-foreground">Security and authentication settings</p>
      </div>

      <motion.form variants={item} onSubmit={handleSubmit} className="rounded-xl border border-border bg-paper p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="font-serif text-lg text-ink flex items-center gap-2"><Lock className="h-4 w-4" strokeWidth={1.5} /> Password Policy</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Minimum Length</label>
              <input type="number" value={form.passwordMinLength} onChange={(e) => setForm({ ...form, passwordMinLength: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
            </div>
          </div>
          <div className="space-y-2">
            {[
              { key: "passwordRequireUppercase", label: "Require uppercase letters" },
              { key: "passwordRequireNumbers", label: "Require numbers" },
              { key: "passwordRequireSymbols", label: "Require symbols" },
            ].map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={(form as any)[opt.key]} onChange={(e) => setForm({ ...form, [opt.key]: e.target.checked })}
                  className="rounded border-border text-ink focus:ring-gold" />
                <span className="text-sm text-ink">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6 space-y-4">
          <h2 className="font-serif text-lg text-ink flex items-center gap-2"><Shield className="h-4 w-4" strokeWidth={1.5} /> Login Security</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Max Login Attempts</label>
              <input type="number" value={form.maxLoginAttempts} onChange={(e) => setForm({ ...form, maxLoginAttempts: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Lockout Duration (min)</label>
              <input type="number" value={form.lockoutDuration} onChange={(e) => setForm({ ...form, lockoutDuration: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Session Timeout (min)</label>
              <input type="number" value={form.sessionTimeout} onChange={(e) => setForm({ ...form, sessionTimeout: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 space-y-4">
          <h2 className="font-serif text-lg text-ink flex items-center gap-2"><Key className="h-4 w-4" strokeWidth={1.5} /> Two-Factor Authentication</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.twoFactorEnabled} onChange={(e) => setForm({ ...form, twoFactorEnabled: e.target.checked })}
              className="rounded border-border text-ink focus:ring-gold" />
            <span className="text-sm text-ink">Enable 2FA for admin accounts</span>
          </label>
          {form.twoFactorEnabled && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">2FA Method</label>
              <select value={form.twoFactorMethod} onChange={(e) => setForm({ ...form, twoFactorMethod: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold">
                <option value="app">Authenticator App</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </select>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-6 space-y-4">
          <h2 className="font-serif text-lg text-ink flex items-center gap-2"><Clock className="h-4 w-4" strokeWidth={1.5} /> Rate Limiting</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.rateLimiting} onChange={(e) => setForm({ ...form, rateLimiting: e.target.checked })}
              className="rounded border-border text-ink focus:ring-gold" />
            <span className="text-sm text-ink">Enable rate limiting</span>
          </label>
          {form.rateLimiting && (
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Max Requests</label>
                <input type="number" value={form.rateLimitRequests} onChange={(e) => setForm({ ...form, rateLimitRequests: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Time Window (min)</label>
                <input type="number" value={form.rateLimitWindow} onChange={(e) => setForm({ ...form, rateLimitWindow: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-6 space-y-4">
          <h2 className="font-serif text-lg text-ink">Advanced</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.forceHttps} onChange={(e) => setForm({ ...form, forceHttps: e.target.checked })}
                className="rounded border-border text-ink focus:ring-gold" />
              <span className="text-sm text-ink">Force HTTPS</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.hstsEnabled} onChange={(e) => setForm({ ...form, hstsEnabled: e.target.checked })}
                className="rounded border-border text-ink focus:ring-gold" />
              <span className="text-sm text-ink">Enable HSTS</span>
            </label>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">IP Whitelist (one per line)</label>
            <textarea rows={3} value={form.ipWhitelist} onChange={(e) => setForm({ ...form, ipWhitelist: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold font-mono" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Allowed Domains (CORS)</label>
            <textarea rows={2} value={form.allowedDomains} onChange={(e) => setForm({ ...form, allowedDomains: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50 transition-colors">
            <Save className="h-4 w-4" strokeWidth={1.5} />
            {saving ? "Saving..." : "Save Security Settings"}
          </button>
          {saved && <span className="text-xs text-green-600">Settings saved!</span>}
          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
      </motion.form>
    </motion.div>
  );
}
