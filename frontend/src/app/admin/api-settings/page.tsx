"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Key, Copy, Eye, EyeOff, RefreshCw, Check } from "lucide-react";

const apiEndpoints = [
  { method: "GET", path: "/api/products", description: "List all products" },
  { method: "GET", path: "/api/products/:id", description: "Get single product" },
  { method: "POST", path: "/api/products", description: "Create product" },
  { method: "PUT", path: "/api/products/:id", description: "Update product" },
  { method: "DELETE", path: "/api/products/:id", description: "Delete product" },
  { method: "GET", path: "/api/collections", description: "List collections" },
  { method: "GET", path: "/api/categories", description: "List categories" },
  { method: "GET", path: "/api/orders", description: "List orders" },
  { method: "GET", path: "/api/customers", description: "List customers" },
  { method: "POST", path: "/api/auth/login", description: "Admin login" },
];

export default function ApiSettingsPage() {
  const [apiKey, setApiKey] = useState("sk_live_ASSEY_" + "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (!confirm("Regenerate API key? This will invalidate the current key.")) return;
    const chars = "abcdef0123456789";
    const newKey = "sk_live_ASSEY_" + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setApiKey(newKey);
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
        <h1 className="font-serif text-3xl font-medium text-ink">API Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage API keys and endpoints</p>
      </div>

      <motion.div variants={item} className="rounded-xl border border-border bg-paper p-6 space-y-4">
        <h2 className="font-serif text-lg text-ink flex items-center gap-2"><Key className="h-4 w-4" strokeWidth={1.5} /> API Key</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input type={showKey ? "text" : "password"} value={apiKey} readOnly
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none font-mono" />
            <button onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink">
              {showKey ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
            </button>
          </div>
          <button onClick={() => handleCopy(apiKey)}
            className="rounded-xl border border-border px-4 py-2.5 text-sm text-ink hover:bg-accent transition-colors">
            {copied ? <Check className="h-4 w-4 text-green-600" strokeWidth={1.5} /> : <Copy className="h-4 w-4" strokeWidth={1.5} />}
          </button>
        </div>
        <button onClick={handleRegenerate}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
          Regenerate Key
        </button>
      </motion.div>

      <motion.div variants={item} className="rounded-xl border border-border bg-paper overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-serif text-lg text-ink">API Endpoints</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Available REST API endpoints</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Path</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Description</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Copy</th>
              </tr>
            </thead>
            <tbody>
              {apiEndpoints.map((ep, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`font-mono text-xs font-medium px-2 py-0.5 rounded ${
                      ep.method === "GET" ? "bg-green-100 text-green-700" :
                      ep.method === "POST" ? "bg-blue-100 text-blue-700" :
                      ep.method === "PUT" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink">{ep.path}</td>
                  <td className="px-4 py-3 text-muted-foreground">{ep.description}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleCopy(ep.path)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors">
                      <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
