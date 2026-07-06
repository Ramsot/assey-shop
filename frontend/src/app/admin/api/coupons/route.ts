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
  if (search) where.OR = [{ code: { contains: search } }, { description: { contains: search } }];
  if (active === "true") where.isActive = true;
  if (active === "false") where.isActive = false;

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where: where as any,
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.coupon.count({ where: where as any }),
  ]);

  return NextResponse.json({ success: true, data: coupons, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        description: body.description || "",
        discountType: body.discountType || "percentage",
        discountValue: parseFloat(body.discountValue) || 0,
        minOrderValue: body.minOrderValue ? parseFloat(body.minOrderValue) : null,
        maxUses: body.maxUses ? parseInt(body.maxUses) : null,
        maxPerUser: body.maxPerUser ? parseInt(body.maxPerUser) : null,
        isActive: body.isActive ?? true,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });
    return NextResponse.json({ success: true, data: coupon }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create coupon" }, { status: 500 });
  }
}
