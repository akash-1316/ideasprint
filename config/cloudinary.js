import dotenv from "dotenv";
dotenv.config(); // 🔥 FORCE load env HERE

import { v2 as cloudinary } from "cloudinary";

console.log("☁️ Cloudinary ENV CHECK:", {
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY ? "LOADED" : "MISSING",
  secret: process.env.CLOUDINARY_API_SECRET ? "LOADED" : "MISSING",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
