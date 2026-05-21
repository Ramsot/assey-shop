import { getRouters } from "@/modules/admin/admin.actions";
import { RoutersClient } from "./routers-client";
import { safeSerialize } from "@/lib/safe-serializer";

export const dynamic = "force-dynamic";

export default async function RoutersPage() {
  const routers = await getRouters();

  return <RoutersClient initialRouters={safeSerialize(routers)} />;
}
