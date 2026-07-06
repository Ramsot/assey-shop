import nodemailer from "nodemailer";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  if (host) {
    return nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    host: "localhost",
    port: 1025,
    secure: false,
    ignoreTLS: true,
  });
};

export async function sendEmail(options: EmailOptions) {
  const from = options.from || process.env.SMTP_FROM || "noreply@asseyatelier.com";
  const transporter = getTransporter();

  return transporter.sendMail({
    from: `"ASSEY Atelier" <${from}>`,
    to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
    subject: options.subject,
    text: options.text || "",
    html: options.html,
  });
}

export function orderConfirmationEmail(orderNumber: string, customerName: string, items: { name: string; qty: number; price: number }[], total: number) {
  const itemsHtml = items.map((i) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#374151">${i.name} x${i.qty}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#374151;text-align:right">TSh ${i.price.toLocaleString()}</td>
    </tr>
  `).join("");

  return {
    subject: `Order Confirmed - ${orderNumber}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px">
        <div style="text-align:center;margin-bottom:40px">
          <h1 style="font-size:24px;color:#1a1a1a;letter-spacing:0.18em;text-transform:uppercase">ASSEY Atelier</h1>
          <p style="color:#6B7280;font-size:14px">Order Confirmation</p>
        </div>
        <p style="color:#374151;font-size:16px">Dear ${customerName},</p>
        <p style="color:#6B7280;font-size:14px">Thank you for your order! Your order number is <strong style="color:#C9A96E">${orderNumber}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <thead>
            <tr style="background:#F9FAFB">
              <th style="padding:10px;text-align:left;color:#374151;font-size:13px;text-transform:uppercase;letter-spacing:0.05em">Item</th>
              <th style="padding:10px;text-align:right;color:#374151;font-size:13px;text-transform:uppercase;letter-spacing:0.05em">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="border-top:2px solid #C9A96E;padding:16px 0;text-align:right">
          <p style="font-size:18px;color:#1a1a1a;font-weight:bold">Total: TSh ${total.toLocaleString()}</p>
        </div>
        <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;color:#9CA3AF;font-size:12px">
          <p>ASSEY Atelier · Dar es Salaam, Tanzania</p>
          <p><a href="mailto:concierge@asseyatelier.com" style="color:#C9A96E">concierge@asseyatelier.com</a></p>
        </div>
      </div>
    `,
  };
}

export function passwordResetEmail(resetUrl: string) {
  return {
    subject: "Password Reset - ASSEY Atelier Admin",
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px">
        <h1 style="font-size:24px;color:#1a1a1a;text-align:center;letter-spacing:0.18em;text-transform:uppercase">ASSEY Atelier</h1>
        <p style="color:#374151;font-size:16px">You requested a password reset.</p>
        <p style="color:#6B7280;font-size:14px">Click the button below to reset your password. This link expires in 1 hour.</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${resetUrl}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px">Reset Password</a>
        </div>
        <p style="color:#9CA3AF;font-size:12px">If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  };
}

export function newsletterEmail(title: string, content: string) {
  return {
    subject: title,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px">
        <div style="text-align:center;margin-bottom:32px">
          <h1 style="font-size:24px;color:#1a1a1a;letter-spacing:0.18em;text-transform:uppercase">ASSEY Atelier</h1>
        </div>
        <div style="color:#374151;font-size:15px;line-height:1.8">${content}</div>
        <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;color:#9CA3AF;font-size:11px">
          <p><a href="{{unsubscribe_url}}" style="color:#C9A96E">Unsubscribe</a></p>
        </div>
      </div>
    `,
  };
}
