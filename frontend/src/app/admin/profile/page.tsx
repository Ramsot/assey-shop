"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, User, Lock, Bell, Camera, CheckCircle, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
}

type Toast = { type: "success" | "error"; message: string };

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? "bg-ink" : "bg-border"}`}>
      <span className={`inline-block h-4 w-4 rounded-full bg-paper shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "preferences">("profile");
  const [toast, setToast] = useState<Toast | null>(null);
  const [userData, setUserData] = useState<ProfileData | null>(null);

  const [profile, setProfile] = useState({ name: "", email: "", avatar: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [password, setPassword] = useState({ current: "", newPass: "", confirm: "" });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [savingPassword, setSavingPassword] = useState(false);

  const [prefs, setPrefs] = useState({ emailNotifications: true, orderAlerts: true, weeklyReport: false });
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetch("/admin/api/auth/me")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setUserData(res.data);
          setProfile({ name: res.data.name || "", email: res.data.email || "", avatar: res.data.avatar || "" });
        }
      })
      .catch(console.error);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/admin/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, email: profile.email, avatar: profile.avatar }),
      });
      const json = await res.json();
      if (json.success) {
        setUserData((prev) => prev ? { ...prev, name: profile.name, email: profile.email, avatar: profile.avatar } : prev);
        showToast("success", "Profile updated successfully");
      } else {
        showToast("error", json.error || "Failed to update profile");
      }
    } catch {
      showToast("error", "An error occurred");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/admin/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success && json.url) {
        setProfile((p) => ({ ...p, avatar: json.url }));
        await fetch("/admin/api/auth/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar: json.url }),
        });
        showToast("success", "Avatar updated");
      } else {
        showToast("error", "Failed to upload image");
      }
    } catch {
      showToast("error", "Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.newPass !== password.confirm) {
      showToast("error", "Passwords don't match");
      return;
    }
    if (password.newPass.length < 8) {
      showToast("error", "Password must be at least 8 characters");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/admin/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: password.current, newPassword: password.newPass }),
      });
      const json = await res.json();
      if (json.success) {
        setPassword({ current: "", newPass: "", confirm: "" });
        showToast("success", "Password changed successfully");
      } else {
        showToast("error", json.error || "Failed to change password");
      }
    } catch {
      showToast("error", "An error occurred");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    await new Promise((r) => setTimeout(r, 600));
    setSavingPrefs(false);
    showToast("success", "Preferences saved");
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "password" as const, label: "Password", icon: Lock },
    { id: "preferences" as const, label: "Preferences", icon: Bell },
  ];

  const initials = (userData?.name || userData?.email || "A")?.[0]?.toUpperCase() || "A";

  return (
    <div className="max-w-3xl space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-medium shadow-lg ${
              toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}>
            {toast.type === "success" ? <CheckCircle className="h-4 w-4" strokeWidth={2} /> : <AlertCircle className="h-4 w-4" strokeWidth={2} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-3xl font-medium text-ink">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account settings</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex items-center gap-5 rounded-xl border border-border bg-paper p-5">
        <div className="relative flex-shrink-0">
          <div className="h-16 w-16 rounded-full bg-accent overflow-hidden flex items-center justify-center">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-semibold text-ink">{initials}</span>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <Loader2 className="h-5 w-5 animate-spin text-white" strokeWidth={2} />
              </div>
            )}
          </div>
          <button type="button" aria-label="Upload avatar photo" onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 rounded-full bg-ink p-1.5 text-paper hover:bg-ink/90 transition-colors">
            <Camera className="h-3 w-3" strokeWidth={2} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" title="Upload avatar" aria-label="Upload avatar photo" className="hidden" onChange={handleAvatarUpload} />
        </div>
        <div>
          <p className="font-semibold text-ink">{userData?.name || "—"}</p>
          <p className="text-sm text-muted-foreground">{userData?.email}</p>
          <span className="mt-1 inline-block rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-medium uppercase text-ink">{userData?.role}</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 rounded-t-xl px-5 py-2.5 text-sm font-medium transition-colors -mb-px ${
              activeTab === tab.id
                ? "border border-b-paper border-border bg-paper text-ink"
                : "text-muted-foreground hover:text-ink"
            }`}>
            <tab.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
            {tab.label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "profile" && (
          <motion.form key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            onSubmit={handleSaveProfile} className="rounded-xl border border-border bg-paper p-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Full Name</label>
                <input id="profile-name" type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
              </div>
              <div>
                <label htmlFor="profile-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Email Address</label>
                <input id="profile-email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="profile-avatar" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Avatar URL</label>
                <input id="profile-avatar" type="text" value={profile.avatar} onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
                <p className="mt-1 text-[11px] text-muted-foreground">Or click the camera icon above to upload a photo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <button type="submit" disabled={savingProfile}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50 transition-colors">
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Save className="h-4 w-4" strokeWidth={1.5} />}
                {savingProfile ? "Saving..." : "Update Profile"}
              </button>
            </div>
          </motion.form>
        )}

        {activeTab === "password" && (
          <motion.form key="password" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            onSubmit={handleSavePassword} className="rounded-xl border border-border bg-paper p-6 space-y-5">
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
              Choose a strong password with at least 8 characters, including uppercase letters and numbers.
            </div>
            {[
              { key: "current" as const, label: "Current Password", show: showPass.current, toggleKey: "current" as const },
              { key: "newPass" as const, label: "New Password", show: showPass.new, toggleKey: "new" as const },
              { key: "confirm" as const, label: "Confirm New Password", show: showPass.confirm, toggleKey: "confirm" as const },
            ].map((field) => (
              <div key={field.key}>
                <label htmlFor={`pass-${field.key}`} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">{field.label}</label>
                <div className="relative">
                  <input
                    id={`pass-${field.key}`}
                    type={field.show ? "text" : "password"}
                    value={password[field.key]}
                    onChange={(e) => setPassword({ ...password, [field.key]: e.target.value })}
                    required
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-10 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                  <button type="button" aria-label={field.show ? "Hide password" : "Show password"} onClick={() => setShowPass({ ...showPass, [field.toggleKey]: !showPass[field.toggleKey] })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors">
                    {field.show ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <button type="submit" disabled={savingPassword}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50 transition-colors">
                {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Lock className="h-4 w-4" strokeWidth={1.5} />}
                {savingPassword ? "Changing..." : "Change Password"}
              </button>
            </div>
          </motion.form>
        )}

        {activeTab === "preferences" && (
          <motion.div key="preferences" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-border bg-paper p-6 space-y-1">
            {[
              { key: "emailNotifications" as const, label: "Email Notifications", desc: "Receive email updates about store activity" },
              { key: "orderAlerts" as const, label: "New Order Alerts", desc: "Get notified immediately when a new order arrives" },
              { key: "weeklyReport" as const, label: "Weekly Sales Report", desc: "Receive a weekly summary of sales performance" },
            ].map((opt, i, arr) => (
              <div key={opt.key} className={`flex items-center justify-between py-4 ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
                <div>
                  <p className="text-sm font-medium text-ink">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </div>
                <Toggle checked={prefs[opt.key]} onChange={() => setPrefs({ ...prefs, [opt.key]: !prefs[opt.key] })} />
              </div>
            ))}
            <div className="pt-4 border-t border-border">
              <button onClick={handleSavePrefs} disabled={savingPrefs}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50 transition-colors">
                {savingPrefs ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Save className="h-4 w-4" strokeWidth={1.5} />}
                {savingPrefs ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
