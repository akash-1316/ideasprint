import Payment from "../models/Payment.js";

export const getStatus = async (req, res) => {
  const payment = await Payment.findOne({ userId: req.user.id });

  if (!payment) {
    return res.json({ status: "NOT_PAID" });
  }

  res.json({
    status: payment.verified ? "VERIFIED" : "PENDING",
  });
};
