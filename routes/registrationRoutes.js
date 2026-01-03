import express from "express";
import Registration from "../models/Registration.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", protect, async (req, res) => {
  const {
    teamName,
    leaderName,
    leaderEmail,
    leaderMobile,
    college,
    domain,
    teamSize,
    members,
  } = req.body;

  const registration = await Registration.create({
    userId: req.user,
    teamName,
    leaderName,
    leaderEmail,
    leaderMobile,
    college,
    domain,
    teamSize,
    members,
  });

  res.json({
    message: "Registration successful",
    registration,
  });
});

export default router;
