import axios, { AxiosInstance } from "axios";

export interface MikrotikConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

export class MikrotikClient {
  private client: AxiosInstance;

  constructor(config: MikrotikConfig) {
    this.client = axios.create({
      baseURL: `http://${config.host}:${config.port}/rest`,
      auth: {
        username: config.user,
        password: config.pass,
      },
      timeout: 10000,
    });
  }

  private async request(method: string, path: string, data?: any) {
    try {
      const response = await this.client({
        method,
        url: path,
        data,
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      console.error(`MikroTik API Error [${method} ${path}]:`, message);
      throw new Error(`MikroTik API Error: ${message}`);
    }
  }

  // --- System ---
  async getSystemResource() {
    return this.request("GET", "/system/resource");
  }

  async checkConnection() {
    return this.getSystemResource();
  }

  // --- Hotspot Configuration ---
  async getHotspotServers() {
    return this.request("GET", "/ip/hotspot");
  }

  async createHotspotProfile(name: string, loginBy: string = "mac,http-chap", dnsName?: string, htmlDirectory: string = "flash/hotspot") {
    return this.request("PUT", "/ip/hotspot/profile", {
      name,
      "login-by": loginBy,
      "dns-name": dnsName,
      "html-directory": htmlDirectory,
    });
  }

  async createHotspotServer(name: string, interface_name: string, profile: string, addressPool: string = "none") {
    return this.request("PUT", "/ip/hotspot", {
      name,
      interface: interface_name,
      "profile": profile,
      "address-pool": addressPool,
    });
  }

  // --- Hotspot User Management ---
  async getHotspotUsers(name?: string) {
    const path = name ? `/ip/hotspot/user?name=${name}` : "/ip/hotspot/user";
    return this.request("GET", path);
  }

  async addHotspotUser(params: {
    name: string;
    password?: string;
    profile?: string;
    limitUptime?: string;
    comment?: string;
    macAddress?: string;
  }) {
    return this.request("PUT", "/ip/hotspot/user", {
      name: params.name,
      password: params.password || "",
      profile: params.profile || "default",
      "limit-uptime": params.limitUptime,
      comment: params.comment,
      "mac-address": params.macAddress,
    });
  }

  async removeHotspotUser(name: string) {
    const users = await this.getHotspotUsers(name);
    if (users && users.length > 0) {
      return this.request("DELETE", `/ip/hotspot/user/${users[0][".id"]}`);
    }
  }

  // --- Active Sessions ---
  async getActiveSessions(user?: string) {
    const path = user ? `/ip/hotspot/active?user=${user}` : "/ip/hotspot/active";
    return this.request("GET", path);
  }

  async terminateSession(user: string) {
    const sessions = await this.getActiveSessions(user);
    for (const session of sessions) {
      await this.request("DELETE", `/ip/hotspot/active/${session[".id"]}`);
    }
  }

  // --- Walled Garden ---
  async addWalledGarden(dstHost: string, comment?: string) {
    return this.request("PUT", "/ip/hotspot/walled-garden", {
      "dst-host": dstHost,
      action: "allow",
      comment,
    });
  }

  // --- DNS ---
  async setDns(servers: string) {
    return this.request("PATCH", "/ip/dns", {
      servers,
      "allow-remote-requests": "yes",
    });
  }

  // --- Queues (Bandwidth Control) ---
  async getQueues(name?: string) {
    const path = name ? `/queue/simple?name=${name}` : "/queue/simple";
    return this.request("GET", path);
  }

  async createQueue(name: string, target: string, maxLimit: string) {
    // maxLimit format: "upload/download" e.g., "1M/2M"
    return this.request("PUT", "/queue/simple", {
      name,
      target,
      "max-limit": maxLimit,
    });
  }

  // --- IP Bindings (Alternative to Hotspot Users for auto-login) ---
  async addIpBinding(macAddress: string, type: "bypassed" | "regular" | "blocked" = "bypassed", comment?: string) {
    return this.request("PUT", "/ip/hotspot/ip-binding", {
      "mac-address": macAddress,
      type,
      comment,
    });
  }

  async removeIpBinding(macAddress: string) {
    const bindings = await this.request("GET", `/ip/hotspot/ip-binding?mac-address=${macAddress}`);
    if (bindings && bindings.length > 0) {
      return this.request("DELETE", `/ip/hotspot/ip-binding/${bindings[0][".id"]}`);
    }
  }
}
