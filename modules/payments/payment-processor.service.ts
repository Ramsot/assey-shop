import { prisma } from "@/lib/prisma";
import { AuthorizationEngine } from "../auth/authorization.service";

export class PaymentProcessor {
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
    const { reference, phoneNumber, amount, method, packageId, macAddress, routerId, ipAddress } =
      params;

    const existingPayment = await prisma.payment.findUnique({
      where: { reference },
    });

    if (existingPayment && (existingPayment.status === "SUCCESS" || existingPayment.status === "COMPLETED")) {
      return existingPayment;
    }

    const payment = await prisma.payment.upsert({
      where: { reference },
      update: { status: "COMPLETED" },
      create: {
        reference,
        phoneNumber,
        amount,
        method,
        packageId,
        status: "COMPLETED",
      },
    });

    const voucherCode = this.generateVoucherCode();
    const voucher = await prisma.voucher.create({
      data: {
        code: voucherCode,
        packageId,
        paymentId: payment.id,
        routerId,
        macAddress,
        status: "ACTIVE",
      },
    });

    try {
      await AuthorizationEngine.authorizeDevice({
        voucherId: voucher.id,
        macAddress,
        ipAddress,
      });
    } catch (error) {
      console.error("Critical: Failed to authorize device after payment:", error);
    }

    return payment;
  }

  private static generateVoucherCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    const randomBytes = new Uint32Array(8);
    global.crypto.getRandomValues(randomBytes);
    for (let i = 0; i < 8; i++) {
      code += chars[randomBytes[i] % chars.length];
    }
    return code;
  }
}
