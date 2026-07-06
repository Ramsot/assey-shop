import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const backup = await prisma.backup.findUnique({ where: { id } });
  if (!backup) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: backup });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const backup = await prisma.backup.update({
      where: { id },
      data: {
        name: body.name,
        filename: body.filename,
        size: body.size ? parseInt(body.size) : null,
        status: body.status,
        notes: body.notes,
        completedAt: body.status === "completed" ? new Date() : undefined,
      },
    });
    return NextResponse.json({ success: true, data: backup });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update backup" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.backup.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Backup deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete backup" }, { status: 500 });
  }
}
