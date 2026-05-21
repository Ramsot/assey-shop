"use client";

import { useState } from "react";
import { Settings, Shield, Bell, Globe, Database, Key, Save, Loader2 } from "lucide-react";
import { saveSettings } from "@/modules/admin/admin.actions";

interface SettingsClientProps {
  initialSettings: Record<string, string>;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const sections = [
    { 
      id: "security",
      icon: Shield, 
      title: "Security & Authentication", 
      desc: "Manage admin passwords and 2FA settings",
      fields: [
        { key: "admin_password", label: "Admin Password", type: "password" },
        { key: "session_timeout", label: "Session Timeout (min)", type: "number" }
      ]
    },
    { 
      id: "network",
      icon: Globe, 
      title: "Network Configuration", 
      desc: "Default router settings and captive portal URLs",
      fields: [
        { key: "default_dns", label: "Default DNS", type: "text" },
        { key: "walled_garden", label: "Walled Garden Domains", type: "text" }
      ]
    },
    { 
      id: "notifications",
      icon: Bell, 
      title: "Notifications", 
      desc: "Alert thresholds for abuse and offline routers",
      fields: [
        { key: "alert_email", label: "Alert Email", type: "email" },
        { key: "telegram_webhook", label: "Telegram Webhook", type: "text" }
      ]
    },
    { 
      id: "system",
      icon: Database, 
      title: "System Maintenance", 
      desc: "Backup and synchronization intervals",
      fields: [
        { key: "sync_interval", label: "Sync Interval (sec)", type: "number" },
        { key: "log_retention", label: "Log Retention (days)", type: "number" }
      ]
    }
  ];

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await saveSettings(settings);
      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save settings." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-white/50 text-sm">Global configuration for SecureNet OS</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl text-sm font-medium border ${
          message.type === "success" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.id} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.08] transition-all group">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-600/20">
                <section.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">{section.title}</h3>
                <p className="text-white/40 text-sm">{section.desc}</p>
              </div>
            </div>

            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-wider ml-1">{field.label}</label>
                  <input
                    type={field.type}
                    value={settings[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500/50 transition-all text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
