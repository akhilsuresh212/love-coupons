
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

export async function sendMagicWordEmail(email: string, word: string) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!from) {
    console.error("Missing SMTP_FROM environment variable");
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Coupons App" <${from}>`,
      to: email,
      subject: `Your Magic Word ✨`,
      html: `
        <div style="font-family: 'Times New Roman', serif; padding: 40px; text-align: center; border: 2px solid #e11d48; border-radius: 15px; background-color: #fff0f5;">
          <h2 style="color: #e11d48; font-size: 24px;">The ancestors have spoken... 🔮</h2>
          <p style="font-size: 18px; color: #333;">To unlock the gates of love, you must whisper:</p>
          <div style="margin: 30px 0;">
            <span style="display: inline-block; padding: 15px 30px; background-color: #e11d48; color: white; font-size: 32px; font-weight: bold; border-radius: 50px; letter-spacing: 2px;">
              ${word}
            </span>
          </div>
          <p style="font-size: 14px; color: #888;">This word holds power for a limited time.</p>
        </div>
      `,
    });

    console.log("Magic word email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending magic word email:", error);
    return { success: false, error };
  }
}
