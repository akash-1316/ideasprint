import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // REQUIRED for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000, // extra safety
});

const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"RAIC IdeaSprint" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendMail;
