import { getVouchers, getPackages } from "@/modules/admin/admin.actions";
import { VouchersClient } from "./vouchers-client";

export default async function VouchersPage() {
  const { vouchers, total } = await getVouchers();
  const packages = await getPackages();

  return <VouchersClient initialVouchers={vouchers} total={total} packages={packages} />;
}
