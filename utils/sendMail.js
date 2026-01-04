import axios from "axios";

const sendMail = async ({ to, subject, html }) => {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: "RAIC IdeaSprint",
        email: "no-reply@ideasprint.raic",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      timeout: 10000,
    }
  );
};

export default sendMail;
