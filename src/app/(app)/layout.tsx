import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { db } from "@/lib/store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const org = db.organizations.find((o) => o.id === user.organizationId);
  const unread = db.notifications.filter((n) => n.userId === user.id && !n.read).length;

  return (
    <div className="flex min-h-screen">
      <Sidebar isAdmin={isAdmin(user)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={user} orgName={org?.name ?? ""} unreadCount={unread} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
