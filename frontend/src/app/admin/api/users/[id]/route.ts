import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/admin-auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const found = await prisma.adminUser.findUnique({
    where: { id },
    include: { role: { include: { permissions: { include: { permission: true } } } }, profile: true },
  });

  if (!found) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const { passwordHash, twoFactorSecret, recoveryCodes, ...sanitized } = found;
  return NextResponse.json({ success: true, data: sanitized });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.name) data.name = body.name;
    if (body.email) data.email = body.email;
    if (body.roleId) data.roleId = body.roleId;
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.avatar) data.avatar = body.avatar;
    if (body.password) data.passwordHash = await hashPassword(body.password);

    const updated = await prisma.adminUser.update({
      where: { id },
      data,
      include: { role: true },
    });

    const { passwordHash, twoFactorSecret, recoveryCodes, ...sanitized } = updated;
    return NextResponse.json({ success: true, data: sanitized });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.adminUser.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 });
  }
}
