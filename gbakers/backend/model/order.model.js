/**
 * Order Model – Gupta Bakers
 *
 * CURRENCY CONVENTION (same as Product):
 * All monetary amounts are stored as integers in INR paise (1 rupee = 100 paise).
 * Example: ₹250.00 is stored as 25000.
 * Server calculates subtotal, delivery fee, and total — never trust client-submitted figures.
 */

import mongoose from "mongoose";

// Snapshot of a single ordered product line item
// Stored as a snapshot so historical orders reflect prices at the time of purchase
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    productName: {
      type: String,
      required: [true, "Product name snapshot is required"],
      trim: true,
    },
    // Variant label if the customer picked one (e.g. "500g", "1kg")
    variantLabel: {
      type: String,
      trim: true,
      default: null,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
    // Unit price in paise at the time the order was placed (server-fetched, never client-supplied)
    unitPricePaise: {
      type: Number,
      required: [true, "Unit price snapshot is required"],
      min: [1, "Unit price must be at least 1 paise"],
      validate: {
        validator: Number.isInteger,
        message: "Unit price must be an integer (paise)",
      },
    },
    // Line total = quantity × unitPricePaise (computed server-side)
    lineTotalPaise: {
      type: Number,
      required: [true, "Line total is required"],
      min: [1, "Line total must be positive"],
      validate: {
        validator: Number.isInteger,
        message: "Line total must be an integer (paise)",
      },
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // ── Customer Info ────────────────────────────────────────────────────────
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      minlength: [2, "Customer name must be at least 2 characters"],
      maxlength: [100, "Customer name must be 100 characters or fewer"],
    },
    customerPhone: {
      type: String,
      required: [true, "Customer phone number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"],
    },
    deliveryAddress: {
      type: String,
      required: [true, "Delivery address is required"],
      trim: true,
      minlength: [10, "Delivery address must be at least 10 characters"],
      maxlength: [500, "Delivery address must be 500 characters or fewer"],
    },

    // ── Items ────────────────────────────────────────────────────────────────
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Order must contain at least one item",
      },
    },

    // ── Financials (all in paise) ─────────────────────────────────────────
    subtotalPaise: {
      type: Number,
      required: true,
      min: [1, "Subtotal must be positive"],
      validate: {
        validator: Number.isInteger,
        message: "Subtotal must be an integer (paise)",
      },
    },
    deliveryFeePaise: {
      type: Number,
      required: true,
      min: [0, "Delivery fee cannot be negative"],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Delivery fee must be an integer (paise)",
      },
    },
    totalPaise: {
      type: Number,
      required: true,
      min: [1, "Order total must be positive"],
      validate: {
        validator: Number.isInteger,
        message: "Total must be an integer (paise)",
      },
    },

    // ── Payment ──────────────────────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: {
        values: ["pending", "paid", "failed", "refunded"],
        message: "{VALUE} is not a valid payment status",
      },
      default: "pending",
    },

    // ── Order lifecycle ──────────────────────────────────────────────────────
    orderStatus: {
      type: String,
      enum: {
        values: ["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
        message: "{VALUE} is not a valid order status",
      },
      default: "placed",
    },

    // ── Razorpay fields (populated only after payment flow) ─────────────────
    razorpayOrderId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Compound index for efficient lookup by payment/order status
orderSchema.index({ paymentStatus: 1, orderStatus: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
