import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    utr: String,
    screenshot: String,
    amount: Number,
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
