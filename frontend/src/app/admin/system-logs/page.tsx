"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Info, XCircle, CheckCircle, RefreshCw, Trash2 } from "lucide-react";

interface LogEntry {
  id: string;
  level: string;
  message: string;
  source: string;
  timestamp: string;
}

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const params = filter ? `?level=${filter}` : "";
      const res = await fetch(`/admin/api/system-logs${params}`);
      const json = await res.json();
      if (json.success) setLogs(json.data);
      else setError(json.error || "Failed to load");
    } catch {
      setError("Failed to load system logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [filter]);

  const handleClearLogs = async () => {
    if (!confirm("Clear all system logs?")) return;
    await fetch("/admin/api/system-logs", { method: "DELETE" });
    fetchLogs();
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error": return XCircle;
      case "warning": return AlertTriangle;
      case "info": return Info;
      case "success": return CheckCircle;
      default: return Info;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error": return "text-red-600 bg-red-100";
      case "warning": return "text-yellow-600 bg-yellow-100";
      case "info": return "text-blue-600 bg-blue-100";
      case "success": return "text-green-600 bg-green-100";
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

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">System Logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">{logs.length} entries</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-border bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-gold">
            <option value="">All Levels</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
          </select>
          <button onClick={fetchLogs}
            className="rounded-xl border border-border px-4 py-2.5 text-sm text-ink hover:bg-accent transition-colors">
            <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button onClick={handleClearLogs}
            className="rounded-xl border border-red-200 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
            Clear Logs
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Level</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Message</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Source</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No log entries found</td></tr>
              ) : (
                logs.map((log, i) => {
                  const Icon = getLevelIcon(log.level);
                  return (
                    <motion.tr key={log.id} variants={item}
                      className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${getLevelColor(log.level)}`}>
                          <Icon className="h-3 w-3" strokeWidth={1.5} />
                          {log.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink font-mono text-xs max-w-lg truncate">{log.message}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{log.source}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground whitespace-nowrap text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
