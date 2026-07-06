"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Key, Shield } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  key: string;
  description: string;
  group: string;
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPermissions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/admin/api/roles");
      const json = await res.json();
      if (json.success) {
        const allPerms: Permission[] = json.data.flatMap((r: { permissions?: Permission[] }) => r.permissions || []);
        const unique = Array.from(new Map(allPerms.map((p) => [p.id, p])).values());
        setPermissions(unique);
      } else setError(json.error || "Failed to load");
    } catch {
      setError("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPermissions(); }, []);

  const grouped = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    const group = p.group || "Other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});

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
        <h1 className="font-serif text-3xl font-medium text-ink">Permissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">View all system permissions</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-ink" />
        </div>
      ) : permissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-paper p-12">
          <Key className="mb-4 h-12 w-12 text-muted-foreground" strokeWidth={1} />
          <p className="text-lg font-medium text-ink">No permissions found</p>
        </div>
      ) : (
        Object.entries(grouped).map(([group, perms]) => (
          <motion.div key={group} variants={item} className="rounded-xl border border-border bg-paper overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-background">
              <h2 className="font-serif text-lg text-ink flex items-center gap-2">
                <Shield className="h-4 w-4" strokeWidth={1.5} />
                {group}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Permission</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Key</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {perms.map((p, i) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{p.key}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
  );
}
