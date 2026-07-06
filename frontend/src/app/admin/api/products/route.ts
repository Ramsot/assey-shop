import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";
import { revalidatePublic } from "@/lib/revalidate-public";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";

  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ name: { contains: search } }, { sku: { contains: search } }];
  if (category) where.categoryId = category;
  if (status === "active") where.isActive = true;
  if (status === "draft") where.isActive = false;
  if (status === "featured") where.isFeatured = true;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: where as any,
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, category: true, variants: true },
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where: where as any }),
  ]);

  return NextResponse.json({
    success: true,
    data: products,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        sku: body.sku || `SKU-${Date.now()}`,
        subtitle: body.subtitle || "",
        description: body.description || "",
        price: parseFloat(body.price) || 0,
        compareAtPrice: body.compareAtPrice ? parseFloat(body.compareAtPrice) : null,
        costPrice: body.costPrice ? parseFloat(body.costPrice) : null,
        material: body.material || "",
        size: body.size || "",
        stockQty: parseInt(body.stockQty) || 0,
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
        categoryId: body.categoryId || null,
      },
      include: { images: true, variants: true, category: true },
    });

    revalidatePublic("shop");
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 });
  }
}
