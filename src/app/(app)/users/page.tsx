import { UserCog } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getUsers } from "@/lib/data";
import { ROLE_LABELS } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

export default async function UsersPage() {
  const user = await requireUser();

  if (user.role !== "admin") {
    return (
      <div className="space-y-6">
        <PageHeader title="ユーザー管理" />
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            権限がありません（管理者のみ）
          </CardContent>
        </Card>
      </div>
    );
  }

  const users = await getUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="ユーザー管理"
        description="組織内のメンバーとロールを管理します。"
      >
        <Button variant="gold">
          <UserCog className="h-4 w-4" />
          ユーザー招待
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>氏名</TH>
                <TH>メールアドレス</TH>
                <TH>ロール</TH>
                <TH>役職</TH>
                <TH>状態</TH>
              </TR>
            </THead>
            <TBody>
              {users.map((u) => (
                <TR key={u.id}>
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: u.avatarColor ?? "#33507F" }}
                      >
                        {u.name.charAt(0)}
                      </span>
                      <span className="font-medium text-navy-800">{u.name}</span>
                    </div>
                  </TD>
                  <TD className="text-muted-foreground">{u.email}</TD>
                  <TD>
                    <Badge tone={u.role === "admin" ? "navy" : "info"}>{ROLE_LABELS[u.role]}</Badge>
                  </TD>
                  <TD>{u.title ?? "—"}</TD>
                  <TD>
                    <Badge tone={u.active ? "success" : "muted"}>{u.active ? "有効" : "無効"}</Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>権限管理（RBAC）について</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          ロールに応じて画面・機能へのアクセスを制御しています（ロールベースアクセス制御）。
          管理者は全機能に加えテンプレート・ユーザー管理を利用でき、マーケティング担当者は
          担当する運用・分析・戦略機能を利用できます。招待・権限変更は本デモでは操作できません。
        </CardContent>
      </Card>
    </div>
  );
}
