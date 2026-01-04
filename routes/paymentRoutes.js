import express from "express";
import Registration from "../models/Registration.js";
import protect from "../middleware/authMiddleware.js";
import Payment from "../models/Payment.js";
import upload from "../middleware/cloudinaryMiddleware.js";

const router = express.Router();

/* =========================
   SUBMIT PAYMENT (CLOUDINARY)
========================= */
router.post(
  "/submit",
  protect,
  upload.single("screenshot"),
  async (req, res) => {
    try {
      const { utr, amount } = req.body;

      if (!utr || !amount || !req.file) {
        return res.status(400).json({ message: "Missing payment data" });
      }

      await Payment.create({
        userId: req.user,          // ✅ same auth logic
        utr,
        amount,
        screenshot: req.file.path, // 🔥 Cloudinary URL
      });

      res.json({ message: "Payment submitted successfully" });
    } catch (err) {
      console.error("❌ Payment submit error:", err);
      res.status(500).json({ message: "Payment failed" });
    }
  }
);

/* =========================
   PAYMENT STATUS (USER)
========================= */
router.get("/status", protect, async (req, res) => {
  const registration = await Registration.findOne({ userId: req.user });
  const payment = await Payment.findOne({ userId: req.user });

  if (!registration || !payment) {
    return res.json({ success: false });
  }

  res.json({
    success: true,
    leaderName: registration.leaderName,
    teamSize: registration.teamSize,
    amountPaid: payment.amount,
    paymentStatus: payment.verified ? "Verified" : "Pending",
  });
});

export default router;
