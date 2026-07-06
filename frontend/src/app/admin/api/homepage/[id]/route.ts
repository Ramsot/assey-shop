import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";
import { revalidatePublic } from "@/lib/revalidate-public";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const section = await prisma.homepageSection.findUnique({ where: { id } });
  if (!section) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: section });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const section = await prisma.homepageSection.update({
      where: { id },
      data: {
        type: body.type,
        title: body.title,
        subtitle: body.subtitle,
        content: body.content,
        settings: body.settings ? JSON.stringify(body.settings) : undefined,
        sortOrder: body.sortOrder ? parseInt(body.sortOrder) : undefined,
        isActive: body.isActive,
      },
    });
    revalidatePublic("home");
    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update homepage section" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.homepageSection.delete({ where: { id } });
    revalidatePublic("home");
    return NextResponse.json({ success: true, message: "Section deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete section" }, { status: 500 });
  }
}
