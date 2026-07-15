import { ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getOrganization } from "@/lib/data";
import { ROLE_LABELS } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataList } from "@/components/ui/data-list";
import { formatDate } from "@/lib/utils";

export default async function SettingsPage() {
  const user = await requireUser();
  const org = await getOrganization();

  const SECURITY_NOTES = [
    "全画面で認証必須（未ログインはアクセス不可）",
    "ロールベースの権限管理（RBAC）で機能を制御",
    "organization_id によるマルチテナント分離",
    "Supabase Row Level Security（RLS）による行レベル制御を想定",
    "重要操作は操作ログ（監査ログ）として記録",
    "重要データは物理削除せず論理削除（deletedAt）で保持",
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="設定" description="組織・プロフィール・セキュリティに関する情報を確認できます。" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>組織情報</CardTitle>
          </CardHeader>
          <CardContent>
            <DataList
              columns={1}
              items={[
                { label: "組織名", value: org?.name },
                { label: "プラン", value: org?.plan },
                { label: "作成日", value: org ? formatDate(org.createdAt) : "—" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>プロフィール</CardTitle>
          </CardHeader>
          <CardContent>
            <DataList
              columns={1}
              items={[
                { label: "氏名", value: user.name },
                { label: "メールアドレス", value: user.email },
                { label: "ロール", value: ROLE_LABELS[user.role] },
                { label: "役職", value: user.title },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-navy-500" />
          <CardTitle>セキュリティ・テナント情報</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-navy-800">
            {SECURITY_NOTES.map((note) => (
              <li key={note} className="flex items-start gap-2">
                <span className="mt-0.5 text-success">✓</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            本デモではすべて閲覧のみです。設定の変更はできません。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
