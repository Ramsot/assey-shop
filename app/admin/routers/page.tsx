import { getRouters } from "@/modules/admin/admin.actions";
import { RoutersClient } from "./routers-client";

export default async function RoutersPage() {
  const routers = await getRouters();

  return <RoutersClient initialRouters={routers} />;
}
