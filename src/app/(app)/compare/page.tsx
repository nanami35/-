import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/store";
import { comparisonTargetLabels } from "@/lib/seed/comparison";
import { PageHeader } from "@/components/ui/page";
import { MatrixView } from "@/components/matrix-view";

export default async function ComparePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const matrix = db.comparisonMatrices[0];

  return (
    <div>
      <PageHeader
        title="比較マトリクス"
        description={matrix?.description ?? "支援モデルを横断比較します。"}
      />
      {matrix ? (
        <MatrixView matrix={matrix} targetLabels={comparisonTargetLabels} />
      ) : (
        <p className="text-sm text-muted">比較表がありません。</p>
      )}
    </div>
  );
}
