import { PrismaClient } from "@prisma/client";

// BigInt is not serializable by JSON.stringify in production.
// This polyfill ensures Prisma BigInt fields (dataLimit, bytesIn, etc.)
// serialize correctly in React Server Component payloads.
if (typeof BigInt !== "undefined" && !(BigInt as any).prototype.toJSON) {
  (BigInt as any).prototype.toJSON = function () {
    const n = Number(this);
    if (!Number.isSafeInteger(n)) {
      return this.toString();
    }
    return n;
  };
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
