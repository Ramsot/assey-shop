"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, LogOut, User, Settings as SettingsIcon, Search, X, ChevronRight } from "lucide-react";

interface HeaderProps {
  user: { name: string; email: string; avatar?: string | null };
}

const breadcrumbMap: Record<string, string> = {
  "": "Dashboard",
  "products": "Products",
  "orders": "Orders",
  "customers": "Customers",
  "reviews": "Reviews",
  "coupons": "Coupons",
  "newsletter": "Newsletter",
  "marketing": "Marketing",
  "navigation-menu": "Navigation",
  "homepage-builder": "Homepage Builder",
  "website-content": "Content Pages",
  "messages": "Messages",
  "analytics": "Analytics",
  "reports": "Reports",
  "users": "Admin Users",
  "roles": "Roles & Permissions",
  "security": "Security",
  "system-logs": "System Logs",
  "website-settings": "Website Settings",
  "seo": "SEO",
  "appearance": "Appearance",
  "api-settings": "API Settings",
  "database": "Database",
  "backup-restore": "Backup & Restore",
  "profile": "Profile",
  "activity-logs": "Activity Logs",
  "notifications": "Notifications",
  "permissions": "Permissions",
  "media": "Media",
};

export function AdminHeader({ user }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const segments = pathname.replace("/admin", "").split("/").filter(Boolean);
  const pageName = breadcrumbMap[segments[0] || ""] || segments[0] || "Dashboard";

  const handleLogout = async () => {
    const { createClient } = await import("@/utils/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const initials = (user.name || "A")
    .split(" ")
    .map((n) => n?.[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim().toLowerCase();
    const found = Object.entries(breadcrumbMap).find(([, label]) =>
      label.toLowerCase().includes(q)
    );
    if (found) {
      router.push(`/admin/${found[0]}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-paper/80 backdrop-blur-md px-6 lg:px-8">
      <div className="flex items-center gap-3">
        {segments.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <button onClick={() => router.push("/admin")} className="hover:text-ink transition-colors">Dashboard</button>
            {segments.map((seg, i) => (
              <span key={seg} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
                <span className={i === segments.length - 1 ? "text-ink font-medium" : "hover:text-ink transition-colors"}>
                  {breadcrumbMap[seg] || seg}
                </span>
              </span>
            ))}
          </nav>
        )}
        {segments.length === 0 && (
          <h2 className="text-sm font-semibold text-ink">Dashboard</h2>
        )}
      </div>

      <div className="flex items-center gap-2">
        <form onSubmit={handleSearch} className="relative">
          {searchOpen ? (
            <motion.div initial={{ width: 0 }} animate={{ width: 240 }} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pages..."
                className="w-full rounded-xl border border-border bg-background py-2 pl-10 pr-8 text-sm text-ink outline-none transition-all placeholder:text-muted-foreground/60 focus:border-gold focus:ring-1 focus:ring-gold"
                autoFocus
                onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              )}
            </motion.div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-xl p-2 text-muted-foreground hover:bg-accent transition-colors"
              title="Search pages"
            >
              <Search className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}
        </form>

        <button className="relative rounded-xl p-2 text-muted-foreground hover:bg-accent transition-colors">
          <Bell className="h-4 w-4" strokeWidth={1.5} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-accent transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-paper text-xs font-semibold">
              {initials}
            </div>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-paper shadow-lg shadow-black/5 overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-ink">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { router.push("/admin/profile"); setShowUserMenu(false); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-ink transition-colors"
                  >
                    <User className="h-4 w-4" strokeWidth={1.5} />
                    Profile
                  </button>
                  <button
                    onClick={() => { router.push("/admin/website-settings"); setShowUserMenu(false); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-ink transition-colors"
                  >
                    <SettingsIcon className="h-4 w-4" strokeWidth={1.5} />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.5} />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
