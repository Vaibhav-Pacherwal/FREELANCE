import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Category from "../models/category.model.js";

dotenv.config({ path: "../.env" });

const categories = [
  {
    name: "T-Shirts",
    slug: "t-shirts",
    description: "Comfortable and stylish t-shirts for everyday wear.",
    image: {
      url: "https://placehold.co/600x600?text=T-Shirts",
      alt: "T-Shirts Collection",
    },
  },
  {
    name: "Shirts",
    slug: "shirts",
    description: "Casual and formal shirts for every occasion.",
    image: {
      url: "https://placehold.co/600x600?text=Shirts",
      alt: "Shirts Collection",
    },
  },
  {
    name: "Hoodies",
    slug: "hoodies",
    description: "Warm, comfortable and stylish hoodies.",
    image: {
      url: "https://placehold.co/600x600?text=Hoodies",
      alt: "Hoodies Collection",
    },
  },
  {
    name: "Jeans",
    slug: "jeans",
    description: "Premium denim jeans with modern fits.",
    image: {
      url: "https://placehold.co/600x600?text=Jeans",
      alt: "Jeans Collection",
    },
  },
  {
    name: "Shoes",
    slug: "shoes",
    description: "Comfortable and fashionable footwear.",
    image: {
      url: "https://placehold.co/600x600?text=Shoes",
      alt: "Shoes Collection",
    },
  },
  {
    name: "Jackets",
    slug: "jackets",
    description: "Stylish jackets for every season.",
    image: {
      url: "https://placehold.co/600x600?text=Jackets",
      alt: "Jackets Collection",
    },
  },
  {
    name: "Pants",
    slug: "pants",
    description: "Modern pants and trousers for everyday style.",
    image: {
      url: "https://placehold.co/600x600?text=Pants",
      alt: "Pants Collection",
    },
  },
  {
    name: "Sweatshirts",
    slug: "sweatshirts",
    description: "Comfortable sweatshirts with modern designs.",
    image: {
      url: "https://placehold.co/600x600?text=Sweatshirts",
      alt: "Sweatshirts Collection",
    },
  },
];

const seedCategories = async () => {
  try {
    await connectDB();

    await Category.deleteMany({});

    await Category.insertMany(categories);

    console.log(
      `Successfully seeded ${categories.length} categories`
    );

    process.exit(0);
  } catch (error) {
    console.error("Category seeding failed:", error.message);
    process.exit(1);
  }
};

seedCategories();