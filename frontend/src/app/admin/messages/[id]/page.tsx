"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle, Reply } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const res = await fetch(`/admin/api/messages/${params.id}`);
        const json = await res.json();
        if (json.success) {
          setMessage(json.data);
        } else {
          alert(json.error || "Failed to load message");
        }
      } catch {
        alert("Error loading message");
      } finally {
        setLoading(false);
      }
    };
    fetchMessage();
  }, [params.id]);

  const markAsRead = async () => {
    setMarking(true);
    try {
      const res = await fetch(`/admin/api/messages/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage((prev) => prev ? { ...prev, isRead: true } : prev);
      }
    } catch { /* ignore */ }
    finally { setMarking(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>
  );

  if (!message) return (
    <div className="flex items-center justify-center py-20 text-muted-foreground">Message not found</div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/messages" className="rounded-xl p-2 text-muted-foreground hover:bg-accent transition-colors">
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">{message.subject}</h1>
          <p className="text-sm text-muted-foreground">
            From {message.name} &lt;{message.email}&gt; &middot; {new Date(message.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-paper p-6 space-y-6">

        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Name</span>
            <p className="text-sm text-ink mt-1">{message.name}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Email</span>
            <p className="text-sm text-ink mt-1">{message.email}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Subject</span>
            <p className="text-sm text-ink mt-1">{message.subject}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Date</span>
            <p className="text-sm text-ink mt-1">{new Date(message.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Message</span>
          <p className="text-sm text-ink mt-2 whitespace-pre-wrap">{message.message}</p>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          {!message.isRead && (
            <button onClick={markAsRead} disabled={marking}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50 transition-colors">
              <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
              {marking ? "Marking..." : "Mark as Read"}
            </button>
          )}
          <a href={`mailto:${message.email}?subject=Re: ${message.subject}`}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-ink hover:bg-accent transition-colors">
            <Reply className="h-4 w-4" strokeWidth={1.5} />
            Reply via Email
          </a>
        </div>
      </motion.div>
    </div>
  );
}
