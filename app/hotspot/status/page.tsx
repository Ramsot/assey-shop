import { redirect } from "next/navigation";
import { Wifi, CheckCircle2, Clock, Database, ArrowRight } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HotspotStatusPage(props: {
  searchParams?: Promise<{ code?: string; mac?: string }>;
}) {
  const searchParams = await props.searchParams;
  const code = searchParams?.code;
  const mac = searchParams?.mac;

  if (!code) {
    redirect("/hotspot");
  }

  const voucher = await prisma.voucher.findUnique({
    where: { code },
    include: { package: true },
  });

  if (!voucher) {
    redirect("/hotspot");
  }

  const now = new Date();
  let remainingTime = "--";
  if (voucher.expiresAt) {
    const diffMs = voucher.expiresAt.getTime() - now.getTime();
    if (diffMs > 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      remainingTime = `${hours}h ${mins}m`;
    } else {
      remainingTime = "Expired";
    }
  }

  const dataLimit = voucher.package.dataLimit
    ? `${(Number(voucher.package.dataLimit) / (1024 * 1024 * 1024)).toFixed(1)} GB`
    : "Unlimited";

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Connected</h1>
            <p className="text-white/60">Your internet access is now active</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium">Remaining Time</span>
            </div>
            <span className="font-bold">{remainingTime}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium">Data Limit</span>
            </div>
            <span className="font-bold">{dataLimit}</span>
          </div>
        </div>

        <div className="pt-4">
          <Link
            href="https://www.google.com"
            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 transition-all rounded-2xl font-bold"
          >
            Start Browsing
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <p className="text-center text-white/30 text-xs font-mono">
          Code: {voucher.code}
          {mac && <> | MAC: {mac}</>}
        </p>
      </div>
    </div>
  );
}
