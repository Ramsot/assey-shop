import { prisma } from "@/lib/prisma";
import { RouterService } from "../routers/router.service";
import { AuthorizationEngine } from "../auth/authorization.service";

export class SyncService {
  /**
   * Main sync job to be run periodically (e.g., every 1-5 minutes)
   */
  static async runGlobalSync() {
    console.log("Starting global synchronization job...");
    
    // 1. Process Expired Sessions
    await this.processExpiredSessions();

    // 2. Sync with each online router
    const routers = await prisma.router.findMany({
      where: { status: "ONLINE" }
    });

    for (const router of routers) {
      await this.syncRouterSessions(router.id).catch(err => 
        console.error(`Sync failed for router ${router.name}:`, err)
      );
    }

    console.log("Global synchronization job completed.");
  }

  /**
   * Finds and revokes access for expired vouchers
   */
  private static async processExpiredSessions() {
    const now = new Date();
    
    // Find vouchers that have expired but are still marked as ACTIVE
    const expiredVouchers = await prisma.voucher.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: { lt: now }
      }
    });

    console.log(`Found ${expiredVouchers.length} expired vouchers to revoke.`);

    for (const voucher of expiredVouchers) {
      await AuthorizationEngine.revokeAccess(voucher.id).catch(err =>
        console.error(`Failed to revoke expired voucher ${voucher.code}:`, err)
      );
    }
  }

  /**
   * Synchronizes active sessions from a specific router
   */
  private static async syncRouterSessions(routerId: string) {
    const client = await RouterService.getRouterClient(routerId);
    
    // 1. Get active sessions from MikroTik
    const activeHotspotSessions = await client.getActiveSessions();

    // 2. Update local session records with latest bandwidth usage
    for (const remoteSession of activeHotspotSessions) {
      const macAddress = remoteSession["mac-address"];
      const bytesIn = parseInt(remoteSession["bytes-in"] || "0");
      const bytesOut = parseInt(remoteSession["bytes-out"] || "0");

      await prisma.session.updateMany({
        where: {
          routerId,
          macAddress,
          isActive: true
        },
        data: {
          bytesIn,
          bytesOut,
          lastSeen: new Date() // We should add this field to Session model if needed
        }
      });
    }

    // 3. Optional: Check for local active sessions that are no longer on MikroTik
    // and mark them as terminated.
  }
}
