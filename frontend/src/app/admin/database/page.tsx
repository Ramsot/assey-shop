"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Database, HardDrive, RefreshCw, Table, Server, Activity, CheckCircle, AlertTriangle } from "lucide-react";

interface DbStatus {
  totalTables: number;
  totalRows: number;
  databaseSize: string;
  connectionStatus: string;
  serverVersion: string;
  uptime: string;
  tables: { name: string; rows: number; size: string; engine: string }[];
}

export default function DatabasePage() {
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStatus = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/admin/api/database");
      const json = await res.json();
      if (json.success) setStatus(json.data);
      else setError(json.error || "Failed to load");
    } catch {
      setError("Failed to load database status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const infoCards = [
    { label: "Server Version", value: status?.serverVersion || "—", icon: Server },
    { label: "Connection", value: status?.connectionStatus || "—", icon: Activity },
    { label: "Uptime", value: status?.uptime || "—", icon: RefreshCw },
    { label: "Database Size", value: status?.databaseSize || "—", icon: HardDrive },
    { label: "Total Tables", value: status?.totalTables ?? "—", icon: Table },
    { label: "Total Rows", value: status?.totalRows?.toLocaleString() || "—", icon: Database },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">Database</h1>
          <p className="mt-1 text-sm text-muted-foreground">Database status and information</p>
        </div>
        <button onClick={fetchStatus}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-ink hover:bg-accent transition-colors">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {loading && !status ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-ink" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {infoCards.map((c, i) => (
              <motion.div key={c.label} variants={item} className="rounded-xl border border-border bg-paper p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-accent p-2">
                    <c.icon className="h-5 w-5 text-ink" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                    <p className="text-sm font-medium text-ink">{c.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={item} className="rounded-xl border border-border bg-paper overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-serif text-lg text-ink flex items-center gap-2"><Table className="h-4 w-4" strokeWidth={1.5} /> Tables</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Table Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Rows</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Engine</th>
                  </tr>
                </thead>
                <tbody>
                  {status?.tables?.map((t, i) => (
                    <tr key={t.name} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-ink font-mono text-xs">{t.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.rows.toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.size}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.engine}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div variants={item} className="rounded-xl border border-border bg-paper p-6">
            <div className="flex items-center gap-2 text-sm">
              {status?.connectionStatus === "connected" ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" strokeWidth={1.5} />
                  <span className="text-green-600 font-medium">Database connection is healthy</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-yellow-600" strokeWidth={1.5} />
                  <span className="text-yellow-600 font-medium">Database connection issue detected</span>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
