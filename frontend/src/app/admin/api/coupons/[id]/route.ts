import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: coupon });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: body.code ? body.code.toUpperCase() : undefined,
        description: body.description,
        discountType: body.discountType,
        discountValue: body.discountValue ? parseFloat(body.discountValue) : undefined,
        minOrderValue: body.minOrderValue ? parseFloat(body.minOrderValue) : body.minOrderValue === null ? null : undefined,
        maxUses: body.maxUses ? parseInt(body.maxUses) : body.maxUses === null ? null : undefined,
        maxPerUser: body.maxPerUser ? parseInt(body.maxPerUser) : body.maxPerUser === null ? null : undefined,
        isActive: body.isActive,
        startsAt: body.startsAt ? new Date(body.startsAt) : body.startsAt === null ? null : undefined,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : body.expiresAt === null ? null : undefined,
      },
    });
    return NextResponse.json({ success: true, data: coupon });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete coupon" }, { status: 500 });
  }
}
