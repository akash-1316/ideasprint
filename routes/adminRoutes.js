import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ExcelJS from "exceljs";

import Payment from "../models/Payment.js";
import Registration from "../models/Registration.js";
import User from "../models/User.js";

import protect from "../middleware/authMiddleware.js";
import adminProtect from "../middleware/adminMiddleware.js";
import sendMail from "../utils/sendMail.js";

const router = express.Router();

/* ================= ADMIN LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= PAYMENTS ================= */
router.get("/payments", protect, adminProtect, async (req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 });
  res.json(payments);
});

/* ================= VERIFY PAYMENT ================= */
router.put("/payment/:id", protect, adminProtect, async (req, res) => {
  try {
    const { verified } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.verified = verified;
    await payment.save();

    await Registration.findOneAndUpdate(
      { userId: payment.userId },
      { paymentStatus: verified ? "confirmed" : "pending" }
    );

    // ✅ SEND MAIL ONLY WHEN VERIFIED
    if (verified) {
      try {
        const user = await User.findById(payment.userId);
        if (user?.email) {
          await sendMail({
            to: user.email,
            subject: "RAIC Payment Verified ✅",
            html: `
              <div style="font-family: Arial; padding:20px">
                <h2 style="color:#ff7a18">Payment Verified 🎉</h2>
                <p>Hello <b>${user.name}</b>,</p>
                <p>Your payment of <b>₹${payment.amount}</b> has been verified.</p>
                <p>UTR: <b>${payment.utr}</b></p>
                <br/>
                <p>— Team RAIC</p>
                <small>Where Minds & Machines Connect</small>
              </div>
            `,
          });
        }
      } catch (mailErr) {
        console.error("Mail error:", mailErr.message);
      }
    }

    res.json({ message: "Payment updated successfully" });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= REGISTRATIONS ================= */
router.get("/registrations", protect, adminProtect, async (req, res) => {
  const teams = await Registration.find().sort({ createdAt: -1 });
  res.json(teams);
});

/* ================= EXPORT PAYMENTS ================= */
router.get(
  "/export/payments",
  (req, res, next) => {
    if (req.query.token) {
      req.headers.authorization = `Bearer ${req.query.token}`;
    }
    next();
  },
  protect,
  adminProtect,
  async (req, res) => {
    const payments = await Payment.find();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Payments");

    sheet.columns = [
      { header: "UTR", key: "utr", width: 20 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Verified", key: "verified", width: 15 },
      { header: "Date", key: "createdAt", width: 25 },
    ];

    payments.forEach((p) => sheet.addRow(p));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=payments.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  }
);

export default router;
