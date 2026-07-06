import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";
import { revalidatePublic } from "@/lib/revalidate-public";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const menu = await prisma.navigationMenu.findUnique({ where: { id } });
  if (!menu) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: menu });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const menu = await prisma.navigationMenu.update({
      where: { id },
      data: {
        name: body.name,
        location: body.location,
        items: body.items ? JSON.stringify(body.items) : undefined,
        isActive: body.isActive,
      },
    });
    revalidatePublic("home");
    return NextResponse.json({ success: true, data: menu });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update navigation menu" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.navigationMenu.delete({ where: { id } });
    revalidatePublic("home");
    return NextResponse.json({ success: true, message: "Navigation menu deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete navigation menu" }, { status: 500 });
  }
}
