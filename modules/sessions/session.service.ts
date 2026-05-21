import { prisma } from "@/lib/prisma";

export class SessionService {
  static async createSession(params: {
    voucherId: string;
    routerId: string;
    macAddress: string;
    ipAddress: string;
    fingerprint?: string;
  }) {
    const { voucherId, routerId, macAddress, ipAddress, fingerprint } = params;

    // 1. Create session record
    const session = await prisma.session.create({
      data: {
        voucherId,
        routerId,
        macAddress,
        ipAddress,
        fingerprint,
        isActive: true,
      },
    });

    // 2. Update device last seen and fingerprint
    await prisma.device.upsert({
      where: { macAddress },
      update: { lastSeen: new Date(), fingerprint },
      create: {
        macAddress,
        userId: (await prisma.voucher.findUnique({ where: { id: voucherId } }))?.userId || "guest",
        fingerprint,
      },
    });

    return session;
  }

  static async terminateSession(sessionId: string, reason: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { router: true, voucher: true },
    });

    if (!session) return;

    // Note: Router termination is handled by AuthorizationEngine or sync jobs
    // to avoid circular dependencies.

    // Update DB
    return await prisma.session.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        endTime: new Date(),
        terminateReason: reason,
      },
    });
  }

  static async getActiveSessions(routerId?: string) {
    return prisma.session.findMany({
      where: {
        isActive: true,
        ...(routerId ? { routerId } : {}),
      },
      include: {
        voucher: {
          include: {
            package: true,
          },
        },
        router: true,
      },
    });
  }
}
