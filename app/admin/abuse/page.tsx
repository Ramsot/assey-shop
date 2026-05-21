import { getAbuseReports } from "@/modules/admin/admin.actions";
import { AbuseClient } from "./abuse-client";

export const dynamic = "force-dynamic";

export default async function AbuseReportsPage() {
  const reports = await getAbuseReports();

  return <AbuseClient initialReports={reports} />;
}
