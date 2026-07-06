import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { to, subject, html, type } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ success: false, error: "Missing required fields: to, subject, html" }, { status: 400 });
    }

    await sendEmail({ to, subject, html });

    return NextResponse.json({ success: true, message: "Email sent" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}
