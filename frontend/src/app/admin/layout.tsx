import { getCurrentUser } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (user) {
    return (
      <div className="flex min-h-screen bg-[#f8f7f4] dark:bg-[#121214]">
        <AdminSidebar user={user} />
        <div className="flex flex-1 flex-col min-w-0">
          <AdminHeader user={user} />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
