/**
 * クライアントポータル用のスコープ解決。
 * クライアントユーザーは自社（clientId）の店舗のみ閲覧できる。
 */
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getClient, getStoresByClient } from "@/lib/data";
import type { User, Client, Store } from "@/types";

export interface PortalScope {
  user: User;
  client: Client;
  stores: Store[];
}

/** クライアントユーザーのスコープを取得（不正なら本体アプリ/ログインへ） */
export async function requireClientScope(): Promise<PortalScope> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "client" || !user.clientId) redirect("/dashboard");

  const client = await getClient(user.clientId);
  if (!client) redirect("/login");
  const stores = await getStoresByClient(client.id);

  return { user, client, stores };
}

/** 対象店舗を解決（?store= 指定 or 先頭）。スコープ外は先頭にフォールバック */
export function resolveStore(stores: Store[], storeId?: string): Store | undefined {
  if (storeId) {
    const found = stores.find((s) => s.id === storeId);
    if (found) return found;
  }
  return stores[0];
}
