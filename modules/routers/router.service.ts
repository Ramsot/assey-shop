import { prisma } from "@/lib/prisma";
import { MikrotikClient } from "./mikrotik.client";
import { decrypt, encrypt } from "@/lib/crypto";

export class RouterService {
  static async connectRouter(params: {
    name: string;
    ipAddress: string;
    apiPort: number;
    username: string;
    password: string;
    location?: string;
  }) {
    // 1. Encrypt password
    const passwordEncrypted = encrypt(params.password);

    // 2. Test connection
    const client = new MikrotikClient({
      host: params.ipAddress,
      port: params.apiPort,
      user: params.username,
      pass: params.password,
    });

    try {
      await client.checkConnection();
    } catch (error: any) {
      throw new Error(`Failed to connect to router: ${error.message}`);
    }

    // 3. Save to database
    const router = await prisma.router.create({
      data: {
        name: params.name,
        ipAddress: params.ipAddress,
        apiPort: params.apiPort,
        username: params.username,
        password: passwordEncrypted,
        location: params.location,
        status: "ONLINE",
        isConfigured: false,
      },
    });

    // 4. Trigger auto-provisioning
    this.provisionRouter(router.id).catch(console.error);

    return router;
  }

  static async provisionRouter(routerId: string) {
    const router = await prisma.router.findUnique({ where: { id: routerId } });
    if (!router) return;

    const password = decrypt(router.password);
    const client = new MikrotikClient({
      host: router.ipAddress,
      port: router.apiPort,
      user: router.username,
      pass: password,
    });

    try {
      await prisma.router.update({
        where: { id: routerId },
        data: { configStatus: "PENDING" },
      });

      // --- AUTO PROVISIONING SEQUENCE ---

      // 1. Set DNS
      await client.setDns("8.8.8.8,8.8.4.4");

      // 2. Create Hotspot Profile
      // Assuming the platform is hosted at a domain or IP accessible by the router
      const portalUrl = process.env.NEXT_PUBLIC_APP_URL || "http://your-portal-ip";
      const portalDomain = new URL(portalUrl).hostname;

      await client.createHotspotProfile("SecureNet_Profile", "mac,http-chap", portalDomain);

      // 3. Add Walled Garden for the portal
      await client.addWalledGarden(portalDomain, "SecureNet Portal Access");
      // Add other necessary domains (payment gateways, etc.)
      await client.addWalledGarden("*.m-pesa.com", "M-Pesa API");
      await client.addWalledGarden("*.airtel.com", "Airtel API");

      // 4. Configure Hotspot Server
      // Note: In a real scenario, we might need to know which interface to use.
      // For now, we'll try to find a bridge or wireless interface or ask the user.
      // Defaulting to "bridge" or "wlan1" if found, otherwise this might need manual selection.
      // For the sake of automation, let's assume "bridge-hotspot" exists or we create it.
      // await client.createHotspotServer("SecureNet_Hotspot", "bridge-hotspot", "SecureNet_Profile");

      // 5. Success
      await prisma.router.update({
        where: { id: routerId },
        data: {
          isConfigured: true,
          configStatus: "SUCCESS",
          status: "ONLINE",
          lastSeen: new Date(),
        },
      });

      console.log(`Router ${router.name} provisioned successfully.`);
    } catch (error: any) {
      console.error(`Provisioning failed for ${router.name}:`, error);
      await prisma.router.update({
        where: { id: routerId },
        data: {
          configStatus: "FAILED",
          configError: error.message,
        },
      });
    }
  }

  static async getRouterClient(routerId: string) {
    const router = await prisma.router.findUnique({ where: { id: routerId } });
    if (!router) throw new Error("Router not found");

    return new MikrotikClient({
      host: router.ipAddress,
      port: router.apiPort,
      user: router.username,
      pass: decrypt(router.password),
    });
  }

  static async syncRouterStatus(routerId: string) {
    try {
      const client = await this.getRouterClient(routerId);
      const resource = await client.getSystemResource();
      
      await prisma.router.update({
        where: { id: routerId },
        data: {
          status: "ONLINE",
          lastSeen: new Date(),
        },
      });
      return resource;
    } catch (error) {
      await prisma.router.update({
        where: { id: routerId },
        data: { status: "OFFLINE" },
      });
      throw error;
    }
  }
}
