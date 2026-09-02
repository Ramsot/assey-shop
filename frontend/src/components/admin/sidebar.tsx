"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Star,
  Megaphone, Percent, Mail, MessageSquare,
  Menu, Layout, FileText,
  BarChart3, FileBarChart, Shield, Key,
  Settings as SettingsIcon, Palette, Search as SearchIcon, Globe, Database,
  LogOut, ChevronDown,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  user: { id: string; email: string; name: string; role: string; avatar?: string | null };
}

interface NavGroup {
  label: string;
  items: { href: string; label: string; icon: React.ElementType }[];
}

const navGroups: NavGroup[] = [
  {
    label: "Store",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    label: "Promotions",
    items: [
      { href: "/admin/coupons", label: "Coupons", icon: Percent },
      { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
      { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/navigation-menu", label: "Navigation", icon: Menu },
      { href: "/admin/homepage-builder", label: "Homepage", icon: Layout },
      { href: "/admin/website-content", label: "Content Pages", icon: FileText },
      { href: "/admin/messages", label: "Messages", icon: MessageSquare },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/reports", label: "Reports", icon: FileBarChart },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/users", label: "Admin Users", icon: Users },
      { href: "/admin/roles", label: "Roles & Permissions", icon: Shield },
      { href: "/admin/security", label: "Security", icon: Key },
      { href: "/admin/system-logs", label: "System Logs", icon: Database },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/admin/website-settings", label: "Website Settings", icon: SettingsIcon },
      { href: "/admin/seo", label: "SEO", icon: Globe },
      { href: "/admin/appearance", label: "Appearance", icon: Palette },
      { href: "/admin/api-settings", label: "API", icon: SearchIcon },
      { href: "/admin/database", label: "Database", icon: Database },
      { href: "/admin/backup-restore", label: "Backup", icon: Database },
    ],
  },
];

export function AdminSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const groups: Record<string, boolean> = {};
    for (const group of navGroups) {
      groups[group.label] = group.items.some((item) => {
        if (item.href === "/admin") return pathname === "/admin";
        return pathname.startsWith(item.href);
      });
    }
    return groups;
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className={cn(
      "flex flex-col border-r border-border bg-paper transition-all duration-300",
      collapsed ? "w-14" : "w-60"
    )}>
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/admin" className={cn("flex items-center gap-2", collapsed && "justify-center w-full")}>
          {collapsed ? (
            <span className="font-serif text-lg font-semibold text-ink">A</span>
          ) : (
            <>
              <span className="font-serif text-base font-semibold text-ink">ASSEY</span>
              <span className="text-[7px] uppercase tracking-[0.2em] text-gold">Admin</span>
            </>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                {group.label}
                <ChevronDown className={cn(
                  "h-3 w-3 transition-transform",
                  expandedGroups[group.label] && "rotate-180"
                )} strokeWidth={2} />
              </button>
            )}
            {expandedGroups[group.label] !== false && (
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg text-sm transition-all",
                        collapsed ? "justify-center px-2 py-2" : "px-3 py-1.5",
                        active
                          ? "bg-ink text-paper font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-ink"
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-border p-2 space-y-0.5">
        {!collapsed && (
          <Link
            href="/admin/profile"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-ink transition-all"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-paper text-[10px] font-semibold">
              {(user.name || "A").split(" ").map((n) => n?.[0] || "").join("").toUpperCase().slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.role}</p>
            </div>
          </Link>
        )}
        <Link
          href="/admin/logout"
          className={cn(
            "flex items-center gap-2.5 rounded-lg text-sm text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all",
            collapsed ? "justify-center px-2 py-2" : "px-3 py-1.5"
          )}
          title="Logout"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
          {!collapsed && <span>Logout</span>}
        </Link>
      </div>
    </aside>
  );
}
