import Payment from "../models/Payment.js";
import User from "../models/User.js";
import sendMail from "../utils/sendMail.js";

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.verified = verified;
    await payment.save();

    // ✅ SEND MAIL ONLY IF VERIFIED
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
                <p>Your payment of <b>₹${payment.amount}</b> has been successfully verified.</p>
                <p>UTR: <b>${payment.utr}</b></p>
                <br/>
                <p>— Team RAIC</p>
                <small>Where Minds & Machines Connect</small>
              </div>
            `,
          });
        }
      } catch (mailErr) {
        console.error("❌ Mail failed:", mailErr.message);
        // ⚠️ DO NOT FAIL API IF MAIL FAILS
      }
    }

    res.json({
      message: "Payment updated successfully",
      payment,
    });
  } catch (err) {
    console.error("❌ Update payment error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
