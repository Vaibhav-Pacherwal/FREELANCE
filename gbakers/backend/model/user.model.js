/**
 * User Model – Gupta Bakers
 *
 * Placeholder schema for future authentication/customer-account features.
 * Phase 1 does not implement auth — this file is intentionally minimal.
 *
 * CURRENCY NOTE: If user-specific data (e.g. wallet balance) is added later,
 * follow the project convention: store monetary values as integers in INR paise.
 */

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [100, "Name must be 100 characters or fewer"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
