/**
 * Order Routes – Gupta Bakers
 *
 * POST /api/orders   – Create a new order
 *
 * Security rules enforced here:
 *  - Prices are NEVER accepted from the client; always fetched from MongoDB.
 *  - Totals are computed server-side.
 *  - Unavailable or non-existent products cause the entire order to be rejected.
 *  - No listing / admin endpoint in Phase 1.
 *
 * CURRENCY: all monetary amounts in INR paise (integer).
 *           1 rupee = 100 paise.
 */

import { Router } from "express";
import mongoose from "mongoose";
import Product from "../model/product.model.js";
import Order from "../model/order.model.js";
import { calculateDeliveryFee } from "../lib/deliveryFee.js";
import { MAX_QUANTITY_PER_ITEM } from "../lib/config.js";

const router = Router();

// ── Delivery fee ───────────────────────────────────────────────────────────
// Logic lives in lib/deliveryFee.js — single source of truth shared with
// payment.routes.js so both endpoints always charge the same amount.

// ── POST /api/orders ───────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const { customerName, customerPhone, deliveryAddress, items } = req.body;

  // ── 1. Validate required top-level fields ────────────────────────────────
  const missing = [];
  if (!customerName || typeof customerName !== "string" || !customerName.trim())
    missing.push("customerName");
  if (!customerPhone || typeof customerPhone !== "string" || !customerPhone.trim())
    missing.push("customerPhone");
  if (!deliveryAddress || typeof deliveryAddress !== "string" || !deliveryAddress.trim())
    missing.push("deliveryAddress");
  if (!items) missing.push("items");

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(", ")}.`,
    });
  }

  // ── 2. Validate items array ──────────────────────────────────────────────
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "items must be a non-empty array.",
    });
  }

  // Validate each item's shape
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!item.productId || typeof item.productId !== "string") {
      return res.status(400).json({
        success: false,
        message: `items[${i}].productId is missing or invalid.`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(item.productId)) {
      return res.status(400).json({
        success: false,
        message: `items[${i}].productId "${item.productId}" is not a valid product ID.`,
      });
    }

    const qty = item.quantity;
    if (
      qty === undefined ||
      qty === null ||
      !Number.isInteger(qty) ||
      qty < 1
    ) {
      return res.status(400).json({
        success: false,
        message: `items[${i}].quantity must be a positive integer.`,
      });
    }

    if (qty > MAX_QUANTITY_PER_ITEM) {
      return res.status(400).json({
        success: false,
        message: `items[${i}].quantity exceeds the maximum allowed quantity of ${MAX_QUANTITY_PER_ITEM} per item.`,
      });
    }

    // variantLabel is optional — just ensure it's a string if provided
    if (item.variantLabel !== undefined && item.variantLabel !== null) {
      if (typeof item.variantLabel !== "string") {
        return res.status(400).json({
          success: false,
          message: `items[${i}].variantLabel must be a string.`,
        });
      }
    }
  }

  // ── 3. Fetch products from DB and resolve prices server-side ─────────────
  const productIds = [...new Set(items.map((i) => i.productId))];
  let dbProducts;
  try {
    dbProducts = await Product.find({ _id: { $in: productIds } });
  } catch (err) {
    console.error("[POST /api/orders] DB fetch error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve product information. Please try again.",
    });
  }

  // Index for O(1) lookups
  const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

  // ── 4. Validate availability and build line items ────────────────────────
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

    // Resolve unit price: variant price takes precedence over base price
    let unitPricePaise = null;
    let variantLabel = null;

    if (item.variantLabel) {
      const variant = product.variants.find(
        (v) => v.label === item.variantLabel
      );
      if (!variant) {
        return res.status(400).json({
          success: false,
          message: `Variant "${item.variantLabel}" does not exist for product "${product.name}".`,
        });
      }
      unitPricePaise = variant.pricePaise;
      variantLabel = variant.label;
    } else if (product.pricePaise) {
      unitPricePaise = product.pricePaise;
    } else {
      // Product has variants but no base price and no variant was specified
      return res.status(400).json({
        success: false,
        message: `Product "${product.name}" has multiple variants. Please specify a variantLabel.`,
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

  // ── 5. Compute delivery fee and total ────────────────────────────────────
  const deliveryFeePaise = calculateDeliveryFee(subtotalPaise);
  const totalPaise = subtotalPaise + deliveryFeePaise;

  // ── 6. Create and save the order ─────────────────────────────────────────
  try {
    const order = await Order.create({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      items: orderItems,
      subtotalPaise,
      deliveryFeePaise,
      totalPaise,
      paymentStatus: "pending",
      orderStatus: "placed",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      data: {
        orderId: order._id,
        subtotalPaise: order.subtotalPaise,
        deliveryFeePaise: order.deliveryFeePaise,
        totalPaise: order.totalPaise,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        // Expose rupee equivalents for convenience
        subtotalRupees: (order.subtotalPaise / 100).toFixed(2),
        deliveryFeeRupees: (order.deliveryFeePaise / 100).toFixed(2),
        totalRupees: (order.totalPaise / 100).toFixed(2),
      },
    });
  } catch (err) {
    // Mongoose validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Order validation failed.",
        errors: messages,
      });
    }
    console.error("[POST /api/orders] Save error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to place order. Please try again.",
    });
  }
});

export default router;
