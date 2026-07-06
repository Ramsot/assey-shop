"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Ticket,
  Wifi,
  ShieldCheck,
  Zap,
  CreditCard,
  Clock,
  Database,
  Smartphone,
  Loader2,
} from "lucide-react";

interface HotspotClientProps {
  packages: any[];
}

export function HotspotClient({ packages }: HotspotClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentRef, setPaymentRef] = useState("");
  const [error, setError] = useState("");
  const [showVoucherInput, setShowVoucherInput] = useState(false);

  const mac = searchParams.get("mac");
  const ip = searchParams.get("ip");
  const routerId = searchParams.get("router_id");

  const handleBuyPackage = async (pkg: any) => {
    if (!phoneNumber) {
      setError("Please enter your phone number first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          packageId: pkg.id,
          mac,
          ip,
          routerId: routerId || pkg.id,
          method: "MPESA",
          amount: pkg.price,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setPaymentRef(data.reference);
      setPaymentInitiated(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to initiate payment.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoucherConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter a voucher code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/hotspot/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase(), mac, ip }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const params = new URLSearchParams();
      params.set("code", code.toUpperCase());
      if (mac) params.set("mac", mac);
      router.push(`/hotspot/status?${params.toString()}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to connect. Please check your code.");
    } finally {
      setLoading(false);
    }
  };

  if (paymentInitiated) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold">Processing Payment</h2>
          <p className="text-white/60">
            Please check your phone for the M-Pesa PIN prompt.
            Once you enter your PIN, your internet will be activated automatically.
          </p>
          {paymentRef && (
            <p className="text-xs text-white/30 font-mono">Ref: {paymentRef}</p>
          )}
          <div className="pt-4">
            <button
              onClick={() => setPaymentInitiated(false)}
              className="text-white/40 text-sm hover:text-white"
            >
              Cancel and go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-700 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 mb-6 shadow-lg shadow-blue-500/20">
            <Wifi className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">SecureNet Hotspot</h1>
          <p className="text-white/50 mt-2 font-medium">Fast & Secure Internet Access</p>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl">
          {showVoucherInput ? (
            <form onSubmit={handleVoucherConnect} className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-400" />
                Use Voucher Code
              </h2>
              <div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 transition-all font-mono tracking-[0.2em] text-lg uppercase"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Connect"}
              </button>
              <button
                type="button"
                onClick={() => setShowVoucherInput(false)}
                className="w-full text-white/40 text-sm hover:text-white transition-colors"
              >
                Back to Packages
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 ml-1 text-white/70">
                  Phone Number (M-Pesa)
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="07XX XXX XXX"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider">
                  Select Package
                </h2>
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => handleBuyPackage(pkg)}
                      disabled={loading}
                      className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group relative overflow-hidden disabled:opacity-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-lg group-hover:text-blue-400">
                          {pkg.name}
                        </span>
                        <span className="text-blue-400 font-black">
                          {Number(pkg.price).toLocaleString()} TZS
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-white/40 font-medium">
                        {pkg.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {pkg.duration >= 60
                              ? `${Math.floor(pkg.duration / 60)}h`
                              : `${pkg.duration}m`}
                          </span>
                        )}
                        {pkg.dataLimit && (
                          <span className="flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            {(Number(pkg.dataLimit) / 1024 / 1024 / 1024).toFixed(1)} GB
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {pkg.speedLimitDown}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowVoucherInput(true)}
                  className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-medium"
                >
                  <Ticket className="w-4 h-4" />
                  Have a voucher code?
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-3 px-4 rounded-xl flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-8 flex justify-center gap-8 opacity-40">
          <ShieldCheck className="w-6 h-6" />
          <Zap className="w-6 h-6" />
          <CreditCard className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
