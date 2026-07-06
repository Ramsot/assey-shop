import { getAbuseReports } from "@/modules/admin/admin.actions";
import { AbuseClient } from "./abuse-client";
import { safeSerialize } from "@/lib/safe-serializer";

export const dynamic = "force-dynamic";

export default async function AbuseReportsPage() {
  const reports = await getAbuseReports();

  return <AbuseClient initialReports={safeSerialize(reports)} />;
}
