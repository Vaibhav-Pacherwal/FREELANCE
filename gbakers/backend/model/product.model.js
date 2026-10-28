/**
 * Product Model – Gupta Bakers
 *
 * CURRENCY CONVENTION:
 * All price values are stored as integers in INR paise (1 rupee = 100 paise).
 * Example: ₹120.00 is stored as 12000.
 * This avoids floating-point rounding errors in financial calculations.
 * Convert to rupees on the client by dividing by 100.
 */

import mongoose from "mongoose";

// Sub-schema for product variants (e.g. different weights / sizes)
const variantSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Variant label is required"],
      trim: true,
      maxlength: [100, "Variant label must be 100 characters or fewer"],
    },
    // Price in paise (INR). Must be a positive integer.
    pricePaise: {
      type: Number,
      required: [true, "Variant price is required"],
      min: [1, "Variant price must be at least 1 paise"],
      validate: {
        validator: Number.isInteger,
        message: "Variant price must be an integer (paise, not rupees)",
      },
    },
    sku: {
      type: String,
      trim: true,
      maxlength: [100, "SKU must be 100 characters or fewer"],
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name must be 200 characters or fewer"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description must be 2000 characters or fewer"],
      default: "",
    },

    // Bakery category e.g. 'cake', 'bread', 'pastry', 'cookie', 'snack', 'other'
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      lowercase: true,
      enum: {
        values: ["cake", "bread", "pastry", "cookie", "snack", "other"],
        message: "{VALUE} is not a supported category",
      },
    },

    // Array of image URLs (CDN / storage links). First item treated as primary.
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) =>
          arr.every((url) => {
            try {
              new URL(url);
              return true;
            } catch {
              return false;
            }
          }),
        message: "All image entries must be valid URLs",
      },
    },

    // Base price in paise (INR). Required when there are no variants.
    // When variants exist this field can serve as a display/reference price.
    pricePaise: {
      type: Number,
      min: [1, "Price must be at least 1 paise"],
      validate: {
        validator: Number.isInteger,
        message: "Price must be an integer (paise, not rupees)",
      },
    },

    // Optional size/weight variants with individual prices
    variants: {
      type: [variantSchema],
      default: [],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Ensure a product has a base price OR at least one variant
productSchema.pre("validate", function (next) {
  if (!this.pricePaise && this.variants.length === 0) {
    this.invalidate(
      "pricePaise",
      "A product must have a base price or at least one variant"
    );
  }
  if (typeof next === "function") {
    next();
  }
});

// Index for efficient listing queries
productSchema.index({ isAvailable: 1, category: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
