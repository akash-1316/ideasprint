import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import sendMail from "./utils/sendMail.js";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import successRoutes from "./routes/successRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);      // ✅ IMPORTANT
app.use("/api/registration", registrationRoutes);
app.use("/api/success", successRoutes);
app.use("/api/admin", adminRoutes);
app.get("/test-mail", async (req, res) => {
  try {
    await sendMail({
      to: "freefireakash73@gmail.com",
      subject: "RAIC Mail Test ✅",
      html: "<h2>Mail Working 🎉</h2>",
    });

    res.send("Mail sent");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});


app.get("/", (req, res) => {
  res.send("🚀 IdeaSprint Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
