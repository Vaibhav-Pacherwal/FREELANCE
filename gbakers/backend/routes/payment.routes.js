/**
 * Payment Routes – Gupta Bakers (Razorpay Test Mode)
 *
 * POST /api/payments/create-order  – Create internal Order + Razorpay order
 * POST /api/payments/verify        – Verify Razorpay signature, mark order paid
 *
 * Security guarantees:
 *  - Amount is ALWAYS taken from the server-stored Order — never from the client.
 *  - Signature verification uses HMAC-SHA256 with a timing-safe comparison (crypto.timingSafeEqual).
 *  - An order is only marked "paid" after successful signature verification.
 *  - Razorpay secret is never included in any response.
 *  - Duplicate verification requests are handled idempotently (already-paid orders return 200).
 *
 * CURRENCY: INR paise throughout.  Razorpay itself expects paise, so no conversion needed.
 */

import { Router } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import Product from "../model/product.model.js";
import Order from "../model/order.model.js";
import { calculateDeliveryFee } from "../lib/deliveryFee.js";
import { MAX_QUANTITY_PER_ITEM } from "../lib/config.js";

const router = Router();

// ── Razorpay client ───────────────────────────────────────────────────────
// NOTE: process.env is read lazily (inside request handlers and the getter)
// because in ESM, all `import` statements are resolved before the module body
// runs — meaning dotenv.config() in main.js has NOT yet executed when this
// module is first evaluated. Reading process.env at call-time is the safe pattern.

// Lazy singleton — created on first request
let _razorpay = null;
function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return null; // caller should return 503
  }
  if (!_razorpay) {
    _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return _razorpay;
}

// ── Delivery fee ───────────────────────────────────────────────────────────
// calculateDeliveryFee() is imported from lib/deliveryFee.js (line 23) —
// single source of truth shared with order.routes.js.

// ══════════════════════════════════════════════════════════════════════════
// POST /api/payments/create-order
// ══════════════════════════════════════════════════════════════════════════
// Accepts the same payload as POST /api/orders.
// Creates a pending internal Order, then creates a matching Razorpay order.
// Returns { orderId, razorpayOrderId, totalPaise, keyId } — never the secret.
router.post("/create-order", async (req, res) => {
  const razorpayClient = getRazorpayClient();
  if (!razorpayClient) {
    return res.status(503).json({
      success: false,
      message: "Payment service is not configured. Please contact support.",
    });
  }

  const { customerName, customerPhone, deliveryAddress, items, deliveryCoordinates } = req.body;

  // ── 1. Basic field validation ────────────────────────────────────────────
  const missing = [];
  if (!customerName?.trim()) missing.push("customerName");
  if (!customerPhone?.trim()) missing.push("customerPhone");
  if (!deliveryAddress?.trim()) missing.push("deliveryAddress");
  if (!items) missing.push("items");

  if (missing.length) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(", ")}.`,
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "items must be a non-empty array.",
    });
  }

  // ── 2. Item-level validation ─────────────────────────────────────────────
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
      return res.status(400).json({
        success: false,
        message: `items[${i}].productId is missing or invalid.`,
      });
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return res.status(400).json({
        success: false,
        message: `items[${i}].quantity must be a positive integer.`,
      });
    }
    if (item.quantity > MAX_QUANTITY_PER_ITEM) {
      return res.status(400).json({
        success: false,
        message: `items[${i}].quantity exceeds the maximum allowed quantity of ${MAX_QUANTITY_PER_ITEM} per item.`,
      });
    }
    if (item.variantLabel !== undefined && item.variantLabel !== null) {
      if (typeof item.variantLabel !== "string") {
        return res.status(400).json({
          success: false,
          message: `items[${i}].variantLabel must be a string.`,
        });
      }
    }
  }

  // ── 3. Fetch products and build order items (server-side price resolution) ─
  const productIds = [...new Set(items.map((i) => i.productId))];
  let dbProducts;
  try {
    dbProducts = await Product.find({ _id: { $in: productIds } });
  } catch (err) {
    console.error("[POST /api/payments/create-order] DB fetch:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve product information.",
    });
  }

  const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));
  const orderItems = [];
  let subtotalPaise = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const product = productMap.get(item.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID "${item.productId}" was not found.`,
      });
    }
    if (!product.isAvailable) {
      return res.status(400).json({
        success: false,
        message: `"${product.name}" is currently unavailable.`,
      });
    }

    let unitPricePaise = null;
    let variantLabel = null;

    if (item.variantLabel) {
      const variant = product.variants.find((v) => v.label === item.variantLabel);
      if (!variant) {
        return res.status(400).json({
          success: false,
          message: `Variant "${item.variantLabel}" does not exist for "${product.name}".`,
        });
      }
      unitPricePaise = variant.pricePaise;
      variantLabel = variant.label;
    } else if (product.pricePaise) {
      unitPricePaise = product.pricePaise;
    } else {
      return res.status(400).json({
        success: false,
        message: `"${product.name}" requires a variantLabel to be specified.`,
      });
    }

    const lineTotalPaise = unitPricePaise * item.quantity;
    subtotalPaise += lineTotalPaise;

    orderItems.push({
      productId: product._id,
      productName: product.name,
      variantLabel,
      quantity: item.quantity,
      unitPricePaise,
      lineTotalPaise,
    });
  }

  const deliveryFeePaise = calculateDeliveryFee(subtotalPaise);
  const totalPaise = subtotalPaise + deliveryFeePaise;

  // ── 4. Create the internal pending order in MongoDB ──────────────────────
  let validatedCoordinates = null;
  if (deliveryCoordinates && typeof deliveryCoordinates === "object") {
    const lat = Number(deliveryCoordinates.latitude);
    const lon = Number(deliveryCoordinates.longitude);
    if (
      Number.isFinite(lat) &&
      lat >= -90 &&
      lat <= 90 &&
      Number.isFinite(lon) &&
      lon >= -180 &&
      lon <= 180
    ) {
      validatedCoordinates = { latitude: lat, longitude: lon };
    }
  }

  let order;
  try {
    const orderData = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      items: orderItems,
      subtotalPaise,
      deliveryFeePaise,
      totalPaise,
      paymentStatus: "pending",
      orderStatus: "placed",
    };
    if (validatedCoordinates) {
      orderData.deliveryCoordinates = validatedCoordinates;
    }
    order = await Order.create(orderData);
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Order validation failed.",
        errors: messages,
      });
    }
    console.error("[POST /api/payments/create-order] Order save:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create order. Please try again.",
    });
  }

  // ── 5. Create the Razorpay order ─────────────────────────────────────────
  let razorpayOrder;
  try {
    razorpayOrder = await razorpayClient.orders.create({
      amount: totalPaise,           // Razorpay expects paise
      currency: "INR",
      receipt: order._id.toString(), // links Razorpay order to our DB order
      notes: {
        orderId: order._id.toString(),
        customerName: customerName.trim(),
      },
    });
  } catch (err) {
    // Razorpay call failed — delete the orphaned pending order to keep DB clean
    try {
      await Order.findByIdAndDelete(order._id);
    } catch (cleanupErr) {
      console.error(
        "[POST /api/payments/create-order] Cleanup failed for order",
        order._id,
        cleanupErr.message
      );
    }
    console.error("[POST /api/payments/create-order] Razorpay error:", err.message);
    return res.status(502).json({
      success: false,
      message: "Failed to initiate payment. Please try again.",
    });
  }

  // ── 6. Store Razorpay order ID in our order ──────────────────────────────
  // FATAL: if we cannot persist the razorpayOrderId association, the order
  // becomes permanently un-verifiable — POST /verify hard-checks this field.
  // Roll back by deleting the pending order so no stuck records accumulate.
  try {
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();
  } catch (err) {
    console.error("[POST /api/payments/create-order] Save razorpayOrderId:", err.message);
    try {
      await Order.findByIdAndDelete(order._id);
    } catch (cleanupErr) {
      console.error(
        "[POST /api/payments/create-order] Cleanup after razorpayOrderId save failure:",
        order._id.toString(),
        cleanupErr.message
      );
    }
    return res.status(500).json({
      success: false,
      message: "Failed to record payment reference. Please try again.",
    });
  }

  // ── 7. Respond with everything the client needs to open the Razorpay modal ─
  return res.status(201).json({
    success: true,
    data: {
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      totalPaise,
      totalRupees: (totalPaise / 100).toFixed(2),
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,   // public key — safe to send to client
    },
  });
});

// ══════════════════════════════════════════════════════════════════════════
// POST /api/payments/verify
// ══════════════════════════════════════════════════════════════════════════
// Verifies the Razorpay signature after payment completes on the client.
// Expected body: { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
//
// Signature algorithm (Razorpay spec):
//   HMAC-SHA256(razorpayOrderId + "|" + razorpayPaymentId, RAZORPAY_KEY_SECRET)
//   Must equal razorpaySignature (hex string).
router.post("/verify", async (req, res) => {
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!process.env.RAZORPAY_KEY_ID || !razorpaySecret) {
    return res.status(503).json({
      success: false,
      message: "Payment service is not configured.",
    });
  }

  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  // ── 1. Validate presence of all required fields ──────────────────────────
  const requiredFields = { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature };
  const missingFields = Object.keys(requiredFields).filter(
    (k) => !requiredFields[k] || typeof requiredFields[k] !== "string" || !requiredFields[k].trim()
  );

  if (missingFields.length) {
    return res.status(400).json({
      success: false,
      message: `Missing or invalid fields: ${missingFields.join(", ")}.`,
    });
  }

  // ── 2. Validate orderId format ───────────────────────────────────────────
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({
      success: false,
      message: "orderId is not a valid format.",
    });
  }

  // ── 3. Fetch the order from DB and verify it is associated with this Razorpay order ─
  let order;
  try {
    order = await Order.findById(orderId);
  } catch (err) {
    console.error("[POST /api/payments/verify] DB lookup:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order. Please try again.",
    });
  }

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  // Ensure the Razorpay order ID matches what we stored
  if (!order.razorpayOrderId || order.razorpayOrderId !== razorpayOrderId) {
    return res.status(400).json({
      success: false,
      message: "Razorpay order ID does not match the order record.",
    });
  }

  // ── 4. Idempotency: already paid → validate the IDs match, then return 200 ──
  // We still verify the stored razorpayPaymentId matches the submitted one so
  // a client cannot get a 200 by sending a valid orderId for someone else's
  // completed payment with a different paymentId.
  if (order.paymentStatus === "paid") {
    if (order.razorpayPaymentId && order.razorpayPaymentId !== razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID does not match the verified payment for this order.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Payment was already verified.",
      data: {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
      },
    });
  }

  // ── 5. Compute expected HMAC-SHA256 signature ────────────────────────────
  const expectedSignature = crypto
    .createHmac("sha256", razorpaySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  // ── 6. Timing-safe comparison to prevent timing attacks ─────────────────
  let signaturesMatch = false;
  try {
    signaturesMatch = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(razorpaySignature, "hex")
    );
  } catch {
    // Buffer lengths differ — signature is definitely wrong
    signaturesMatch = false;
  }

  if (!signaturesMatch) {
    // Mark payment as failed for audit trail
    try {
      order.paymentStatus = "failed";
      await order.save();
    } catch (saveErr) {
      console.error("[POST /api/payments/verify] Save failed status:", saveErr.message);
    }
    return res.status(400).json({
      success: false,
      message: "Payment signature verification failed. Payment rejected.",
    });
  }

  // ── 7. Signature valid → mark order as paid ──────────────────────────────
  try {
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save();
  } catch (err) {
    console.error("[POST /api/payments/verify] Save paid status:", err.message);
    return res.status(500).json({
      success: false,
      message: "Payment verified but failed to update order record. Please contact support.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Payment verified successfully.",
    data: {
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
    },
  });
});

export default router;
