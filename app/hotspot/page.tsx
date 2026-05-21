import { getPackages } from "@/modules/admin/admin.actions";
import { HotspotClient } from "./hotspot-client";

export default async function HotspotPortalPage() {
  const packages = await getPackages();

  return <HotspotClient packages={packages} />;
}
