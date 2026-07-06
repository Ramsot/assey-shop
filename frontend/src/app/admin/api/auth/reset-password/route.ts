import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/admin-auth";
import { sendEmail, passwordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email, token, password } = await request.json();

    if (email && !token) {
      const user = await prisma.adminUser.findUnique({ where: { email } });
      if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpires = new Date(Date.now() + 3600000);

      const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/login?reset=${resetToken}`;
      const emailContent = passwordResetEmail(resetUrl);
      await sendEmail({ to: email, subject: emailContent.subject, html: emailContent.html });

      await prisma.adminUser.update({
        where: { id: user.id },
        data: { resetToken, resetExpires },
      });

      return NextResponse.json({ success: true, message: "Reset link sent to email" });
    }

    if (token && password) {
      const user = await prisma.adminUser.findFirst({
        where: { resetToken: token, resetExpires: { gte: new Date() } },
      });
      if (!user) return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 400 });

      const passwordHash = await hashPassword(password);
      await prisma.adminUser.update({
        where: { id: user.id },
        data: { passwordHash, resetToken: null, resetExpires: null },
      });

      return NextResponse.json({ success: true, message: "Password reset successfully" });
    }

    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 });
  }
}
