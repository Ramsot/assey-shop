"use client";

import { useState, useTransition } from "react";
import {
  Router as RouterIcon,
  Plus,
  Settings,
  Activity,
  Shield,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RoutersClientProps {
  initialRouters: any[];
}

export function RoutersClient({ initialRouters }: RoutersClientProps) {
  const [routers, setRouters] = useState(initialRouters);
  const [isPending, startTransition] = useTransition();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const [form, setForm] = useState({
    name: "",
    ipAddress: "",
    apiPort: 8728,
    username: "admin",
    password: "",
    location: "",
  });

  const handleSyncStatus = (id: string) => {
    setSyncingId(id);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/routers/${id}/sync`, { method: "POST" });
        if (!res.ok) throw new Error("Sync failed");
        const data = await res.json();
        setRouters(
          routers.map((r) =>
            r.id === id ? { ...r, status: "ONLINE", lastSeen: new Date().toISOString() } : r
          )
        );
        setMessage({ type: "success", text: `Router synced successfully` });
        setTimeout(() => setMessage(null), 2000);
      } catch {
        setRouters(
          routers.map((r) =>
            r.id === id ? { ...r, status: "OFFLINE" } : r
          )
        );
        setMessage({ type: "error", text: "Failed to sync router" });
      } finally {
        setSyncingId(null);
      }
    });
  };

  const handleAddRouter = () => {
    setForm({ name: "", ipAddress: "", apiPort: 8728, username: "admin", password: "", location: "" });
    setShowAddModal(true);
  };

  const confirmAddRouter = () => {
    if (!form.name || !form.ipAddress || !form.password) {
      setMessage({ type: "error", text: "Name, IP, and password are required" });
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/routers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to add router");
        }
        const router = await res.json();
        setRouters([router, ...routers]);
        setShowAddModal(false);
        setMessage({ type: "success", text: "Router added and provisioned!" });
        setTimeout(() => setMessage(null), 3000);
        window.location.reload();
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Failed to add router" });
      }
    });
  };

  const handleDeleteRouter = (id: string) => {
    if (!confirm("Delete this router permanently?")) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/routers/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete");
        setRouters(routers.filter((r) => r.id !== id));
        setMessage({ type: "success", text: "Router deleted" });
        setTimeout(() => setMessage(null), 2000);
      } catch {
        setMessage({ type: "error", text: "Failed to delete router" });
      }
    });
  };

  return (
    <div className="space-y-8">
      {message && (
        <div
          className={cn(
            "p-4 rounded-2xl text-sm font-medium border",
            message.type === "success"
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          )}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Router Management</h1>
          <p className="text-white/50 text-sm">Monitor and configure MikroTik devices</p>
        </div>
        <button
          onClick={handleAddRouter}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all text-sm font-bold shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          Add Router
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <RouterIcon className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider">Online</p>
              <h3 className="text-2xl font-bold text-green-400">
                {routers.filter((r) => r.status === "ONLINE").length}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/10">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider">Offline</p>
              <h3 className="text-2xl font-bold text-red-400">
                {routers.filter((r) => r.status === "OFFLINE").length}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider">Active Sessions</p>
              <h3 className="text-2xl font-bold text-blue-400">
                {routers.reduce((sum: number, r: any) => sum + (r._count?.sessions || 0), 0)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routers.length > 0 ? (
          routers.map((router) => (
            <div
              key={router.id}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/[0.08] transition-all group relative overflow-hidden"
            >
              <div
                className={cn(
                  "absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -mr-16 -mt-16 transition-opacity opacity-20 pointer-events-none",
                  router.status === "ONLINE" ? "bg-green-500" : "bg-red-500"
                )}
              />

              <div className="flex items-start justify-between mb-6 relative">
                <div
                  className={cn(
                    "p-3 rounded-2xl",
                    router.status === "ONLINE" ? "bg-green-500/10" : "bg-red-500/10"
                  )}
                >
                  <RouterIcon
                    className={cn(
                      "w-6 h-6",
                      router.status === "ONLINE" ? "text-green-400" : "text-red-400"
                    )}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                      router.status === "ONLINE"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}
                  >
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        router.status === "ONLINE" ? "bg-green-400" : "bg-red-400"
                      )}
                    />
                    {router.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4 relative">
                <div>
                  <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">
                    {router.name}
                  </h3>
                  <p className="text-white/30 text-xs font-mono">
                    {router.ipAddress}:{router.apiPort}
                  </p>
                  {router.location && (
                    <p className="text-white/20 text-xs mt-1">{router.location}</p>
                  )}
                  {router.configStatus === "FAILED" && (
                    <p className="text-red-400 text-xs mt-1">{router.configError}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                  <div>
                    <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider mb-1">
                      Active Users
                    </p>
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-bold">{router._count?.sessions || 0}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider mb-1">
                      Total Vouchers
                    </p>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-bold">{router._count?.vouchers || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleDeleteRouter(router.id)}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/btn text-red-400/50 hover:text-red-400"
                      title="Delete router"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleSyncStatus(router.id)}
                    disabled={syncingId === router.id}
                    className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                  >
                    {syncingId === router.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    {syncingId === router.id ? "Syncing..." : "Sync Status"}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white/5 border border-white/10 rounded-3xl">
            <Wifi className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="text-white/30 text-sm">No routers connected yet.</p>
            <button
              onClick={handleAddRouter}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all text-sm font-bold"
            >
              <Plus className="w-4 h-4" />
              Add Your First Router
            </button>
          </div>
        )}
      </div>

      {/* Add Router Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              Add MikroTik Router
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-white/30 uppercase tracking-wider ml-1 block mb-1.5">
                  Router Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Arusha-Main-01"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500/50 transition-all text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-white/30 uppercase tracking-wider ml-1 block mb-1.5">
                  IP Address *
                </label>
                <input
                  type="text"
                  value={form.ipAddress}
                  onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
                  placeholder="e.g., 192.168.88.1"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500/50 transition-all text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-white/30 uppercase tracking-wider ml-1 block mb-1.5">
                    API Port
                  </label>
                  <input
                    type="number"
                    value={form.apiPort}
                    onChange={(e) => setForm({ ...form, apiPort: parseInt(e.target.value) || 8728 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500/50 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/30 uppercase tracking-wider ml-1 block mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500/50 transition-all text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-white/30 uppercase tracking-wider ml-1 block mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="RouterOS password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500/50 transition-all text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-white/30 uppercase tracking-wider ml-1 block mb-1.5">
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g., Arusha, Tanzania"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500/50 transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddRouter}
                disabled={isPending}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add & Provision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
