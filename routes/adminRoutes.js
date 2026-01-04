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
    if (!admin) return res.status(401).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
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
    const verified = Boolean(req.body.verified);

    console.log("🔵 Incoming verify:", req.body.verified);
    console.log("🔵 Parsed verified:", verified);

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const wasVerified = payment.verified;
    console.log("🔵 Was verified:", wasVerified);

    payment.verified = verified;
    await payment.save();

    await Registration.findOneAndUpdate(
      { userId: payment.userId },
      { paymentStatus: verified ? "confirmed" : "pending" }
    );

    console.log("🟢 FORCING SENDGRID TEST");

    // 🔥 FORCE SEND (bypasses all logic)
    await sendMail({
      to: "freefireakash73@gmail.com",
      subject: "FORCED ADMIN TEST MAIL",
      html: "<h1>If you see this, SendGrid is working 🎉</h1>",
    });

    console.log("✅ FORCED MAIL SENT");

    // Normal mail to user
    if (verified) {
      const user = await User.findById(payment.userId);
      const team = await Registration.findOne({ userId: payment.userId });

      if (user?.email) {
        await sendMail({
          to: user.email,
          subject: "RAIC Payment Verified ✅",
          html: `
            <h2>Payment Verified</h2>
            <p>Hello ${user.name}</p>
            <p>Team: ${team?.teamName}</p>
            <p>Amount: ₹${payment.amount}</p>
            <p>UTR: ${payment.utr}</p>
          `,
        });
      }
    }

    res.json({ message: "Payment updated successfully" });
  } catch (err) {
    console.error("❌ Verify payment error:", err);
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
      { header: "Team Name", key: "teamName", width: 25 },
      { header: "Leader Name", key: "leaderName", width: 20 },
      { header: "Members", key: "teamSize", width: 10 },
      { header: "Email", key: "email", width: 25 },
      { header: "Mobile", key: "mobile", width: 15 },
      { header: "UTR", key: "utr", width: 20 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Verified", key: "verified", width: 12 },
      { header: "Date", key: "createdAt", width: 25 },
    ];

    for (const p of payments) {
      const user = await User.findById(p.userId);
      const team = await Registration.findOne({ userId: p.userId });

      sheet.addRow({
        teamName: team?.teamName,
        leaderName: team?.leaderName,
        teamSize: team?.teamSize,
        email: user?.email,
        mobile: team?.leaderPhone,
        utr: p.utr,
        amount: p.amount,
        verified: p.verified ? "Yes" : "No",
        createdAt: p.createdAt,
      });
    }

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
