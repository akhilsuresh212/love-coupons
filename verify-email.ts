
import "dotenv/config";
import { sendRedemptionEmail } from "./lib/email";

async function main() {
  console.log("----------------------------------------");
  console.log("📧 Verifying Email Configuration");
  console.log("----------------------------------------");
  console.log(`SMTP Host: ${process.env.SMTP_HOST}`);
  console.log(`SMTP User: ${process.env.SMTP_USER}`);
  console.log(`To: ${process.env.SMTP_TO || process.env.SMTP_USER}`);
  console.log("----------------------------------------");

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.error("❌ Missing SMTP environment variables. Please check your .env file.");
    process.exit(1);
  }

  console.log("Sending test email...");
  
  const result = await sendRedemptionEmail("Verification Test Coupon", "This is a test email to verify your SMTP settings.");
  
  if (result?.success) {
    console.log("✅ Email sent successfully!");
    console.log(`Message ID: ${result.messageId}`);
    console.log("Check your inbox for the test email.");
  } else {
    console.error("❌ Email sending failed.");
    console.error(result?.error);
    process.exit(1);
  }
}

main();
