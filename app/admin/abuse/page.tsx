import { getAbuseReports } from "@/modules/admin/admin.actions";
import { AbuseClient } from "./abuse-client";

export default async function AbuseReportsPage() {
  const reports = await getAbuseReports();

  return <AbuseClient initialReports={reports} />;
}
