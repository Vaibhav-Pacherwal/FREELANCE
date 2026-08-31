import dotenv from "dotenv";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import connectDB from "../config/db.js";

dotenv.config({ path: "../.env" });

const products = [
  {
    name: "Classic Black Oversized T-Shirt",
    category: "T-Shirts",
    price: 799,
    originalPrice: 999,
    description:
      "Premium cotton oversized t-shirt with a relaxed fit for everyday comfort.",
  },
  {
    name: "Essential White Cotton T-Shirt",
    category: "T-Shirts",
    price: 599,
    originalPrice: 799,
    description:
      "Soft breathable cotton t-shirt designed for a clean and minimal everyday look.",
  },
  {
    name: "Urban Graphic Print T-Shirt",
    category: "T-Shirts",
    price: 899,
    originalPrice: 1199,
    description:
      "Modern graphic print t-shirt with premium fabric and comfortable fit.",
  },
  {
    name: "Minimal Beige Oversized Tee",
    category: "T-Shirts",
    price: 799,
    originalPrice: 999,
    description:
      "Minimal beige oversized t-shirt perfect for casual streetwear outfits.",
  },
  {
    name: "Vintage Washed Black T-Shirt",
    category: "T-Shirts",
    price: 999,
    originalPrice: 1299,
    description:
      "Vintage washed cotton t-shirt with a unique faded finish.",
  },

  {
    name: "Classic Blue Denim Jeans",
    category: "Jeans",
    price: 1499,
    originalPrice: 1999,
    description:
      "Classic slim fit blue denim jeans made with durable stretch fabric.",
  },
  {
    name: "Black Slim Fit Jeans",
    category: "Jeans",
    price: 1599,
    originalPrice: 2199,
    description:
      "Modern slim fit black jeans suitable for casual and semi-formal looks.",
  },
  {
    name: "Light Wash Straight Fit Jeans",
    category: "Jeans",
    price: 1699,
    originalPrice: 2299,
    description:
      "Comfortable straight fit jeans with a stylish light wash finish.",
  },
  {
    name: "Grey Relaxed Fit Denim",
    category: "Jeans",
    price: 1799,
    originalPrice: 2399,
    description:
      "Relaxed fit grey denim designed for maximum comfort and style.",
  },
  {
    name: "Dark Indigo Stretch Jeans",
    category: "Jeans",
    price: 1899,
    originalPrice: 2499,
    description:
      "Premium stretch denim jeans with a deep indigo finish.",
  },

  {
    name: "Classic Black Hoodie",
    category: "Hoodies",
    price: 1499,
    originalPrice: 1999,
    description:
      "Warm and comfortable black hoodie made from premium cotton blend fabric.",
  },
  {
    name: "Grey Oversized Hoodie",
    category: "Hoodies",
    price: 1699,
    originalPrice: 2199,
    description:
      "Oversized hoodie with soft fleece interior for ultimate comfort.",
  },
  {
    name: "Minimal White Hoodie",
    category: "Hoodies",
    price: 1599,
    originalPrice: 2099,
    description:
      "Clean minimal white hoodie perfect for everyday casual wear.",
  },
  {
    name: "Streetwear Graphic Hoodie",
    category: "Hoodies",
    price: 1899,
    originalPrice: 2499,
    description:
      "Bold graphic hoodie inspired by modern streetwear culture.",
  },
  {
    name: "Olive Green Pullover Hoodie",
    category: "Hoodies",
    price: 1799,
    originalPrice: 2299,
    description:
      "Premium olive green hoodie with adjustable drawstrings and kangaroo pocket.",
  },

  {
    name: "Classic White Sneakers",
    category: "Shoes",
    price: 2499,
    originalPrice: 3299,
    description:
      "Versatile white sneakers designed for comfort and everyday style.",
  },
  {
    name: "Black Running Shoes",
    category: "Shoes",
    price: 2999,
    originalPrice: 3999,
    description:
      "Lightweight running shoes with cushioned sole and breathable upper.",
  },
  {
    name: "High Top Street Sneakers",
    category: "Shoes",
    price: 3499,
    originalPrice: 4499,
    description:
      "Stylish high-top sneakers inspired by contemporary streetwear.",
  },
  {
    name: "Casual Canvas Shoes",
    category: "Shoes",
    price: 1999,
    originalPrice: 2699,
    description:
      "Classic canvas shoes suitable for everyday casual outfits.",
  },
  {
    name: "Minimal Leather Sneakers",
    category: "Shoes",
    price: 3999,
    originalPrice: 4999,
    description:
      "Premium leather sneakers with a clean and minimal design.",
  },

  {
    name: "Classic Black Jacket",
    category: "Jackets",
    price: 2499,
    originalPrice: 3299,
    description:
      "Stylish black jacket designed for modern casual outfits.",
  },
  {
    name: "Denim Blue Jacket",
    category: "Jackets",
    price: 2799,
    originalPrice: 3699,
    description:
      "Classic denim jacket with durable construction and timeless style.",
  },
  {
    name: "Olive Bomber Jacket",
    category: "Jackets",
    price: 2999,
    originalPrice: 3999,
    description:
      "Modern bomber jacket with lightweight insulation and stylish fit.",
  },
  {
    name: "Brown Leather Jacket",
    category: "Jackets",
    price: 4999,
    originalPrice: 6499,
    description:
      "Premium leather jacket with a classic silhouette and detailed finish.",
  },
  {
    name: "Puffer Winter Jacket",
    category: "Jackets",
    price: 3999,
    originalPrice: 5499,
    description:
      "Warm puffer jacket designed to provide comfort during cold weather.",
  },
];

// Generate additional products
const colors = [
  "Black",
  "White",
  "Grey",
  "Blue",
  "Red",
  "Green",
  "Beige",
  "Brown",
];

const productTypes = [
  "Oversized T-Shirt",
  "Cotton Shirt",
  "Casual Hoodie",
  "Slim Fit Jeans",
  "Streetwear Jacket",
  "Cargo Pants",
  "Sweatshirt",
  "Polo T-Shirt",
];

const categoryMap = {
  "Oversized T-Shirt": "T-Shirts",
  "Cotton Shirt": "Shirts",
  "Casual Hoodie": "Hoodies",
  "Slim Fit Jeans": "Jeans",
  "Streetwear Jacket": "Jackets",
  "Cargo Pants": "Pants",
  Sweatshirt: "Sweatshirts",
  "Polo T-Shirt": "T-Shirts",
};

for (let i = products.length; i < 100; i++) {
  const color = colors[i % colors.length];
  const type = productTypes[i % productTypes.length];

  const price = Math.floor(Math.random() * 3000) + 599;

  products.push({
    name: `${color} Premium ${type}`,
    category: categoryMap[type],
    price,
    originalPrice: price + Math.floor(Math.random() * 1000) + 300,
    description: `Premium ${color.toLowerCase()} ${type.toLowerCase()} designed with high quality materials for comfort and everyday style.`,
  });
}

const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const seedProducts = async () => {
  try {
    await connectDB();

    const categories = await Category.find();

    if (!categories.length) {
      console.log("No categories found. Please seed categories first.");
      process.exit(1);
    }

    const categoryLookup = {};

    categories.forEach((category) => {
      categoryLookup[category.name.toLowerCase()] = category._id;
    });

    const formattedProducts = products.map((product, index) => {
      const categoryId =
        categoryLookup[product.category.toLowerCase()];

      if (!categoryId) {
        console.log(
          `Category not found: ${product.category}`
        );
      }

      return {
        name: product.name,
        slug: `${slugify(product.name)}-${index + 1}`,
        description: product.description,
        category: categoryId,
        price: product.price,
        originalPrice: product.originalPrice,

        images: [
          {
            url: `https://placehold.co/600x800?text=${encodeURIComponent(
              product.name
            )}`,
            alt: product.name,
          },
        ],

        isActive: true,

        isFeatured: index % 10 === 0,
      };
    });

    await Product.deleteMany({});

    await Product.insertMany(formattedProducts);

    console.log(
      `Successfully seeded ${formattedProducts.length} products`
    );

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedProducts();