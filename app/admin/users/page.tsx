import { getUsers } from "@/modules/admin/admin.actions";
import { UsersClient } from "./users-client";
import { safeSerialize } from "@/lib/safe-serializer";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await getUsers();

  return <UsersClient initialUsers={safeSerialize(users)} />;
}
