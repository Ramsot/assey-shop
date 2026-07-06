import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";
import { revalidatePublic } from "@/lib/revalidate-public";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      category: true,
      collection: { include: { collection: true } },
      reviews: true,
    },
  });

  if (!product) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: product });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        subtitle: body.subtitle,
        description: body.description,
        price: body.price ? parseFloat(body.price) : undefined,
        compareAtPrice: body.compareAtPrice ? parseFloat(body.compareAtPrice) : null,
        costPrice: body.costPrice ? parseFloat(body.costPrice) : null,
        material: body.material,
        size: body.size,
        stockQty: body.stockQty ? parseInt(body.stockQty) : undefined,
        isActive: body.isActive,
        isFeatured: body.isFeatured,
        categoryId: body.categoryId || null,
      },
      include: { images: true, variants: true, category: true },
    });

    revalidatePublic("shop");
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    revalidatePublic("shop");
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 });
  }
}
