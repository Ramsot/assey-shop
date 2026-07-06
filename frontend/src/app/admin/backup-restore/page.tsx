"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HardDrive, Download, RotateCcw, Plus, Trash2, Calendar, Database, CheckCircle, Loader } from "lucide-react";

interface Backup {
  id: string;
  fileName: string;
  size: string;
  type: string;
  createdAt: string;
  status: string;
}

export default function BackupRestorePage() {
  const [backups, setBackups] = useState<Backup[]>([
    { id: "1", fileName: "backup-2026-07-06.sql", size: "45.2 MB", type: "full", createdAt: "2026-07-06 03:00", status: "completed" },
    { id: "2", fileName: "backup-2026-07-05.sql", size: "44.8 MB", type: "full", createdAt: "2026-07-05 03:00", status: "completed" },
    { id: "3", fileName: "backup-2026-07-04.sql", size: "44.5 MB", type: "full", createdAt: "2026-07-04 03:00", status: "completed" },
    { id: "4", fileName: "backup-2026-07-03.sql", size: "44.1 MB", type: "full", createdAt: "2026-07-03 03:00", status: "completed" },
    { id: "5", fileName: "backup-2026-07-02.sql", size: "43.7 MB", type: "full", createdAt: "2026-07-02 03:00", status: "completed" },
  ]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    await new Promise((r) => setTimeout(r, 2000));
    const newBackup: Backup = {
      id: Date.now().toString(),
      fileName: `backup-${new Date().toISOString().slice(0, 10)}.sql`,
      size: "—",
      type: "full",
      createdAt: new Date().toLocaleString(),
      status: "completed",
    };
    setBackups([newBackup, ...backups]);
    setCreating(false);
  };

  const handleRestore = (id: string) => {
    if (!confirm("Restore this backup? Current data will be lost.")) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this backup?")) return;
    setBackups(backups.filter((b) => b.id !== id));
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
          <h1 className="font-serif text-3xl font-medium text-ink">Backup & Restore</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage database backups</p>
        </div>
        <button onClick={handleCreate} disabled={creating}
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50 transition-colors">
          {creating ? <Loader className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : <Plus className="h-4 w-4" strokeWidth={1.5} />}
          {creating ? "Creating..." : "Create Backup"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div variants={item} className="rounded-xl border border-border bg-paper p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2"><Database className="h-5 w-5 text-green-600" strokeWidth={1.5} /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Backups</p>
              <p className="text-2xl font-semibold text-ink">{backups.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div variants={item} className="rounded-xl border border-border bg-paper p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2"><HardDrive className="h-5 w-5 text-blue-600" strokeWidth={1.5} /></div>
            <div>
              <p className="text-xs text-muted-foreground">Latest Backup</p>
              <p className="text-sm font-medium text-ink">{backups[0]?.createdAt || "—"}</p>
            </div>
          </div>
        </motion.div>
        <motion.div variants={item} className="rounded-xl border border-border bg-paper p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-100 p-2"><Calendar className="h-5 w-5 text-yellow-600" strokeWidth={1.5} /></div>
            <div>
              <p className="text-xs text-muted-foreground">Schedule</p>
              <p className="text-sm font-medium text-ink">Daily at 03:00</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="rounded-xl border border-border bg-paper overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-serif text-lg text-ink">Backup History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">File Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No backups yet</td></tr>
              ) : (
                backups.map((b, i) => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                        <span className="font-medium text-ink">{b.fileName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{b.size}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-medium text-ink uppercase">{b.type}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{b.createdAt}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="h-3.5 w-3.5" strokeWidth={1.5} /> {b.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors"><Download className="h-4 w-4" strokeWidth={1.5} /></button>
                        <button onClick={() => handleRestore(b.id)} disabled={loading}
                          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"><RotateCcw className="h-4 w-4" strokeWidth={1.5} /></button>
                        <button onClick={() => handleDelete(b.id)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" strokeWidth={1.5} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
