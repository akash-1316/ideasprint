import express from "express";
import Payment from "../models/Payment.js";
import Registration from "../models/Registration.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/status", protect, async (req, res) => {
  const payment = await Payment.findOne({ userId: req.user });
  const registration = await Registration.findOne({ userId: req.user });

  if (!payment || !registration) {
    return res.json({ success: false });
  }

  res.json({
    success: payment.verified && registration.paymentStatus === "confirmed",
  });
});

export default router;
