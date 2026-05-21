import { getSettings } from "@/modules/admin/admin.actions";
import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const initialSettings = await getSettings();

  return <SettingsClient initialSettings={initialSettings} />;
}
