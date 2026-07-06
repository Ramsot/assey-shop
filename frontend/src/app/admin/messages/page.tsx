"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, MailOpen, Trash2, Calendar } from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Message | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/admin/api/messages");
      const json = await res.json();
      if (json.success) setMessages(json.data);
      else setError(json.error || "Failed to load");
    } catch {
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleMarkRead = async (id: string) => {
    await fetch(`/admin/api/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    fetchMessages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await fetch(`/admin/api/messages/${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    fetchMessages();
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
      <div>
        <h1 className="font-serif text-3xl font-medium text-ink">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Contact form messages</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {selected ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-paper p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-xl text-ink">{selected.subject}</h2>
              <p className="text-sm text-muted-foreground">From {selected.name} &lt;{selected.email}&gt;</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelected(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-ink hover:bg-accent transition-colors">Back</button>
              <button aria-label="Delete message" onClick={() => handleDelete(selected.id)}
                className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" strokeWidth={1.5} /></button>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
            {new Date(selected.createdAt).toLocaleString()}
          </div>
          <div className="rounded-xl bg-background p-4 whitespace-pre-wrap text-sm text-ink leading-relaxed">
            {selected.message}
          </div>
        </motion.div>
      ) : (
        <div className="rounded-xl border border-border bg-paper overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Message</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>
                ) : messages.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No messages found</td></tr>
                ) : (
                  messages.map((m, i) => (
                    <motion.tr key={m.id} variants={item}
                      className={`border-b border-border last:border-0 hover:bg-accent/50 transition-colors cursor-pointer ${!m.isRead ? "font-medium" : ""}`}
                      onClick={() => { setSelected(m); if (!m.isRead) handleMarkRead(m.id); }}>
                      <td className="px-4 py-3 text-ink">{m.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                      <td className="px-4 py-3 text-ink max-w-[200px] truncate">{m.subject}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[250px] truncate">{m.message}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {m.isRead ? (
                          <MailOpen className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                        ) : (
                          <Mail className="h-4 w-4 text-gold" strokeWidth={1.5} />
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button aria-label="Delete message" onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" strokeWidth={1.5} /></button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
