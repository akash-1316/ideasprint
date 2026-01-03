import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    event: { type: String, default: "IdeaSprint" },

    teamName: String,
    leaderName: String,
    leaderEmail: String,
    leaderMobile: String,
    college: String,
    domain: String,

    teamSize: Number,
    members: [String],

    paymentStatus: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Registration", registrationSchema);
