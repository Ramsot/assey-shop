import { NextRequest, NextResponse } from "next/server";
import { PaymentProcessor } from "@/modules/payments/payment-processor.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // This is a generic webhook handler. In production, you'd have specific ones 
    // for M-Pesa (Daraja), Airtel Money, etc. with proper signature verification.
    
    const { reference, status, phoneNumber, amount, packageId, macAddress, routerId, ipAddress } = body;

    if (status === "SUCCESS" || status === "COMPLETED") {
      await PaymentProcessor.processSuccessfulPayment({
        reference,
        phoneNumber,
        amount,
        method: "WEBHOOK",
        packageId,
        macAddress,
        routerId,
        ipAddress,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
