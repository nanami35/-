"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser, destroySession } from "@/lib/auth";
import { isSupabaseMode } from "@/lib/supabase";
import { audit, db, newId, nowIso } from "@/lib/store";
import { canApprove, canEdit } from "@/lib/rbac";
import type { Company, KnowledgeArticle, Status, Visibility } from "@/lib/types";
import { base } from "@/lib/seed/helpers";

export async function logoutAction(): Promise<void> {
  const user = await getCurrentUser();
  if (user) audit(user.organizationId, user.id, "auth.logout");
  if (isSupabaseMode()) {
    const { supabaseSignOut } = await import("@/lib/auth-supabase");
    await supabaseSignOut();
  } else {
    await destroySession();
  }
  redirect("/login");
}

// --- お気に入り(要件 8-20) -----------------------------------------
export async function toggleFavoriteAction(entityType: string, entityId: string, path: string) {
  const user = await getCurrentUser();
  if (!user) return;
  const idx = db.favorites.findIndex(
    (f) => f.userId === user.id && f.entityType === entityType && f.entityId === entityId,
  );
  if (idx >= 0) {
    db.favorites.splice(idx, 1);
  } else {
    db.favorites.push({
      id: newId("fav"),
      userId: user.id,
      entityType,
      entityId,
      createdAt: nowIso(),
    });
  }
  revalidatePath(path);
}

// --- 閲覧履歴(要件 8-20) -------------------------------------------
export async function recordViewAction(entityType: string, entityId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  db.readingHistories.unshift({
    id: newId("rh"),
    userId: user.id,
    entityType,
    entityId,
    viewedAt: nowIso(),
  });
  db.readingHistories = db.readingHistories.slice(0, 200);
}

// --- 通知既読(要件 8-18) -------------------------------------------
export async function markNotificationReadAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return;
  const n = db.notifications.find((x) => x.id === id && x.userId === user.id);
  if (n) n.read = true;
  revalidatePath("/notifications");
}

export async function markAllNotificationsReadAction() {
  const user = await getCurrentUser();
  if (!user) return;
  db.notifications.filter((n) => n.userId === user.id).forEach((n) => (n.read = true));
  revalidatePath("/notifications");
}

// --- 承認フロー(要件 8-14) -----------------------------------------
type Approvable = { id: string; status: Status; organizationId: string; updatedBy: string; updatedAt: string };

function findApprovable(entityType: string, id: string): Approvable | undefined {
  const map: Record<string, { id: string }[]> = {
    company: db.companies,
    knowledge: db.knowledgeArticles,
    case: db.caseStudies,
    business_model: db.businessModels,
    project: db.projects,
    meeting: db.meetings,
  };
  return map[entityType]?.find((x) => x.id === id) as Approvable | undefined;
}

export async function transitionStatusAction(
  entityType: string,
  id: string,
  next: Status,
  path: string,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "未認証です" };
  const approverStates: Status[] = ["approved", "published", "revision_requested", "unpublished"];
  if (approverStates.includes(next) && !canApprove(user)) {
    return { error: "この操作には承認者以上の権限が必要です。" };
  }
  if (!canEdit(user)) return { error: "編集権限がありません。" };

  const entity = findApprovable(entityType, id);
  if (!entity) return { error: "対象が見つかりません。" };
  const prev = entity.status;
  entity.status = next;
  entity.updatedBy = user.id;
  entity.updatedAt = nowIso();
  audit(user.organizationId, user.id, "status.transition", entityType, id, `${prev} → ${next}`);
  revalidatePath(path);
  revalidatePath("/approvals");
  return { ok: true };
}

// --- コメント(要件 8-19) -------------------------------------------
export async function addCommentAction(entityType: string, entityId: string, body: string, path: string) {
  const user = await getCurrentUser();
  if (!user || !body.trim()) return;
  db.comments.push({
    id: newId("cmt"),
    organizationId: user.organizationId,
    entityType,
    entityId,
    authorId: user.id,
    body: body.trim(),
    resolved: false,
    createdAt: nowIso(),
  });
  audit(user.organizationId, user.id, "comment.add", entityType, entityId);
  revalidatePath(path);
}

// --- 企業CRUD(要件 8-5) --------------------------------------------
export async function createCompanyAction(_prev: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !canEdit(user)) return { error: "編集権限がありません。" };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "企業名は必須です。" };

  const company: Company = {
    ...base({
      id: newId("co"),
      organizationId: user.organizationId,
      status: (String(formData.get("status")) as Status) || "draft",
      visibility: (String(formData.get("visibility")) as Visibility) || "all_staff",
      confidenceLevel: "C",
      certaintyLevel: "needs_check",
      createdBy: user.id,
      updatedBy: user.id,
    }),
    name,
    nameKana: str(formData, "nameKana"),
    industry: str(formData, "industry"),
    category: String(formData.get("category") ?? "other"),
    website: str(formData, "website"),
    representative: str(formData, "representative"),
    location: str(formData, "location"),
    logoText: name.slice(0, 2),
    tags: strList(formData, "tags"),
    businessModel: {
      valueProposition: str(formData, "valueProposition"),
      revenueModel: str(formData, "revenueModel"),
    },
    analysis: {
      strengths: strList(formData, "strengths"),
    },
    application: {
      abengersLearnings: strList(formData, "abengersLearnings"),
    },
  };
  db.companies.unshift(company);
  audit(user.organizationId, user.id, "company.create", "company", company.id, name);
  revalidatePath("/companies");
  redirect(`/companies/${company.id}`);
}

// --- ノウハウ作成(要件 8-9) ----------------------------------------
export async function createKnowledgeAction(_prev: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !canEdit(user)) return { error: "編集権限がありません。" };
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "タイトルは必須です。" };

  const article: KnowledgeArticle = {
    ...base({
      id: newId("kn"),
      organizationId: user.organizationId,
      status: (String(formData.get("status")) as Status) || "draft",
      visibility: (String(formData.get("visibility")) as Visibility) || "all_staff",
      confidenceLevel: "C",
      certaintyLevel: "hypothesis",
      createdBy: user.id,
      updatedBy: user.id,
    }),
    title,
    category: String(formData.get("category") ?? "経営戦略"),
    summary: str(formData, "summary"),
    conclusion: str(formData, "conclusion"),
    practice: str(formData, "practice"),
    abengersUsage: str(formData, "abengersUsage"),
    koeniUsage: str(formData, "koeniUsage"),
    importance: (String(formData.get("importance")) as "high" | "medium" | "low") || "medium",
    tags: strList(formData, "tags"),
  };
  db.knowledgeArticles.unshift(article);
  audit(user.organizationId, user.id, "knowledge.create", "knowledge", article.id, title);
  revalidatePath("/knowledge");
  redirect(`/knowledge/${article.id}`);
}

function str(fd: FormData, key: string): string | undefined {
  const v = String(fd.get(key) ?? "").trim();
  return v || undefined;
}
function strList(fd: FormData, key: string): string[] {
  return String(fd.get(key) ?? "")
    .split(/[\n,、]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
