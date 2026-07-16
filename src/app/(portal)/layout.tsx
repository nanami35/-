import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getClient } from "@/lib/data";
import { PortalShell } from "@/components/portal/portal-shell";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // ポータルはクライアントロール専用。社内ユーザーは本体アプリへ。
  if (user.role !== "client") redirect("/dashboard");

  const client = user.clientId ? await getClient(user.clientId) : undefined;

  return (
    <PortalShell
      user={{ name: user.name, title: user.title, avatarColor: user.avatarColor }}
      clientName={client?.name ?? "—"}
    >
      {children}
    </PortalShell>
  );
}
