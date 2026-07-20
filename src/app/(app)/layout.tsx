import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { getNotifications } from "@/lib/notifications";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // クライアントロールは専用ポータルへ
  if (user.role === "client") redirect("/portal");

  const notifications = await getNotifications(user);

  return (
    <AppShell
      user={{
        name: user.name,
        role: user.role,
        title: user.title,
        avatarColor: user.avatarColor,
      }}
      notifications={notifications}
    >
      {children}
    </AppShell>
  );
}
