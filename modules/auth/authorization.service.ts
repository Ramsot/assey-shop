import { prisma } from "@/lib/prisma";
import { RouterService } from "../routers/router.service";
import { SessionService } from "../sessions/session.service";

export class AuthorizationEngine {
  /**
   * Authorizes a device for internet access after payment
   */
  static async authorizeDevice(params: {
    voucherId: string;
    macAddress: string;
    ipAddress?: string;
  }) {
    const { voucherId, macAddress, ipAddress } = params;

    // 1. Get voucher and package details
    const voucher = await prisma.voucher.findUnique({
      where: { id: voucherId },
      include: { package: true, router: true },
    });

    if (!voucher || !voucher.routerId) {
      throw new Error("Invalid voucher or router not assigned");
    }

    if (voucher.status === "EXPIRED") {
      throw new Error("Voucher has expired");
    }

    // 2. Bind MAC address to voucher if not already
    await prisma.voucher.update({
      where: { id: voucherId },
      data: {
        macAddress,
        status: "ACTIVE",
        activatedAt: new Date(),
        expiresAt: voucher.package.duration 
          ? new Date(Date.now() + voucher.package.duration * 60 * 1000)
          : null,
      },
    });

    // 3. Push authorization to MikroTik
    const client = await RouterService.getRouterClient(voucher.routerId);

    try {
      // We use IP Binding with type=bypassed for seamless access
      // This allows the user to bypass the hotspot login page entirely
      await client.addIpBinding(macAddress, "bypassed", `Voucher: ${voucher.code}`);

      // Also create a Simple Queue for bandwidth control if specified
      if (voucher.package.speedLimitUp || voucher.package.speedLimitDown) {
        const speedLimit = `${voucher.package.speedLimitUp || "0"}/${voucher.package.speedLimitDown || "0"}`;
        // We need the target IP to create a queue, or we can use the MAC if we have an ARP entry
        // For now, if we have the IP, we use it.
        if (ipAddress) {
          await client.createQueue(`Q-${macAddress}`, ipAddress, speedLimit);
        }
      }

      // 4. Create local session
      await SessionService.createSession({
        voucherId,
        routerId: voucher.routerId,
        macAddress,
        ipAddress: ipAddress || "0.0.0.0",
      });

      console.log(`Device ${macAddress} authorized successfully for voucher ${voucher.code}`);
    } catch (error: any) {
      console.error(`Failed to push authorization to MikroTik: ${error.message}`);
      // Even if MikroTik push fails, we've updated the DB. 
      // A background sync job should retry this.
    }
  }

  /**
   * Revokes internet access for a device
   */
  static async revokeAccess(voucherId: string) {
    const voucher = await prisma.voucher.findUnique({
      where: { id: voucherId },
      include: { router: true },
    });

    if (!voucher || !voucher.macAddress || !voucher.routerId) return;

    const client = await RouterService.getRouterClient(voucher.routerId);

    try {
      // 1. Remove IP Binding
      await client.removeIpBinding(voucher.macAddress);

      // 2. Terminate active sessions on MikroTik if any
      await client.terminateSession(voucher.macAddress);

      // 3. Update DB
      await prisma.voucher.update({
        where: { id: voucherId },
        data: { status: "EXPIRED" },
      });

      await prisma.session.updateMany({
        where: { voucherId, isActive: true },
        data: { 
          isActive: false, 
          endTime: new Date(),
          terminateReason: "EXPIRED"
        },
      });

      console.log(`Access revoked for device ${voucher.macAddress}`);
    } catch (error: any) {
      console.error(`Failed to revoke access on MikroTik: ${error.message}`);
    }
  }
}
