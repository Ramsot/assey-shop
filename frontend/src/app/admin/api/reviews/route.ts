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
  const status = searchParams.get("status") || "";
  const productId = searchParams.get("productId") || "";
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";

  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ authorName: { contains: search } }, { authorEmail: { contains: search } }, { content: { contains: search } }];
  if (status === "approved") where.isApproved = true;
  if (status === "pending") where.isApproved = false;
  if (productId) where.productId = productId;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: where as any,
      include: { product: { select: { id: true, name: true, slug: true, images: { take: 1, orderBy: { sortOrder: "asc" } } } }, customer: true },
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count({ where: where as any }),
  ]);

  return NextResponse.json({ success: true, data: reviews, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const review = await prisma.review.create({
      data: {
        productId: body.productId,
        customerId: body.customerId || null,
        authorName: body.authorName,
        authorEmail: body.authorEmail || "",
        rating: parseInt(body.rating) || 5,
        title: body.title || "",
        content: body.content || "",
        isApproved: body.isApproved ?? true,
      },
      include: { product: true, customer: true },
    });
    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create review" }, { status: 500 });
  }
}
