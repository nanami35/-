/**
 * 認証ブートストラップ用のユーザー参照。
 * organization スコープ「前」のユーザー解決に使う（所属 org を得るため）。
 * data.ts（org スコープ済みのリポジトリ）とは独立させ、循環参照を避ける。
 */
import { isDbConfigured } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import * as db from "@/lib/sample-data";
import type { User } from "@/types";
import type { Role } from "@/lib/constants";

function mapPrismaUser(u: {
  id: string; organizationId: string; name: string; email: string; role: string;
  title: string | null; avatarColor: string | null; active: boolean;
  clientId: string | null; createdAt: Date; updatedAt: Date;
}): User {
  return {
    id: u.id, organizationId: u.organizationId, name: u.name, email: u.email,
    role: u.role as Role, title: u.title ?? undefined,
    avatarColor: u.avatarColor ?? undefined, active: u.active,
    clientId: u.clientId ?? undefined,
    createdAt: u.createdAt.toISOString(), updatedAt: u.updatedAt.toISOString(),
    createdBy: u.id, updatedBy: u.id,
  };
}

/** アプリユーザー ID で解決する（デモ Cookie 用） */
export async function findUserById(id?: string): Promise<User | undefined> {
  if (!id) return undefined;
  const prisma = getPrisma();
  if (prisma) {
    const u = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    return u ? mapPrismaUser(u) : undefined;
  }
  return db.users.find((x) => x.id === id);
}

/** Supabase Auth の user id で解決する */
export async function findUserByAuthId(authUserId: string): Promise<User | undefined> {
  if (!isDbConfigured()) return undefined;
  const prisma = getPrisma();
  if (!prisma) return undefined;
  const u = await prisma.user.findFirst({ where: { authUserId, deletedAt: null } });
  return u ? mapPrismaUser(u) : undefined;
}

/** デモのアカウント一覧（ログイン画面用） */
export async function listSelectableUsers(): Promise<User[]> {
  const prisma = getPrisma();
  if (prisma) {
    const rows = await prisma.user.findMany({
      where: { deletedAt: null }, orderBy: { createdAt: "asc" },
    });
    return rows.map(mapPrismaUser);
  }
  return db.users;
}
