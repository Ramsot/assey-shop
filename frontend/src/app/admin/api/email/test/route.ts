import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/admin-auth";
import { sendEmail, orderConfirmationEmail } from "@/lib/email";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const to = body.email || "test@asseyatelier.com";

    const email = orderConfirmationEmail("AS-TEST123", "Test Customer", [
      { name: "Test Product", qty: 1, price: 50000 },
      { name: "Another Product", qty: 2, price: 75000 },
    ], 200000);

    await sendEmail({ to, subject: email.subject, html: email.html });

    return NextResponse.json({ success: true, message: `Test email sent to ${to}` });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to send test email" }, { status: 500 });
  }
}
