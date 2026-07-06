import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        email: body.email || "",
        subtotal: body.subtotal || 0,
        shippingCost: 0,
        tax: 0,
        discount: 0,
        total: body.total || 0,
        currency: "TZS",
        status: "pending",
        paymentStatus: "unpaid",
        paymentMethod: "whatsapp",
        notes: body.notes || "",
        shippingAddress: {
          create: {
            firstName: body.firstName || "",
            lastName: body.lastName || "",
            email: body.email || "",
            phone: body.phone || "",
            address1: body.address1 || "",
            address2: "",
            city: body.city || "",
            postalCode: body.postal || "",
            country: body.country || "",
          },
        },
        items: {
          create: (body.items || []).map((item: { sku: string; name: string; price: number; color?: string; quantity: number }) => ({
            productSku: item.sku,
            productName: item.name,
            productPrice: item.price,
            color: item.color || "",
            quantity: item.quantity,
            lineTotal: item.price * item.quantity,
          })),
        },
      },
      include: { items: true, shippingAddress: true },
    });

    return NextResponse.json({ success: true, data: { orderNumber, id: order.id } });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
  }
}
