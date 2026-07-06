"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, RefreshCw, Trash2 } from "lucide-react";

interface ActivityEntry {
  id: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export default function ActivityLogsPage() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActivities = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/admin/api/activity-logs");
      const json = await res.json();
      if (json.success) setActivities(json.data);
      else setError(json.error || "Failed to load");
    } catch {
      setError("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActivities(); }, []);

  const handleClear = async () => {
    if (!confirm("Clear all activity logs?")) return;
    await fetch("/admin/api/activity-logs", { method: "DELETE" });
    fetchActivities();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create": return "bg-green-100 text-green-700";
      case "update": return "bg-blue-100 text-blue-700";
      case "delete": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
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
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">Activity Logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">{activities.length} activities recorded</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchActivities}
            className="rounded-xl border border-border px-4 py-2.5 text-sm text-ink hover:bg-accent transition-colors">
            <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button onClick={handleClear}
            className="rounded-xl border border-red-200 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-border bg-paper overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Details</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : activities.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No activity logs found</td></tr>
              ) : (
                activities.map((a, i) => (
                  <motion.tr key={a.id} variants={item}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                        <span className="text-ink">{a.user}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase ${getActionColor(a.action)}`}>
                        {a.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-ink">{a.entity}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">#{a.entityId.slice(0, 8)}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate text-xs">{a.details}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground whitespace-nowrap text-xs">{new Date(a.timestamp).toLocaleString()}</td>
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
