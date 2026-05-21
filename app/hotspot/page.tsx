import { getPackages } from "@/modules/admin/admin.actions";
import { HotspotClient } from "./hotspot-client";
import { Suspense } from "react";

export default async function HotspotPortalPage() {
  const packages = await getPackages();

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HotspotClient packages={packages} />
    </Suspense>
  );
}
