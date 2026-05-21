const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Hash password using the same algorithm as the app
  const { hashPassword } = require("../modules/auth/password.utils");
  const path = require("path");
  process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "securenet-vouchers-key-32-chars-";

  const adminPassword = await hashPassword("password123");

  // 1. Create Admin
  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@securenet.os",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
    },
  });

  // 2. Create Packages
  const pkg1 = await prisma.package.upsert({
    where: { id: "pkg_2h" },
    update: {},
    create: {
      id: "pkg_2h",
      name: "2 Hours Unlimited",
      type: "TIME",
      price: 1000,
      duration: 120,
      speedLimitDown: "2M",
      speedLimitUp: "1M",
    },
  });

  const pkg2 = await prisma.package.upsert({
    where: { id: "pkg_5gb" },
    update: {},
    create: {
      id: "pkg_5gb",
      name: "5GB Weekly",
      type: "DATA",
      price: 5000,
      duration: 10080,
      dataLimit: 2000000000,
      speedLimitDown: "5M",
      speedLimitUp: "2M",
    },
  });

  // 3. Create Router
  const router = await prisma.router.upsert({
    where: { id: "router_01" },
    update: {},
    create: {
      id: "router_01",
      name: "Arusha-Main-01",
      ipAddress: "192.168.88.1",
      username: "admin",
      password: "password",
      status: "ONLINE",
    },
  });

  // 4. Create Users
  const user = await prisma.user.upsert({
    where: { phoneNumber: "255700000000" },
    update: {},
    create: {
      phoneNumber: "255700000000",
      email: "customer@example.com",
    },
  });

  // 5. Create Vouchers
  await prisma.voucher.upsert({
    where: { code: "SECURE77" },
    update: {},
    create: {
      code: "SECURE77",
      packageId: pkg1.id,
      status: "ACTIVE",
      activatedAt: new Date(),
      expiresAt: new Date(Date.now() + 120 * 60 * 1000),
      routerId: router.id,
      userId: user.id,
    },
  });

  // 6. Create Abuse Report
  await prisma.abuseReport.create({
    data: {
      type: "MAC_SPOOFING",
      details: "Detected potential MAC spoofing on router Arusha-Main-01",
      severity: "HIGH",
      macAddress: "00:11:22:33:44:55",
    },
  });

  console.log("✅ Seed data created successfully");
  console.log("   Admin login: admin / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
