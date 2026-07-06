import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const search = searchParams.get("search") || "";
  const active = searchParams.get("active") || "";
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";

  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ email: { contains: search } }, { name: { contains: search } }];
  if (active === "true") where.isActive = true;
  if (active === "false") where.isActive = false;

  const [subscribers, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where: where as any,
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.newsletterSubscriber.count({ where: where as any }),
  ]);

  return NextResponse.json({ success: true, data: subscribers, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const subscriber = await prisma.newsletterSubscriber.create({
      data: { email: body.email, name: body.name || null, source: body.source || "admin" },
    });
    return NextResponse.json({ success: true, data: subscriber }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to add subscriber" }, { status: 500 });
  }
}
