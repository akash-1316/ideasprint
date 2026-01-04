import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import sgMail from "@sendgrid/mail";

console.log("🔑 SENDGRID KEY:", process.env.SENDGRID_API_KEY);
console.log("📤 MAIL_FROM:", process.env.MAIL_FROM);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async ({ to, subject, html }) => {
  console.log("📨 sendMail() called for:", to);

  try {
    await sgMail.send({
      to,
      from: {
        email: process.env.MAIL_FROM,
        name: "RAIC Team",
      },
      subject,
      html,
    });

    console.log("✅ SendGrid mail sent to:", to);
  } catch (err) {
    console.error("❌ SENDGRID ERROR:", err.response?.body || err);
    throw err;
  }
};

export default sendMail;
