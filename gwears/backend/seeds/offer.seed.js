import dotenv from "dotenv";
import connectDB from "../config/db.js";

import Offer from "../models/offer.model.js";
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";

dotenv.config({ path: "../.env" });

const seedOffers = async () => {
  try {
    await connectDB();

    const categories = await Category.find().limit(10);
    const products = await Product.find().limit(20);

    if (!categories.length) {
      console.log("No categories found. Seed categories first.");
      process.exit(1);
    }

    if (!products.length) {
      console.log("No products found. Seed products first.");
      process.exit(1);
    }

    const now = new Date();

    const futureDate = (days) => {
      const date = new Date(now);
      date.setDate(date.getDate() + days);
      return date;
    };

    const pastDate = (days) => {
      const date = new Date(now);
      date.setDate(date.getDate() - days);
      return date;
    };

    const offers = [
      {
        title: "Summer Sale",
        description:
          "Enjoy 20% off across the entire store during our summer sale.",
        image: {
          url: "https://placehold.co/1200x500?text=Summer+Sale",
          alt: "Summer Sale",
        },
        discountType: "percentage",
        discountValue: 20,
        appliesTo: "store",
        category: null,
        product: null,
        startDate: pastDate(2),
        endDate: futureDate(15),
        isActive: true,
      },

      {
        title: "Mega Weekend Sale",
        description:
          "Get a flat 15% discount on all products this weekend.",
        image: {
          url: "https://placehold.co/1200x500?text=Mega+Weekend+Sale",
          alt: "Mega Weekend Sale",
        },
        discountType: "percentage",
        discountValue: 15,
        appliesTo: "store",
        category: null,
        product: null,
        startDate: now,
        endDate: futureDate(7),
        isActive: true,
      },

      {
        title: "Flat ₹500 Off",
        description:
          "Get a flat ₹500 discount on selected products.",
        image: {
          url: "https://placehold.co/1200x500?text=Flat+500+Off",
          alt: "Flat 500 Off",
        },
        discountType: "fixed",
        discountValue: 500,
        appliesTo: "store",
        category: null,
        product: null,
        startDate: pastDate(1),
        endDate: futureDate(20),
        isActive: true,
      },

      {
        title: "T-Shirt Festival",
        description:
          "Save 25% on our entire t-shirt collection.",
        image: {
          url: "https://placehold.co/1200x500?text=T-Shirt+Festival",
          alt: "T-Shirt Festival",
        },
        discountType: "percentage",
        discountValue: 25,
        appliesTo: "category",
        category: categories.find(
          (c) => c.name === "T-Shirts"
        )?._id || categories[0]._id,
        product: null,
        startDate: pastDate(3),
        endDate: futureDate(14),
        isActive: true,
      },

      {
        title: "Hoodie Season",
        description:
          "Get 30% off selected hoodies.",
        image: {
          url: "https://placehold.co/1200x500?text=Hoodie+Season",
          alt: "Hoodie Season",
        },
        discountType: "percentage",
        discountValue: 30,
        appliesTo: "category",
        category: categories.find(
          (c) => c.name === "Hoodies"
        )?._id || categories[0]._id,
        product: null,
        startDate: now,
        endDate: futureDate(30),
        isActive: true,
      },

      {
        title: "Denim Days",
        description:
          "Save 20% on jeans and denim products.",
        image: {
          url: "https://placehold.co/1200x500?text=Denim+Days",
          alt: "Denim Days",
        },
        discountType: "percentage",
        discountValue: 20,
        appliesTo: "category",
        category: categories.find(
          (c) => c.name === "Jeans"
        )?._id || categories[0]._id,
        product: null,
        startDate: pastDate(5),
        endDate: futureDate(25),
        isActive: true,
      },

      {
        title: "Sneaker Sale",
        description:
          "Flat ₹700 off on selected sneakers.",
        image: {
          url: "https://placehold.co/1200x500?text=Sneaker+Sale",
          alt: "Sneaker Sale",
        },
        discountType: "fixed",
        discountValue: 700,
        appliesTo: "category",
        category: categories.find(
          (c) => c.name === "Shoes"
        )?._id || categories[0]._id,
        product: null,
        startDate: pastDate(1),
        endDate: futureDate(10),
        isActive: true,
      },

      {
        title: "Featured Product Deal",
        description:
          "Get 40% off this selected product for a limited time.",
        image: {
          url: "https://placehold.co/1200x500?text=Product+Deal",
          alt: "Featured Product Deal",
        },
        discountType: "percentage",
        discountValue: 40,
        appliesTo: "product",
        category: null,
        product: products[0]._id,
        startDate: now,
        endDate: futureDate(5),
        isActive: true,
      },

      {
        title: "Limited Product Offer",
        description:
          "Grab this product at a special flat ₹300 discount.",
        image: {
          url: "https://placehold.co/1200x500?text=Limited+Offer",
          alt: "Limited Product Offer",
        },
        discountType: "fixed",
        discountValue: 300,
        appliesTo: "product",
        category: null,
        product: products[1]?._id || products[0]._id,
        startDate: pastDate(2),
        endDate: futureDate(12),
        isActive: true,
      },

      {
        title: "Expired Winter Sale",
        description:
          "Previous winter collection sale.",
        image: {
          url: "https://placehold.co/1200x500?text=Winter+Sale",
          alt: "Winter Sale",
        },
        discountType: "percentage",
        discountValue: 35,
        appliesTo: "store",
        category: null,
        product: null,
        startDate: pastDate(40),
        endDate: pastDate(5),
        isActive: false,
      },

      {
        title: "Coming Soon Sale",
        description:
          "An exciting store-wide sale starting soon.",
        image: {
          url: "https://placehold.co/1200x500?text=Coming+Soon",
          alt: "Coming Soon Sale",
        },
        discountType: "percentage",
        discountValue: 25,
        appliesTo: "store",
        category: null,
        product: null,
        startDate: futureDate(10),
        endDate: futureDate(25),
        isActive: true,
      },

      {
        title: "Jacket Special",
        description:
          "Save 30% on selected jackets.",
        image: {
          url: "https://placehold.co/1200x500?text=Jacket+Special",
          alt: "Jacket Special",
        },
        discountType: "percentage",
        discountValue: 30,
        appliesTo: "category",
        category: categories.find(
          (c) => c.name === "Jackets"
        )?._id || categories[0]._id,
        product: null,
        startDate: pastDate(4),
        endDate: futureDate(18),
        isActive: true,
      },
    ];

    await Offer.deleteMany({});

    await Offer.insertMany(offers);

    console.log(`Successfully seeded ${offers.length} offers.`);

    process.exit(0);
  } catch (error) {
    console.error("Offer seeding failed:", error);
    process.exit(1);
  }
};

seedOffers();