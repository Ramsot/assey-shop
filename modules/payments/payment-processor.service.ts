import { prisma } from "@/lib/prisma";
import { AuthorizationEngine } from "../auth/authorization.service";

export class PaymentProcessor {
  /**
   * Processes a successful payment and activates the service
   */
  static async processSuccessfulPayment(params: {
    reference: string;
    phoneNumber: string;
    amount: number;
    method: string;
    packageId: string;
    macAddress: string;
    routerId: string;
    ipAddress?: string;
  }) {
    const { reference, phoneNumber, amount, method, packageId, macAddress, routerId, ipAddress } = params;

    // 1. Check if payment already processed
    const existingPayment = await prisma.payment.findUnique({
      where: { reference },
    });

    if (existingPayment && existingPayment.status === "COMPLETED") {
      return existingPayment;
    }

    // 2. Create or update payment record
    const payment = await prisma.payment.upsert({
      where: { reference },
      update: { status: "COMPLETED" } as any,
      create: {
        reference,
        phoneNumber,
        amount,
        method,
        packageId,
        status: "COMPLETED",
      } as any,
    });

    // 3. Create a voucher for this payment
    const voucherCode = this.generateVoucherCode();
    const voucher = await prisma.voucher.create({
      data: {
        code: voucherCode,
        packageId,
        paymentId: payment.id,
        routerId,
        macAddress,
        status: "ACTIVE",
      } as any,
    });

    // 4. Trigger Instant Authorization
    try {
      await AuthorizationEngine.authorizeDevice({
        voucherId: voucher.id,
        macAddress,
        ipAddress,
      });
    } catch (error) {
      console.error("Critical: Failed to authorize device after payment:", error);
      // We should probably queue a retry here
    }

    return payment;
  }

  private static generateVoucherCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}
