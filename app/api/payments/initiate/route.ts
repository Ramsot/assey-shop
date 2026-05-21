import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/modules/payments/payment.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, amount, packageId, mac, ip, routerId, method } = body;

    if (!phoneNumber || !packageId || !mac) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const paymentService = new PaymentService();
    // For now, we'll mock the amount if not provided, or get it from package
    const payment = await paymentService.initiatePayment({
      userId: "guest", // Captive portal users are usually guests until payment
      phoneNumber,
      amount: amount || 1000, // This should come from package in production
      method: method || "MPESA",
    });

    // Attach metadata for the processor
    // In a real app, this would be stored in DB linked to the payment reference
    console.log(`Payment ${payment.reference} initiated for MAC ${mac} on router ${routerId}`);

    return NextResponse.json(payment);
  } catch (error: any) {
    console.error("Payment initiation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
