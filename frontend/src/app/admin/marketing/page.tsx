"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart3, Percent, Send, TrendingUp, Users, DollarSign, Mail, ExternalLink, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function MarketingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const campaignStats = [
    { label: "Active Campaigns", value: "3", change: "+1", up: true },
    { label: "Total Subscribers", value: "2,847", change: "+12.4%", up: true },
    { label: "Open Rate", value: "24.6%", change: "+3.2%", up: true },
    { label: "Click Rate", value: "4.8%", change: "-0.5%", up: false },
    { label: "Conversion Rate", value: "2.1%", change: "+0.3%", up: true },
    { label: "Revenue Generated", value: "TSh 3.2M", change: "+18.7%", up: true },
  ];

  const quickLinks = [
    { href: "/admin/coupons", label: "Coupons", icon: Percent, desc: "Manage discount coupons", color: "bg-blue-100 text-blue-600" },
    { href: "/admin/newsletter", label: "Newsletter", icon: Send, desc: "View subscribers & send campaigns", color: "bg-purple-100 text-purple-600" },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3, desc: "View detailed analytics", color: "bg-green-100 text-green-600" },
    { href: "/admin/reports", label: "Reports", icon: TrendingUp, desc: "Download marketing reports", color: "bg-orange-100 text-orange-600" },
  ];

  const recentCampaigns = [
    { name: "Summer Collection Launch", sent: "Jul 1, 2026", opens: "45%", clicks: "8.2%", status: "active" },
    { name: "Newsletter June", sent: "Jun 15, 2026", opens: "32%", clicks: "5.1%", status: "completed" },
    { name: "New Arrivals Alert", sent: "Jun 1, 2026", opens: "28%", clicks: "4.3%", status: "completed" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium text-ink">Marketing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Marketing campaigns and promotions overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campaignStats.map((s, i) => (
          <motion.div key={s.label} variants={item} className="rounded-xl border border-border bg-paper p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-2xl font-semibold text-ink">{s.value}</p>
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${s.up ? "text-green-600" : "text-red-600"}`}>
                {s.up ? <ArrowUpRight className="h-3 w-3" strokeWidth={2} /> : <ArrowDownRight className="h-3 w-3" strokeWidth={2} />}
                {s.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item} className="rounded-xl border border-border bg-paper p-6">
          <h2 className="font-serif text-lg text-ink mb-4">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div className="rounded-xl border border-border bg-background p-4 hover:shadow-md transition-all hover:-translate-y-0.5">
                  <div className={`rounded-lg w-fit p-2 ${link.color}`}>
                    <link.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <p className="mt-3 text-sm font-medium text-ink">{link.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-xl border border-border bg-paper p-6">
          <h2 className="font-serif text-lg text-ink mb-4">Recent Campaigns</h2>
          <div className="space-y-3">
            {recentCampaigns.map((camp, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-ink">{camp.name}</p>
                  <p className="text-xs text-muted-foreground">Sent {camp.sent}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Opens: {camp.opens}</span>
                  <span>Clicks: {camp.clicks}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${camp.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                    {camp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="rounded-xl border border-border bg-paper p-6">
        <h2 className="font-serif text-lg text-ink mb-4">Marketing Channels</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { channel: "Email Marketing", reach: "2,847", engagement: "24.6%", icon: Mail, color: "text-purple-600" },
            { channel: "Social Media", reach: "12.5K", engagement: "4.2%", icon: Users, color: "text-blue-600" },
            { channel: "Referral", reach: "456", engagement: "8.7%", icon: ExternalLink, color: "text-green-600" },
          ].map((ch, i) => (
            <div key={i} className="rounded-xl bg-background p-4 text-center">
              <ch.icon className={`mx-auto h-8 w-8 ${ch.color}`} strokeWidth={1.5} />
              <p className="mt-2 text-sm font-medium text-ink">{ch.channel}</p>
              <p className="text-xs text-muted-foreground">Reach: {ch.reach}</p>
              <p className="text-xs text-muted-foreground">Engagement: {ch.engagement}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
