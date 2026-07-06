"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Info, AlertTriangle, CheckCircle, XCircle, Trash2 } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/admin/api/notifications");
      const json = await res.json();
      if (json.success) setNotifications(json.data);
      else setError(json.error || "Failed to load");
    } catch {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id: string) => {
    await fetch(`/admin/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await fetch("/admin/api/notifications/read-all", { method: "POST" });
    fetchNotifications();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/admin/api/notifications/${id}`, { method: "DELETE" });
    fetchNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "info": return Info;
      case "warning": return AlertTriangle;
      case "success": return CheckCircle;
      case "error": return XCircle;
      default: return Bell;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "info": return "text-blue-600 bg-blue-100";
      case "warning": return "text-yellow-600 bg-yellow-100";
      case "success": return "text-green-600 bg-green-100";
      case "error": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="rounded-xl border border-border px-4 py-2 text-sm text-ink hover:bg-accent transition-colors">
            Mark All Read
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-ink" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-paper p-12">
            <Bell className="mb-4 h-12 w-12 text-muted-foreground" strokeWidth={1} />
            <p className="text-lg font-medium text-ink">No notifications</p>
            <p className="text-sm text-muted-foreground mt-1">You&apos;re all caught up</p>
          </div>
        ) : (
          notifications.map((n, i) => {
            const Icon = getIcon(n.type);
            return (
              <motion.div key={n.id} variants={item}
                className={`rounded-xl border ${n.isRead ? "border-border bg-paper" : "border-gold/30 bg-paper"} p-4 transition-all hover:shadow-sm`}
                onClick={() => !n.isRead && handleMarkRead(n.id)}>
                <div className="flex items-start gap-3">
                  <div className={`rounded-lg p-2 ${getIconColor(n.type)}`}>
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm ${n.isRead ? "text-ink" : "text-ink font-semibold"}`}>{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(n.createdAt).toLocaleString()}</span>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                          className="rounded-lg p-1 text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
