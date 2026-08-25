"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Mail, ToggleLeft, ToggleRight, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  source: string;
  isActive: boolean;
  createdAt: string;
}

type Toast = { type: "success" | "error"; message: string };

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [campaign, setCampaign] = useState({ title: "", content: "", testEmail: "" });
  const [sending, setSending] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSubscribers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/admin/api/newsletter");
      const json = await res.json();
      if (json.success) setSubscribers(json.data);
      else setError(json.error || "Failed to load");
    } catch {
      setError("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubscribers(); }, []);

  const handleToggle = async (id: string, current: boolean) => {
    await fetch(`/admin/api/newsletter/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    fetchSubscribers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subscriber?")) return;
    await fetch(`/admin/api/newsletter/${id}`, { method: "DELETE" });
    fetchSubscribers();
  };

  const handleSendTest = async () => {
    if (!campaign.testEmail) { showToast("error", "Enter a test email address"); return; }
    if (!campaign.title || !campaign.content) { showToast("error", "Title and content are required"); return; }
    setSendingTest(true);
    try {
      const res = await fetch("/admin/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: campaign.title, content: campaign.content, testEmail: campaign.testEmail }),
      });
      const json = await res.json();
      if (json.success) showToast("success", json.message);
      else showToast("error", json.error || "Failed to send test");
    } catch { showToast("error", "Failed to send test"); }
    finally { setSendingTest(false); }
  };

  const handleSendCampaign = async () => {
    if (!campaign.title || !campaign.content) { showToast("error", "Title and content are required"); return; }
    const activeCount = subscribers.filter((s) => s.isActive).length;
    if (!confirm(`Send this campaign to ${activeCount} active subscriber(s)?`)) return;
    setSending(true);
    try {
      const res = await fetch("/admin/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: campaign.title, content: campaign.content }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", json.message);
        setCampaign({ title: "", content: "", testEmail: "" });
        setShowComposer(false);
      } else {
        showToast("error", json.error || "Failed to send campaign");
      }
    } catch { showToast("error", "Failed to send campaign"); }
    finally { setSending(false); }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const activeCount = subscribers.filter((s) => s.isActive).length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-medium shadow-lg ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
            {toast.type === "success" ? <CheckCircle className="h-4 w-4" strokeWidth={2} /> : <AlertCircle className="h-4 w-4" strokeWidth={2} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">Newsletter</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subscribers.length} subscribers · {activeCount} active</p>
        </div>
        <Button onClick={() => setShowComposer(!showComposer)}
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50 transition-colors">
          <Send className="h-4 w-4" strokeWidth={1.5} />
          Send Campaign
        </Button>
      </div>

      <AnimatePresence>
        {showComposer && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-border bg-paper p-6 space-y-4">
            <h2 className="font-serif text-lg text-ink flex items-center gap-2">
              <Mail className="h-4 w-4" strokeWidth={1.5} /> Compose Campaign
            </h2>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Subject / Title</label>
              <input type="text" value={campaign.title} onChange={(e) => setCampaign({ ...campaign, title: e.target.value })}
                placeholder="Your campaign subject..."
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Content (HTML supported)</label>
              <textarea rows={8} value={campaign.content} onChange={(e) => setCampaign({ ...campaign, content: e.target.value })}
                placeholder="Write your email content here..."
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold font-mono" />
            </div>
            <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
              <div className="flex-1 min-w-[200px]">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Test Email</label>
                <input type="email" value={campaign.testEmail} onChange={(e) => setCampaign({ ...campaign, testEmail: e.target.value })}
                  placeholder="test@example.com"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
              </div>
              <Button variant="outline" onClick={handleSendTest} disabled={sendingTest}>
                {sendingTest ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Mail className="h-4 w-4" strokeWidth={1.5} />}
                Send Test
              </Button>
              <Button onClick={handleSendCampaign} disabled={sending}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Send className="h-4 w-4" strokeWidth={1.5} />}
                {sending ? "Sending..." : `Send to ${activeCount} subscribers`}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-border bg-paper overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Source</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Subscribed</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : subscribers.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No subscribers found</td></tr>
              ) : (
                subscribers.map((s, i) => (
                  <motion.tr key={s.id} variants={item}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                        <span className="text-ink">{s.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-medium text-ink">{s.source}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${s.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"}`}>
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" aria-label={s.isActive ? "Unsubscribe" : "Resubscribe"} onClick={() => handleToggle(s.id, s.isActive)}>
                          {s.isActive ? <ToggleRight className="h-4 w-4 text-green-600" strokeWidth={1.5} /> : <ToggleLeft className="h-4 w-4" strokeWidth={1.5} />}
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Delete subscriber" onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
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
