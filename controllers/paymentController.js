import Payment from "../models/Payment.js";

export const submitPayment = async (req, res) => {
  const payment = await Payment.create({
    userId: req.user.id,
    registrationId: req.body.registrationId,
    utr: req.body.utr,
    screenshot: req.file.filename,
  });

  res.status(201).json(payment);
};
