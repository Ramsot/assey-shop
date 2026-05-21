import { prisma } from "@/lib/prisma";
import { MikrotikClient } from "@/modules/routers/mikrotik.client";

export async function validateSession(
  macAddress: string,
  voucherCode: string,
  fingerprint?: string
) {
  // 1. Check if MAC is blocked
  const device = await prisma.device.findUnique({
    where: { macAddress },
  });

  if (device?.isBlocked) {
    throw new Error("Device is blocked due to suspicious activity");
  }

  // 2. Check voucher ownership/locking
  const voucher = await prisma.voucher.findUnique({
    where: { code: voucherCode },
    include: { package: true, sessions: { where: { isActive: true } } },
  });

  if (!voucher) throw new Error("Invalid voucher");

  // 3. MAC Locking check
  const activeSessions = voucher.sessions;
  if (activeSessions.length > 0) {
    const isSameDevice = activeSessions.some(s => s.macAddress === macAddress);
    if (!isSameDevice && activeSessions.length >= voucher.package.deviceLimit) {
      // Record abuse attempt
      await prisma.abuseReport.create({
        data: {
          type: "CONCURRENT_SESSIONS",
          macAddress,
          details: `Attempted to use voucher ${voucherCode} already active on another device`,
          severity: "MEDIUM",
        },
      });
      throw new Error("Voucher already in use on maximum allowed devices");
    }
  }

  // 4. Fingerprint mismatch detection (Session Cloning prevention)
  if (fingerprint && device?.fingerprint && device.fingerprint !== fingerprint) {
    await prisma.abuseReport.create({
      data: {
        type: "SESSION_CLONING",
        macAddress,
        details: `Fingerprint mismatch for device. Possible session cloning or MAC spoofing.`,
        severity: "HIGH",
      },
    });
    // Optional: Auto-block device if high severity
    // await prisma.device.update({ where: { macAddress }, data: { isBlocked: true } });
  }

  return true;
}

export async function logAbuse(type: string, details: string, macAddress?: string, ipAddress?: string) {
  return await prisma.abuseReport.create({
    data: {
      type,
      details,
      macAddress,
      ipAddress,
      severity: "LOW",
    },
  });
}
