import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";
import { sendEmail, newsletterEmail } from "@/lib/email";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { title, content, testEmail } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ success: false, error: "Missing title or content" }, { status: 400 });
    }

    if (testEmail) {
      const email = newsletterEmail(title, content);
      await sendEmail({ to: testEmail, subject: email.subject, html: email.html });
      return NextResponse.json({ success: true, message: `Test sent to ${testEmail}` });
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({ where: { isActive: true } });
    if (subscribers.length === 0) {
      return NextResponse.json({ success: false, error: "No active subscribers" }, { status: 400 });
    }

    const email = newsletterEmail(title, content);
    let sent = 0;
    for (const sub of subscribers) {
      try {
        await sendEmail({
          to: sub.email,
          subject: email.subject,
          html: email.html.replace("{{unsubscribe_url}}", `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/newsletter/unsubscribe?email=${sub.email}`),
        });
        sent++;
      } catch {}
    }

    return NextResponse.json({ success: true, message: `Sent to ${sent}/${subscribers.length} subscribers` });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to send newsletter" }, { status: 500 });
  }
}
