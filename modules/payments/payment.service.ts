import { prisma } from "@/lib/prisma";

export interface PaymentRequest {
  userId: string;
  packageId: string;
  amount: number;
  phoneNumber: string;
  method: "MPESA" | "AIRTEL" | "HALOPESA";
}

export class PaymentService {
  async initiatePayment(req: PaymentRequest) {
    // 1. Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        userId: req.userId,
        packageId: req.packageId,
        amount: req.amount,
        method: req.method,
        reference: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase(),
        status: "PENDING",
        metadata: JSON.stringify({ phoneNumber: req.phoneNumber }),
      } as any,
    });

    // 2. Call external API (Mocking M-Pesa STK Push)
    console.log(`Initiating ${req.method} STK Push to ${req.phoneNumber} for ${req.amount} TZS`);
    
    // In production, you would call the actual gateway here
    // const response = await axios.post(GATEWAY_URL, payload);

    return payment;
  }

  async verifyPayment(reference: string, status: string, metadata?: any) {
    const payment = await prisma.payment.update({
      where: { reference },
      data: { 
        status: status as any,
        metadata: JSON.stringify(metadata || {})
      },
      include: { user: true }
    });

    if (status === "SUCCESS") {
      // Auto-generate voucher for the user
      // This logic would depend on the amount paid
    }

    return payment;
  }
}

