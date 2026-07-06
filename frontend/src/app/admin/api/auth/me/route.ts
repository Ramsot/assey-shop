import { NextResponse } from "next/server";
import { getCurrentUser, comparePassword, hashPassword } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, avatar, currentPassword, newPassword } = body;

    if (newPassword) {
      const dbUser = await prisma.adminUser.findUnique({ where: { id: user.id } });
      if (!dbUser) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

      const valid = await comparePassword(currentPassword || "", dbUser.passwordHash);
      if (!valid) {
        return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 });
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 });
      }

      const passwordHash = await hashPassword(newPassword);
      await prisma.adminUser.update({ where: { id: user.id }, data: { passwordHash } });
      return NextResponse.json({ success: true, message: "Password changed successfully" });
    }

    const updateData: Record<string, string> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updated = await prisma.adminUser.update({
      where: { id: user.id },
      data: updateData,
      select: { id: true, name: true, email: true, avatar: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}
