
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendRedemptionEmail(title: string, note: string) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const to = process.env.SMTP_TO || process.env.SMTP_USER;

  if (!from || !to) {
    console.error("Missing SMTP_FROM or SMTP_TO environment variables");
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Coupons App" <${from}>`,
      to: to,
      subject: `Coupon Redeemed: ${title} ❤️`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #e11d48;">New Coupon Redeemed! 🎉</h2>
          <p><strong>Coupon:</strong> ${title}</p>
          <p><strong>Note:</strong> ${note || "No note provided"}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <br>
          <p style="font-size: 12px; color: #888;">Sent from Akhil's Love Coupons App</p>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
