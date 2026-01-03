import Registration from "../models/Registration.js";

export const registerEvent = async (req, res) => {
  const registration = await Registration.create({
    ...req.body,
    userId: req.user.id,
  });

  res.status(201).json(registration);
};
