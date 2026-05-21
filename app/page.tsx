import Link from "next/link";
import { Wifi, Shield, Zap, BarChart3, Globe, Smartphone, ArrowRight } from "lucide-react";
import { getPublicStats } from "@/modules/admin/admin.actions";

export default async function LandingPage() {
  const stats = await getPublicStats();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Wifi className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SecureNet OS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-white transition-colors">Solutions</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-blue-400 transition-colors">Admin Login</Link>
            <Link href="/hotspot" className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-500 hover:text-white transition-all">
              Demo Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Next-Gen ISP OS</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            Secure. Scale. <br />Succeed.
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
            The enterprise-grade WiFi voucher management system designed for modern ISPs and hotspot operators. Join {stats.activeUsers}+ active users today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/login" className="w-full sm:w-auto bg-blue-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 group">
              Get Started Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#features" className="w-full sm:w-auto bg-white/5 border border-white/10 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
              Explore Features
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto mt-20 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div>
              <p className="text-3xl font-black text-blue-400">{stats.activeUsers}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mt-1">Active Sessions</p>
            </div>
            <div>
              <p className="text-3xl font-black text-purple-400">{stats.totalVouchers}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mt-1">Vouchers Sold</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-3xl font-black text-green-400">{stats.coverage}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mt-1">Uptime Guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: Shield, 
              title: "Anti-Bypass System", 
              desc: "Prevent MAC spoofing and voucher sharing with our proprietary device fingerprinting technology." 
            },
            { 
              icon: Zap, 
              title: "Instant Payments", 
              desc: "Native integration with M-Pesa, Airtel Money, and more for automated voucher delivery." 
            },
            { 
              icon: BarChart3, 
              title: "Real-time Analytics", 
              desc: "Monitor network health, revenue, and active sessions from a beautiful glassmorphism dashboard." 
            },
            { 
              icon: Globe, 
              title: "Multi-Router Support", 
              desc: "Manage thousands of routers across different locations from a single centralized interface." 
            },
            { 
              icon: Smartphone, 
              title: "Mobile First", 
              desc: "Perfectly optimized captive portal for any screen size, providing a premium user experience." 
            },
            { 
              icon: Zap, 
              title: "MikroTik Native", 
              desc: "Built-in integration with RouterOS API for precise bandwidth control and session management." 
            },
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-white/50 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold tracking-tight">SecureNet OS</span>
          </div>
          <p className="text-white/30 text-sm">
            © 2026 SecureNet Voucher OS. All rights reserved. Built for professional ISPs.
          </p>
          <div className="flex gap-6 text-white/30 text-sm">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
