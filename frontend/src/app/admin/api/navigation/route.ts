import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";
import { revalidatePublic } from "@/lib/revalidate-public";

export async function GET(_request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const menus = await prisma.navigationMenu.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ success: true, data: menus });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const menu = await prisma.navigationMenu.create({
      data: {
        name: body.name,
        location: body.location || "header",
        items: body.items ? JSON.stringify(body.items) : "[]",
        isActive: body.isActive ?? true,
      },
    });
    revalidatePublic("home");
    return NextResponse.json({ success: true, data: menu }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create navigation menu" }, { status: 500 });
  }
}
