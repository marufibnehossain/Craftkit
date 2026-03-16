import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/site-config";
import { getSmtpConfig, type SmtpConfig } from "@/lib/smtp-config";

const WINE = "#862830";
const WINE_DARK = "#6e2028";
const BEIGE = "#F5EDE2";
const CREAM = "#FBF4EB";
const BORDER = "#E0D6C9";
const TEXT_DARK = "#1B1718";
const TEXT_MID = "#5F5D5D";
const TEXT_LIGHT = "#8D8B8B";

function emailLayout(content: string, preheader?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${preheader ? `<span style="display:none;font-size:1px;color:#f5ede2;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</span>` : ""}
  <title>${siteConfig.name}</title>
</head>
<body style="margin:0; padding:0; font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${BEIGE}; color: ${TEXT_DARK};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BEIGE};">
    <tr>
      <td align="center" style="padding: 48px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px;">
          <tr>
            <td align="center" style="padding: 0 0 32px;">
              <img src="${siteConfig.url}${siteConfig.logo}" alt="${siteConfig.name}" width="140" style="display:block; height:auto; max-width:140px;" />
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #ffffff; border: 1px solid ${BORDER}; overflow: hidden;">
                <tr>
                  <td style="background: ${WINE}; padding: 24px 40px; text-align: center;">
                    <span style="font-family: 'Cormorant', Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 500; color: #ffffff; letter-spacing: 0.5px;">The Art of the Handmade</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 0 0; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 12px; color: ${TEXT_LIGHT};">
                ${siteConfig.name} · ${siteConfig.contactEmail}
              </p>
              <p style="margin: 0; font-size: 11px; color: ${TEXT_LIGHT};">
                Premium craft supplies for makers
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

function buttonStyle(href: string, label: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
      <tr>
        <td>
          <a href="${href}" style="display: inline-block; padding: 14px 32px; background: ${WINE}; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; letter-spacing: 0.5px; text-transform: uppercase;">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `;
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  config?: SmtpConfig | null
): Promise<{ ok: boolean; error?: string }> {
  const smtp = config ?? (await getSmtpConfig());
  if (!smtp) {
    console.log("[Email] No SMTP configured – email skipped to:", to);
    return { ok: true };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.pass },
    });
    await transporter.sendMail({
      from: smtp.fromEmail,
      to,
      subject,
      html,
    });
    return { ok: true };
  } catch (e) {
    console.error("[Email] SMTP error:", e);
    return { ok: false, error: e instanceof Error ? e.message : "Failed to send email" };
  }
}

export async function sendVerificationEmail(
  to: string,
  verificationUrl: string
): Promise<{ ok: boolean; sent: boolean; error?: string }> {
  const config = await getSmtpConfig();
  if (!config) {
    console.log("[Auth] No email config – verification link (open in browser):", verificationUrl);
    return { ok: true, sent: false };
  }
  const content = `
    <h2 style="margin: 0 0 16px; font-family: 'Cormorant', Georgia, serif; font-size: 24px; font-weight: 500; color: ${TEXT_DARK};">Verify your email</h2>
    <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.7; color: ${TEXT_MID};">
      Thanks for joining ${siteConfig.name}! Please verify your email address by clicking the button below.
    </p>
    ${buttonStyle(verificationUrl, "Verify email address")}
    <p style="margin: 24px 0 0; font-size: 13px; color: ${TEXT_LIGHT}; line-height: 1.6;">
      This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
    </p>
  `;
  const result = await sendEmail(
    to,
    `Verify your ${siteConfig.name} account`,
    emailLayout(content, "Verify your email address"),
    config
  );
  return { ok: result.ok, sent: result.ok, error: result.error };
}

export interface OrderConfirmationItem {
  name: string;
  quantity: number;
  price: number;
}

export async function sendOrderConfirmationEmail(
  to: string,
  options: {
    name?: string;
    items: OrderConfirmationItem[];
    subtotal: number;
    discount?: number;
    coupon?: string;
    shipping: number;
    total: number;
  }
): Promise<{ ok: boolean; error?: string }> {
  const config = await getSmtpConfig();
  if (!config) {
    console.log("[Order] No email config – order confirmation skipped for:", to);
    return { ok: true };
  }
  const { name, items, subtotal, discount = 0, coupon, shipping, total } = options;
  const itemsRows = items
    .map(
      (i) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid ${BORDER}; font-size: 14px; color: ${TEXT_DARK};">${i.name}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid ${BORDER}; font-size: 14px; color: ${TEXT_MID}; text-align: center;">${i.quantity}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid ${BORDER}; font-size: 14px; color: ${TEXT_DARK}; text-align: right;">\u20AC${(i.price * i.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  const content = `
    <h2 style="margin: 0 0 8px; font-family: 'Cormorant', Georgia, serif; font-size: 24px; font-weight: 500; color: ${TEXT_DARK};">Thanks for your order!</h2>
    <p style="margin: 0 0 24px; font-size: 15px; color: ${TEXT_MID};">Hi${name ? ` ${name}` : ""}, we've received your order and are preparing it with care.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 24px; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 8px 0; border-bottom: 2px solid ${WINE}; font-size: 12px; font-weight: 600; color: ${TEXT_MID}; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
          <th style="text-align: center; padding: 8px 0; border-bottom: 2px solid ${WINE}; font-size: 12px; font-weight: 600; color: ${TEXT_MID}; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
          <th style="text-align: right; padding: 8px 0; border-bottom: 2px solid ${WINE}; font-size: 12px; font-weight: 600; color: ${TEXT_MID}; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: ${CREAM}; border: 1px solid ${BORDER};">
      <tr><td style="padding: 12px 16px 4px; font-size: 14px; color: ${TEXT_MID};">Subtotal</td><td style="padding: 12px 16px 4px; font-size: 14px; color: ${TEXT_DARK}; text-align: right;">\u20AC${subtotal.toFixed(2)}</td></tr>
      ${discount > 0 ? `<tr><td style="padding: 4px 16px; font-size: 14px; color: ${TEXT_MID};">Discount${coupon ? ` (${coupon})` : ""}</td><td style="padding: 4px 16px; font-size: 14px; color: ${WINE}; text-align: right;">-\u20AC${discount.toFixed(2)}</td></tr>` : ""}
      <tr><td style="padding: 4px 16px; font-size: 14px; color: ${TEXT_MID};">Shipping</td><td style="padding: 4px 16px; font-size: 14px; color: ${TEXT_DARK}; text-align: right;">\u20AC${shipping.toFixed(2)}</td></tr>
      <tr><td style="padding: 12px 16px; border-top: 1px solid ${BORDER}; font-size: 16px; font-weight: 600; color: ${TEXT_DARK};">Total</td><td style="padding: 12px 16px; border-top: 1px solid ${BORDER}; font-size: 16px; font-weight: 600; color: ${TEXT_DARK}; text-align: right;">\u20AC${total.toFixed(2)}</td></tr>
    </table>
  `;
  return sendEmail(
    to,
    `Your ${siteConfig.name} order confirmation`,
    emailLayout(content, "Thanks for your order"),
    config
  );
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<{ ok: boolean; error?: string }> {
  const config = await getSmtpConfig();
  if (!config) {
    console.log("[Auth] No email config – reset link (open in browser):", resetUrl);
    return { ok: false, error: "Email is not configured. Please set up SMTP in admin settings." };
  }
  const content = `
    <h2 style="margin: 0 0 16px; font-family: 'Cormorant', Georgia, serif; font-size: 24px; font-weight: 500; color: ${TEXT_DARK};">Reset your password</h2>
    <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.7; color: ${TEXT_MID};">
      You requested a password reset for your ${siteConfig.name} account. Click the button below to set a new password.
    </p>
    ${buttonStyle(resetUrl, "Reset password")}
    <p style="margin: 24px 0 0; font-size: 13px; color: ${TEXT_LIGHT}; line-height: 1.6;">
      This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
    </p>
  `;
  return sendEmail(
    to,
    `Reset your ${siteConfig.name} password`,
    emailLayout(content, "Reset your password"),
    config
  );
}

export interface OrderStatusEmailOptions {
  orderId: string;
  name?: string | null;
  status: string;
  trackingNumber?: string | null;
  trackingCarrier?: string | null;
}

export async function sendOrderStatusEmail(
  to: string,
  options: OrderStatusEmailOptions
): Promise<{ ok: boolean; error?: string }> {
  const config = await getSmtpConfig();
  if (!config) {
    console.log("[Order] No email config – status update skipped for:", to);
    return { ok: true };
  }
  const { orderId, name, status, trackingNumber, trackingCarrier } = options;
  const orderShort = orderId.slice(-8).toUpperCase();

  let subject: string;
  let content: string;

  switch (status) {
    case "COMPLETED":
      subject = `Your ${siteConfig.name} order is complete`;
      const trackingInfo =
        trackingNumber && trackingCarrier
          ? `<div style="margin: 16px 0 0; padding: 16px; background: ${CREAM}; border: 1px solid ${BORDER}; font-size: 14px; color: ${TEXT_DARK};"><strong>Track your package:</strong> ${trackingCarrier} \u2013 ${trackingNumber}</div>`
          : trackingNumber
            ? `<div style="margin: 16px 0 0; padding: 16px; background: ${CREAM}; border: 1px solid ${BORDER}; font-size: 14px; color: ${TEXT_DARK};"><strong>Tracking:</strong> ${trackingNumber}</div>`
            : "";
      content = `
        <h2 style="margin: 0 0 16px; font-family: 'Cormorant', Georgia, serif; font-size: 24px; font-weight: 500; color: ${TEXT_DARK};">Order complete</h2>
        <p style="margin: 0 0 8px; font-size: 15px; color: ${TEXT_MID};">Hi${name ? ` ${name}` : ""},</p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: ${TEXT_MID};">
          Your order <strong style="color: ${WINE};">#${orderShort}</strong> has been completed and is on its way to you.
        </p>
        ${trackingInfo}
      `;
      break;
    case "CANCELLED":
      subject = `Your ${siteConfig.name} order was cancelled`;
      content = `
        <h2 style="margin: 0 0 16px; font-family: 'Cormorant', Georgia, serif; font-size: 24px; font-weight: 500; color: ${TEXT_DARK};">Order cancelled</h2>
        <p style="margin: 0 0 8px; font-size: 15px; color: ${TEXT_MID};">Hi${name ? ` ${name}` : ""},</p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: ${TEXT_MID};">
          Your order <strong style="color: ${WINE};">#${orderShort}</strong> has been cancelled.
        </p>
        <p style="margin: 0; font-size: 14px; color: ${TEXT_LIGHT};">If you have questions, please contact us at ${siteConfig.contactEmail}.</p>
      `;
      break;
    case "REFUNDED":
      subject = `Your ${siteConfig.name} order has been refunded`;
      content = `
        <h2 style="margin: 0 0 16px; font-family: 'Cormorant', Georgia, serif; font-size: 24px; font-weight: 500; color: ${TEXT_DARK};">Order refunded</h2>
        <p style="margin: 0 0 8px; font-size: 15px; color: ${TEXT_MID};">Hi${name ? ` ${name}` : ""},</p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: ${TEXT_MID};">
          Your order <strong style="color: ${WINE};">#${orderShort}</strong> has been refunded.
        </p>
        <p style="margin: 0; font-size: 14px; color: ${TEXT_LIGHT};">If you have questions, please contact us at ${siteConfig.contactEmail}.</p>
      `;
      break;
    default:
      return { ok: true };
  }

  return sendEmail(to, subject, emailLayout(content), config);
}

export async function sendContactNotificationEmail(options: {
  name: string;
  email: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const to = siteConfig.contactEmail;
  const config = await getSmtpConfig();
  if (!config) {
    console.log("[Contact] No email config – notification skipped to:", to);
    return { ok: true };
  }
  const { name, email, message } = options;
  const escapedMessage = message.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
  const content = `
    <h2 style="margin: 0 0 16px; font-family: 'Cormorant', Georgia, serif; font-size: 22px; font-weight: 500; color: ${TEXT_DARK};">New contact form message</h2>
    <p style="margin: 0 0 8px; font-size: 14px; color: ${TEXT_MID};"><strong>From:</strong> ${name} &lt;${email}&gt;</p>
    <div style="margin: 16px 0 0; padding: 16px; background: ${CREAM}; border-left: 4px solid ${WINE};">
      <p style="margin: 0; font-size: 14px; line-height: 1.7; color: ${TEXT_DARK};">${escapedMessage}</p>
    </div>
  `;
  return sendEmail(
    to,
    `New contact form: ${name}`,
    emailLayout(content, `New message from ${name}`),
    config
  );
}

export async function sendSellerApplicationNotificationEmail(options: {
  displayName: string;
  email: string;
  role: string;
  level: string;
  categories: string;
  platforms: string;
  bio: string;
}, toOverride?: string): Promise<{ ok: boolean; error?: string }> {
  const to = toOverride || siteConfig.contactEmail;
  const config = await getSmtpConfig();
  if (!config) {
    console.log("[SellerApp] No email config – notification skipped to:", to);
    return { ok: true };
  }
  const { displayName, email, role, level, categories, platforms, bio } = options;
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const escapedBio = bio ? esc(bio).replace(/\n/g, "<br>") : "Not provided";
  const content = `
    <h2 style="margin: 0 0 16px; font-family: 'Cormorant', Georgia, serif; font-size: 22px; font-weight: 500; color: ${TEXT_DARK};">New Seller Application</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: ${TEXT_DARK};">
      <tr><td style="padding: 8px 0; color: ${TEXT_MID}; width: 120px;"><strong>Name:</strong></td><td style="padding: 8px 0;">${esc(displayName)}</td></tr>
      <tr><td style="padding: 8px 0; color: ${TEXT_MID};"><strong>Email:</strong></td><td style="padding: 8px 0;">${esc(email)}</td></tr>
      <tr><td style="padding: 8px 0; color: ${TEXT_MID};"><strong>Role:</strong></td><td style="padding: 8px 0; text-transform: capitalize;">${esc(role)}</td></tr>
      <tr><td style="padding: 8px 0; color: ${TEXT_MID};"><strong>Level:</strong></td><td style="padding: 8px 0; text-transform: capitalize;">${esc(level)}</td></tr>
      <tr><td style="padding: 8px 0; color: ${TEXT_MID};"><strong>Categories:</strong></td><td style="padding: 8px 0;">${esc(categories)}</td></tr>
      <tr><td style="padding: 8px 0; color: ${TEXT_MID};"><strong>Platforms:</strong></td><td style="padding: 8px 0;">${esc(platforms || "None specified")}</td></tr>
    </table>
    <div style="margin: 16px 0 0; padding: 16px; background: ${CREAM}; border-left: 4px solid ${WINE};">
      <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; color: ${TEXT_MID}; text-transform: uppercase;">Bio</p>
      <p style="margin: 0; font-size: 14px; line-height: 1.7; color: ${TEXT_DARK};">${escapedBio}</p>
    </div>
  `;
  return sendEmail(
    to,
    `New seller application: ${displayName}`,
    emailLayout(content, `New seller application from ${displayName}`),
    config
  );
}
