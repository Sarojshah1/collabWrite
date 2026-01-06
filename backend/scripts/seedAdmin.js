import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../src/models/User.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Assuming we run from root, but let's be safe and resolve relative to this script
// Script is in backend/scripts/seedAdmin.js
// Env is in backend/.env.local.development
const envPath = path.resolve(__dirname, "../.env.local.development");
console.log("Loading env from:", envPath);
dotenv.config({ path: envPath });

const seedAdmin = async () => {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI ? "Defined" : "Undefined");
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/collabwrite";
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    const email = "admin@example.com";
    const password = "adminpassword123";
    const name = "Super Admin";

    // check if admin exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      bio: "System Administrator",
    });

    await newAdmin.save();
    console.log(`Admin user created successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

seedAdmin();
