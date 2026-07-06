import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { orderBy: { createdAt: "asc" } },
      customer: true,
      shippingAddress: true,
      billingAddress: true,
      timeline: { orderBy: { createdAt: "asc" } },
      invoice: true,
      payment: true,
    },
  });

  if (!order) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: order });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();

    const previousOrder = await prisma.order.findUnique({ where: { id } });
    if (!previousOrder) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const statusChanged = body.status && body.status !== previousOrder.status;
    const updateData: Record<string, unknown> = {};

    if (body.status !== undefined) updateData.status = body.status;
    if (body.paymentStatus !== undefined) updateData.paymentStatus = body.paymentStatus;
    if (body.trackingNumber !== undefined) updateData.trackingNumber = body.trackingNumber;
    if (body.trackingUrl !== undefined) updateData.trackingUrl = body.trackingUrl;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.adminNotes !== undefined) updateData.adminNotes = body.adminNotes;

    if (body.paymentStatus === "paid" && previousOrder.paymentStatus !== "paid") updateData.paidAt = new Date();
    if (body.status === "shipped" && previousOrder.status !== "shipped") updateData.shippedAt = new Date();
    if (body.status === "delivered" && previousOrder.status !== "delivered") updateData.deliveredAt = new Date();
    if (body.status === "cancelled" && previousOrder.status !== "cancelled") updateData.cancelledAt = new Date();
    if (body.status === "refunded" && previousOrder.status !== "refunded") updateData.refundedAt = new Date();

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true, customer: true, shippingAddress: true, timeline: { orderBy: { createdAt: "asc" } } },
    });

    const timelineEntries: { status: string; note: string; createdBy: string }[] = [];

    if (statusChanged) {
      timelineEntries.push({
        status: body.status,
        note: body.timelineNote || `Status changed to ${body.status}`,
        createdBy: user.name,
      });
    }

    if (body.timelineNote && !statusChanged) {
      timelineEntries.push({
        status: previousOrder.status,
        note: body.timelineNote,
        createdBy: user.name,
      });
    }

    if (timelineEntries.length > 0) {
      await prisma.orderTimeline.createMany({
        data: timelineEntries.map((e) => ({ ...e, orderId: id })),
      });
    }

    const finalOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { orderBy: { createdAt: "asc" } },
        customer: true,
        shippingAddress: true,
        billingAddress: true,
        timeline: { orderBy: { createdAt: "asc" } },
        invoice: true,
        payment: true,
      },
    });

    return NextResponse.json({ success: true, data: finalOrder });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Order deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete order" }, { status: 500 });
  }
}
