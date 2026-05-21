"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/modules/auth/password.utils";
import { revalidatePath } from "next/cache";

export async function getAdmins() {
  return await prisma.admin.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      twoFactorEnabled: true,
      lastLogin: true,
      createdAt: true,
    },
  });
}

export async function createAdmin(data: {
  username: string;
  email: string;
  password: string;
  role: string;
}) {
  const existing = await prisma.admin.findFirst({
    where: { OR: [{ username: data.username }, { email: data.email }] },
  });
  if (existing) {
    throw new Error("Username or email already exists");
  }

  const passwordHash = await hashPassword(data.password);
  const admin = await prisma.admin.create({
    data: {
      username: data.username,
      email: data.email,
      passwordHash,
      role: data.role || "OPERATOR",
    },
  });

  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      action: "ADMIN_CREATED",
      resource: "Admin",
      details: `Admin account ${data.username} created with role ${data.role}`,
    },
  });

  revalidatePath("/admin/settings");
  return { success: true, id: admin.id };
}

export async function deleteAdmin(id: string) {
  await prisma.admin.delete({ where: { id } });
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateAdminRole(id: string, role: string) {
  await prisma.admin.update({ where: { id }, data: { role } });
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function getPackages() {
  return await prisma.package.findMany({ orderBy: { price: "asc" } });
}

export async function createPackage(data: {
  name: string;
  description?: string;
  type: string;
  price: number;
  duration?: number;
  dataLimit?: number;
  speedLimitUp?: string;
  speedLimitDown?: string;
  deviceLimit?: number;
}) {
  return await prisma.package.create({
    data: {
      name: data.name,
      description: data.description,
      type: data.type,
      price: data.price,
      duration: data.duration,
      dataLimit: data.dataLimit ? BigInt(data.dataLimit) : undefined,
      speedLimitUp: data.speedLimitUp,
      speedLimitDown: data.speedLimitDown,
      deviceLimit: data.deviceLimit || 1,
    },
  });
}

export async function updatePackage(id: string, data: {
  name?: string;
  description?: string;
  type?: string;
  price?: number;
  duration?: number;
  dataLimit?: number;
  speedLimitUp?: string;
  speedLimitDown?: string;
  deviceLimit?: number;
}) {
  const updateData: any = { ...data };
  if (data.dataLimit !== undefined) {
    updateData.dataLimit = BigInt(data.dataLimit);
  }
  return await prisma.package.update({ where: { id }, data: updateData });
}

export async function deletePackage(id: string) {
  await prisma.package.delete({ where: { id } });
  return { success: true };
}
