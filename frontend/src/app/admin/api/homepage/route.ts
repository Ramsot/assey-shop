import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";
import { revalidatePublic } from "@/lib/revalidate-public";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");
  const type = searchParams.get("type") || "";
  const sort = searchParams.get("sort") || "sortOrder";
  const order = searchParams.get("order") || "asc";

  const where: Record<string, unknown> = {};
  if (type) where.type = type;

  const [sections, total] = await Promise.all([
    prisma.homepageSection.findMany({
      where: where as any,
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.homepageSection.count({ where: where as any }),
  ]);

  return NextResponse.json({ success: true, data: sections, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const section = await prisma.homepageSection.create({
      data: {
        type: body.type,
        title: body.title || "",
        subtitle: body.subtitle || "",
        content: body.content || "",
        settings: body.settings ? JSON.stringify(body.settings) : null,
        sortOrder: parseInt(body.sortOrder) || 0,
        isActive: body.isActive ?? true,
      },
    });
    revalidatePublic("home");
    return NextResponse.json({ success: true, data: section }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create homepage section" }, { status: 500 });
  }
}
