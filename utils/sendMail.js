import nodemailer from "nodemailer";

const sendMail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.verify(); // 🔥 catches auth issues early

  await transporter.sendMail({
    from: `"RAIC Team" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendMail;
