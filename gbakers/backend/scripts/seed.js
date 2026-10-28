/**
 * Gupta Bakers – Idempotent Database Seed Script
 *
 * Seeds the 13 sample products into MongoDB using the existing backend Product schema.
 *
 * Idempotence guarantees:
 *  - Matches products by unique `name`.
 *  - Inserts new products if they do not exist.
 *  - Updates existing products without modifying their `_id` or creating duplicates.
 *  - NEVER deletes any existing products or unrelated collections.
 *  - Preserves all supported schema fields: name, description, category,
 *    images, pricePaise, variants (with label, pricePaise, sku), isAvailable.
 *
 * Safe to run repeatedly in both development and production.
 */

import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../model/product.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: resolve(__dirname, "../.env") });

const { MONGO_URI } = process.env;

if (!MONGO_URI) {
  console.error("[seed] ERROR: MONGO_URI is not defined in backend/.env. Exiting.");
  process.exit(1);
}

/**
 * Supported categories in product.model.js:
 * ["cake", "bread", "pastry", "cookie", "snack", "other"]
 *
 * All prices in INR paise (1 rupee = 100 paise).
 */
export const SAMPLE_PRODUCTS = [
  // ── Cakes ──
  {
    name: "Chocolate Truffle Cake",
    description: "Layers of rich chocolate sponge enrobed in silky dark truffle ganache.",
    category: "cake",
    pricePaise: 65000,
    images: [],
    variants: [
      { label: "500 g", pricePaise: 65000, sku: "choc-truffle-cake-500g" },
      { label: "1 kg", pricePaise: 120000, sku: "choc-truffle-cake-1kg" },
    ],
    isAvailable: true,
  },
  {
    name: "Vanilla Berry Cake",
    description: "Light vanilla sponge with fresh seasonal berries and cream cheese frosting.",
    category: "cake",
    pricePaise: 75000,
    images: [],
    variants: [
      { label: "500 g", pricePaise: 75000, sku: "vanilla-berry-cake-500g" },
      { label: "1 kg", pricePaise: 140000, sku: "vanilla-berry-cake-1kg" },
    ],
    isAvailable: true,
  },
  {
    name: "Butterscotch Crunch Cake",
    description: "Caramel-laced sponge with toasted praline and butterscotch drizzle.",
    category: "cake",
    pricePaise: 60000,
    images: [],
    variants: [
      { label: "500 g", pricePaise: 60000, sku: "butterscotch-cake-500g" },
      { label: "1 kg", pricePaise: 110000, sku: "butterscotch-cake-1kg" },
    ],
    isAvailable: true,
  },
  {
    name: "Red Velvet Cake",
    description: "Classic crimson layers with tangy cream cheese frosting and white chocolate shavings.",
    category: "cake",
    pricePaise: 70000,
    images: [],
    variants: [
      { label: "500 g", pricePaise: 70000, sku: "red-velvet-cake-500g" },
      { label: "1 kg", pricePaise: 130000, sku: "red-velvet-cake-1kg" },
    ],
    isAvailable: true,
  },

  // ── Brownies (Category: snack in backend schema) ──
  {
    name: "Classic Fudge Brownie",
    description: "Dense, intensely chocolatey, with a crackly top and molten centre.",
    category: "snack",
    pricePaise: 12000,
    images: [],
    variants: [
      { label: "Single", pricePaise: 12000, sku: "classic-fudge-brownie-single" },
      { label: "Box of 4", pricePaise: 45000, sku: "classic-fudge-brownie-box4" },
    ],
    isAvailable: true,
  },
  {
    name: "Walnut Brownie",
    description: "Rich chocolate brownie studded with toasted walnuts.",
    category: "snack",
    pricePaise: 14000,
    images: [],
    variants: [
      { label: "Single", pricePaise: 14000, sku: "walnut-brownie-single" },
      { label: "Box of 4", pricePaise: 52000, sku: "walnut-brownie-box4" },
    ],
    isAvailable: true,
  },
  {
    name: "Salted Caramel Brownie",
    description: "Dark chocolate brownie swirled with house-made salted caramel.",
    category: "snack",
    pricePaise: 15000,
    images: [],
    variants: [
      { label: "Single", pricePaise: 15000, sku: "salted-caramel-brownie-single" },
      { label: "Box of 4", pricePaise: 56000, sku: "salted-caramel-brownie-box4" },
    ],
    isAvailable: true,
  },

  // ── Pastries ──
  {
    name: "Butter Croissant",
    description: "Hand-laminated, golden, and impossibly flaky.",
    category: "pastry",
    pricePaise: 12000,
    images: [],
    variants: [
      { label: "Single", pricePaise: 12000, sku: "butter-croissant-single" },
      { label: "Box of 3", pricePaise: 34000, sku: "butter-croissant-box3" },
    ],
    isAvailable: true,
  },
  {
    name: "Almond Croissant",
    description: "Twice-baked croissant filled with almond frangipane and topped with sliced almonds.",
    category: "pastry",
    pricePaise: 15000,
    images: [],
    variants: [
      { label: "Single", pricePaise: 15000, sku: "almond-croissant-single" },
      { label: "Box of 3", pricePaise: 42000, sku: "almond-croissant-box3" },
    ],
    isAvailable: true,
  },
  {
    name: "Fruit Danish",
    description: "Buttery puff pastry cradling custard cream and seasonal fruit.",
    category: "pastry",
    pricePaise: 13000,
    images: [],
    variants: [
      { label: "Single", pricePaise: 13000, sku: "fruit-danish-single" },
    ],
    isAvailable: true,
  },

  // ── Cookies ──
  {
    name: "Chocolate Chip Cookie",
    description: "Crisp-edged, chewy-centred, loaded with dark and milk chocolate chips.",
    category: "cookie",
    pricePaise: 8000,
    images: [],
    variants: [
      { label: "Single", pricePaise: 8000, sku: "choc-chip-cookie-single" },
      { label: "Box of 6", pricePaise: 45000, sku: "choc-chip-cookie-box6" },
    ],
    isAvailable: true,
  },
  {
    name: "Shortbread Butter Cookie",
    description: "Melt-in-the-mouth buttery shortbread, stamped with a heritage pattern.",
    category: "cookie",
    pricePaise: 6000,
    images: [],
    variants: [
      { label: "Single", pricePaise: 6000, sku: "shortbread-butter-cookie-single" },
      { label: "Box of 8", pricePaise: 45000, sku: "shortbread-butter-cookie-box8" },
    ],
    isAvailable: true,
  },
  {
    name: "Oatmeal Raisin Cookie",
    description: "Hearty oats, juicy raisins, and warm cinnamon in every bite.",
    category: "cookie",
    pricePaise: 8000,
    images: [],
    variants: [
      { label: "Single", pricePaise: 8000, sku: "oatmeal-raisin-cookie-single" },
      { label: "Box of 6", pricePaise: 45000, sku: "oatmeal-raisin-cookie-box6" },
    ],
    isAvailable: true,
  },
];

export async function seedProducts() {
  let createdCount = 0;
  let updatedCount = 0;

  console.log(`[seed] Starting idempotent seed for ${SAMPLE_PRODUCTS.length} sample products...`);

  for (const productData of SAMPLE_PRODUCTS) {
    const existing = await Product.findOne({ name: productData.name });

    if (existing) {
      // Idempotently update fields while keeping the existing _id intact
      existing.description = productData.description;
      existing.category = productData.category;
      existing.pricePaise = productData.pricePaise;
      existing.variants = productData.variants;
      if (productData.images && productData.images.length > 0) {
        existing.images = productData.images;
      }
      if (existing.isAvailable === undefined) {
        existing.isAvailable = productData.isAvailable;
      }
      await existing.save();
      updatedCount++;
      console.log(`  [updated] "${productData.name}" (ID: ${existing._id})`);
    } else {
      const created = await Product.create(productData);
      createdCount++;
      console.log(`  [created] "${productData.name}" (ID: ${created._id})`);
    }
  }

  const totalInDb = await Product.countDocuments();
  console.log(`[seed] Done! Created: ${createdCount}, Updated: ${updatedCount}, Total products in DB: ${totalInDb}`);

  return { createdCount, updatedCount, totalInDb };
}

// Run directly when called from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    console.log("[seed] Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("[seed] MongoDB connected.");

    await seedProducts();

    await mongoose.disconnect();
    console.log("[seed] MongoDB disconnected cleanly.");
    process.exit(0);
  } catch (err) {
    console.error("[seed] ERROR:", err.message);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
    process.exit(1);
  }
}
