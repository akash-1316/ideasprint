import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
// 🔥 MUST be FIRST

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import sendMail from "./utils/sendMail.js";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import successRoutes from "./routes/successRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

connectDB();

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://ideasprint-xi.vercel.app",
  "https://ideasprint-admin-panel.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman & server-to-server
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);


/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);      // ✅ IMPORTANT
app.use("/api/registration", registrationRoutes);
app.use("/api/success", successRoutes);
app.use("/api/admin", adminRoutes);
app.get("/test-mail", async (req, res) => {
  try {
    await sendMail({
      to: "freefireakash73@gmail.com",
      subject: "SendGrid Test",
      html: "<h1>SendGrid is working</h1>",
    });
    res.send("Mail sent");
  } catch (err) {
    console.error("TEST MAIL ERROR:", err);
    res.status(500).send("Mail failed");
  }
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("🚀 IdeaSprint Backend Running (Cloudinary Enabled)");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
