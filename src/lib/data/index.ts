import "server-only";
import type { DataProvider } from "./provider";
import { MemoryProvider } from "./memory";
import { isSupabaseMode } from "@/lib/supabase";

export type { DataProvider } from "./provider";

// メモリプロバイダはステートレスなためプロセス内で使い回す。
let memorySingleton: MemoryProvider | null = null;

/**
 * DATA_SOURCE に応じたデータプロバイダを返す。
 * - seed(既定): MemoryProvider(モックモード)
 * - supabase   : SupabaseProvider(RLS。per-user には accessToken を渡す)
 * SupabaseProvider は動的 import で読み込み、seed モードでは supabase-js を触らない。
 */
export async function getData(accessToken?: string): Promise<DataProvider> {
  if (isSupabaseMode()) {
    const { SupabaseProvider } = await import("./supabase");
    return new SupabaseProvider(accessToken);
  }
  return (memorySingleton ??= new MemoryProvider());
}
