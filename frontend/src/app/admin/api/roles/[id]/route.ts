import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const role = await prisma.role.findUnique({
    where: { id },
    include: { users: { select: { id: true, email: true, name: true } }, permissions: { include: { permission: true } } },
  });

  if (!role) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: role });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const role = await prisma.role.update({
      where: { id },
      data: { name: body.name, description: body.description },
      include: { permissions: { include: { permission: true } } },
    });
    return NextResponse.json({ success: true, data: role });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update role" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const role = await prisma.role.findUnique({ where: { id } });
    if (role?.isSystem) return NextResponse.json({ success: false, error: "Cannot delete system role" }, { status: 400 });
    await prisma.role.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Role deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete role" }, { status: 500 });
  }
}
