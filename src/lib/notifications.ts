/**
 * 通知の算出。
 * 現時点ではリアルタイム基盤がないため、現在のデータから
 * 「対応が必要な事項」を通知として導出する（org スコープ）。
 *
 * 将来は activity_logs / webhook / スケジューラと連携し、
 * 永続化された通知（既読管理付き）に置き換える。
 */
import {
  getTasks, getStores, getKpiByStore, getReports, getIssues, getUserMap,
} from "@/lib/data";
import { isOverdue } from "@/lib/utils";
import type { User } from "@/types";

export type NotificationSeverity = "danger" | "warning" | "info" | "success";

export interface AppNotification {
  id: string;
  severity: NotificationSeverity;
  title: string;
  description: string;
  href: string;
  icon: string; // lucide アイコン名
}

const CURRENT_MONTH = "2026-07";

/** 期限までの残日数（負なら超過） */
function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

/**
 * 現在ユーザー向けの通知を算出する。
 * 管理者は全体、担当者は担当店舗＋自分の担当タスクを対象にする。
 */
export async function getNotifications(user: User): Promise<AppNotification[]> {
  const isAdmin = user.role === "admin";
  const [tasks, stores, reports, issues, userMap] = await Promise.all([
    getTasks(),
    getStores(),
    getReports(),
    getIssues(),
    getUserMap(),
  ]);

  const myStoreIds = new Set(
    stores.filter((s) => isAdmin || s.consultantId === user.id).map((s) => s.id)
  );
  const inScopeStore = (storeId?: string) =>
    !storeId || isAdmin || myStoreIds.has(storeId);

  const notifications: AppNotification[] = [];

  // 期限超過 / 期限間近のタスク（自分の担当、管理者は全体）
  for (const t of tasks) {
    if (t.status === "done") continue;
    const mine = isAdmin || t.assigneeId === user.id;
    if (!mine) continue;
    const d = daysUntil(t.dueDate);
    if (d === null) continue;
    if (d < 0) {
      notifications.push({
        id: `task-overdue-${t.id}`,
        severity: "danger",
        title: "期限超過タスク",
        description: `「${t.title}」の期限が ${-d}日超過しています`,
        href: "/tasks",
        icon: "ListChecks",
      });
    } else if (d <= 3) {
      notifications.push({
        id: `task-soon-${t.id}`,
        severity: "warning",
        title: "期限が近いタスク",
        description: `「${t.title}」の期限まで${d === 0 ? "本日" : `あと${d}日`}`,
        href: "/tasks",
        icon: "ListChecks",
      });
    }
  }

  // KPI 未入力の店舗（当月）
  for (const s of stores) {
    if (!myStoreIds.has(s.id)) continue;
    const kpi = await getKpiByStore(s.id);
    if (!kpi.some((k) => k.month === CURRENT_MONTH)) {
      notifications.push({
        id: `kpi-missing-${s.id}`,
        severity: "warning",
        title: "KPI未入力",
        description: `${s.name} の${CURRENT_MONTH.replace("-", "年")}月のKPIが未入力です`,
        href: `/kpi?store=${s.id}`,
        icon: "LineChart",
      });
    }
  }

  // 次回ミーティングが近い店舗（7日以内）
  for (const s of stores) {
    if (!myStoreIds.has(s.id)) continue;
    const d = daysUntil(s.nextMeetingDate);
    if (d !== null && d >= 0 && d <= 7) {
      notifications.push({
        id: `meeting-${s.id}`,
        severity: "info",
        title: "定例ミーティング",
        description: `${s.name} の次回MTGは${d === 0 ? "本日" : `あと${d}日`}`,
        href: `/stores/${s.id}?tab=support`,
        icon: "CalendarClock",
      });
    }
  }

  // 承認待ち / 下書きの月次レポート
  for (const r of reports) {
    if (!inScopeStore(r.storeId)) continue;
    if (r.status === "draft" || r.status === "review") {
      const store = stores.find((s) => s.id === r.storeId);
      notifications.push({
        id: `report-${r.id}`,
        severity: "info",
        title: r.status === "review" ? "レポート確認待ち" : "レポート下書き",
        description: `${store?.name ?? "店舗"} の${r.month}レポートが${r.status === "review" ? "確認待ち" : "下書き"}です`,
        href: `/reports/${r.id}`,
        icon: "FileText",
      });
    }
  }

  // 高優先度の未着手課題
  for (const i of issues) {
    if (!inScopeStore(i.storeId)) continue;
    if (i.status === "open" && i.impact >= 3 && i.urgency >= 3) {
      const store = stores.find((s) => s.id === i.storeId);
      notifications.push({
        id: `issue-${i.id}`,
        severity: "warning",
        title: "重要課題が未着手",
        description: `${store?.name ?? "店舗"}「${i.title}」（担当: ${userMap.get(i.assigneeId ?? "")?.name ?? "未割当"}）`,
        href: "/issues",
        icon: "AlertTriangle",
      });
    }
  }

  const order: Record<NotificationSeverity, number> = { danger: 0, warning: 1, info: 2, success: 3 };
  return notifications.sort((a, b) => order[a.severity] - order[b.severity]);
}

/** 要対応（danger/warning）の件数 */
export function actionableCount(notifications: AppNotification[]): number {
  return notifications.filter((n) => n.severity === "danger" || n.severity === "warning").length;
}
