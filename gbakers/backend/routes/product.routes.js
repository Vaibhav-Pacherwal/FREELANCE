/**
 * Product Routes – Gupta Bakers
 *
 * GET /api/products          – List all available products
 * GET /api/products/:id      – Get a single product by MongoDB ObjectId
 *
 * No create / update / delete endpoints in Phase 1 (admin CRUD is out of scope).
 */

import { Router } from "express";
import mongoose from "mongoose";
import Product from "../model/product.model.js";

const router = Router();

// ── GET /api/products ──────────────────────────────────────────────────────
// Returns only products where isAvailable === true.
// Sorted newest-first so the client can display recently added items on top.
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true })
      .select("-__v")           // strip internal versioning field
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.error("[GET /api/products]", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve products. Please try again later.",
    });
  }
});

// ── GET /api/products/:id ──────────────────────────────────────────────────
// Returns one product regardless of availability (so a "sold out" page can still render).
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format before hitting the database
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID format.",
    });
  }

  try {
    const product = await Product.findById(id).select("-__v");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error("[GET /api/products/:id]", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve product. Please try again later.",
    });
  }
});

export default router;
