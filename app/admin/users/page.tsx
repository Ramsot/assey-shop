import { getUsers } from "@/modules/admin/admin.actions";
import { UsersClient } from "./users-client";

export default async function UsersPage() {
  const users = await getUsers();

  return <UsersClient initialUsers={users} />;
}
