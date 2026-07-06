import { prisma } from "@/lib/prisma";

export function generateVoucherCode(length: number = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars like 0, O, 1, I
  let code = "";
  const randomBytes = new Uint32Array(length);
  global.crypto.getRandomValues(randomBytes);
  
  for (let i = 0; i < length; i++) {
    code += chars[randomBytes[i] % chars.length];
  }
  return code;
}

export async function createBulkVouchers(packageId: string, count: number, routerId?: string) {
  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg) throw new Error("Package not found");

  const vouchers = [];
  for (let i = 0; i < count; i++) {
    vouchers.push({
      code: generateVoucherCode(),
      packageId,
      routerId,
      status: "PENDING",
    });
  }

  return await prisma.voucher.createMany({
    data: vouchers,
  });
}

export async function activateVoucher(code: string, userId?: string, routerId?: string) {
  const voucher = await prisma.voucher.findUnique({
    where: { code },
    include: { package: true },
  });

  if (!voucher) throw new Error("Invalid voucher code");
  if (voucher.status !== "PENDING") throw new Error("Voucher already used or expired");

  const activatedAt = new Date();
  let expiresAt: Date | null = null;

  if (voucher.package.duration) {
    expiresAt = new Date(activatedAt.getTime() + voucher.package.duration * 60 * 1000);
  }

  return await prisma.voucher.update({
    where: { id: voucher.id },
    data: {
      status: "ACTIVE",
      userId,
      routerId,
      activatedAt,
      expiresAt,
      remainingData: voucher.package.dataLimit,
    },
  });
}

