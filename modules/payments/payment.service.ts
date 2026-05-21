import { prisma } from "@/lib/prisma";

export interface PaymentRequest {
  userId?: string;
  packageId: string;
  amount: number;
  phoneNumber: string;
  method: string;
}

export class PaymentService {
  async initiatePayment(req: PaymentRequest) {
    const reference = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

    const payment = await prisma.payment.create({
      data: {
        userId: req.userId || undefined,
        packageId: req.packageId,
        amount: req.amount,
        method: req.method,
        phoneNumber: req.phoneNumber,
        reference,
        status: "PENDING",
        metadata: JSON.stringify({ phoneNumber: req.phoneNumber }),
      },
    });

    return payment;
  }

  async verifyPayment(reference: string, status: string, metadata?: any) {
    const payment = await prisma.payment.update({
      where: { reference },
      data: {
        status,
        metadata: JSON.stringify(metadata || {}),
      },
      include: { user: true },
    });

    return payment;
  }
}
