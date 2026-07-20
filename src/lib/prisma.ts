/**
 * Prisma Client のシングルトン。
 * DATABASE_URL 未設定（デモ）時は生成しないため、遅延初期化する。
 */
import { PrismaClient } from "@prisma/client";
import { isDbConfigured } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Prisma Client を取得する。DATABASE_URL 未設定なら null。 */
export function getPrisma(): PrismaClient | null {
  if (!isDbConfigured()) return null;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}
