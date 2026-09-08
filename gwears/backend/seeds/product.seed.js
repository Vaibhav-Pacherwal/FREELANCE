import dotenv from "dotenv";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import connectDB from "../config/db.js";

dotenv.config({ path: "../.env" });

const products = [
  {
    name: "Classic Black Oversized T-Shirt",
    category: "T-Shirts",
    description:
      "Premium cotton oversized t-shirt with a relaxed fit for everyday comfort.",
    price: 799,
    originalPrice: 999,
    colors: ["Black"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "Essential White Cotton T-Shirt",
    category: "T-Shirts",
    description:
      "Soft breathable cotton t-shirt designed for a clean and minimal everyday look.",
    price: 599,
    originalPrice: 799,
    colors: ["White"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "Urban Graphic Print T-Shirt",
    category: "T-Shirts",
    description:
      "Modern graphic print t-shirt with premium fabric and comfortable fit.",
    price: 899,
    originalPrice: 1199,
    colors: ["Black", "White"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "Minimal Beige Oversized Tee",
    category: "T-Shirts",
    description:
      "Minimal beige oversized t-shirt perfect for casual streetwear outfits.",
    price: 799,
    originalPrice: 999,
    colors: ["Beige"],
    sizes: ["M", "L", "XL"],
  },
  {
    name: "Vintage Washed Black T-Shirt",
    category: "T-Shirts",
    description:
      "Vintage washed cotton t-shirt with a unique faded finish.",
    price: 999,
    originalPrice: 1299,
    colors: ["Black", "Grey"],
    sizes: ["S", "M", "L", "XL"],
  },

  {
    name: "Classic Blue Denim Jeans",
    category: "Jeans",
    description:
      "Classic slim fit blue denim jeans made with durable stretch fabric.",
    price: 1499,
    originalPrice: 1999,
    colors: ["Blue"],
    sizes: ["30", "32", "34", "36"],
  },
  {
    name: "Black Slim Fit Jeans",
    category: "Jeans",
    description:
      "Modern slim fit black jeans suitable for casual and semi-formal looks.",
    price: 1599,
    originalPrice: 2199,
    colors: ["Black"],
    sizes: ["30", "32", "34", "36"],
  },
  {
    name: "Light Wash Straight Fit Jeans",
    category: "Jeans",
    description:
      "Comfortable straight fit jeans with a stylish light wash finish.",
    price: 1699,
    originalPrice: 2299,
    colors: ["Blue"],
    sizes: ["30", "32", "34", "36"],
  },
  {
    name: "Grey Relaxed Fit Denim",
    category: "Jeans",
    description:
      "Relaxed fit grey denim designed for maximum comfort and style.",
    price: 1799,
    originalPrice: 2399,
    colors: ["Grey"],
    sizes: ["30", "32", "34", "36"],
  },
  {
    name: "Dark Indigo Stretch Jeans",
    category: "Jeans",
    description:
      "Premium stretch denim jeans with a deep indigo finish.",
    price: 1899,
    originalPrice: 2499,
    colors: ["Blue"],
    sizes: ["30", "32", "34", "36"],
  },

  {
    name: "Classic Black Hoodie",
    category: "Hoodies",
    description:
      "Warm and comfortable black hoodie made from premium cotton blend fabric.",
    price: 1499,
    originalPrice: 1999,
    colors: ["Black"],
    sizes: ["M", "L", "XL", "XXL"],
  },
  {
    name: "Grey Oversized Hoodie",
    category: "Hoodies",
    description:
      "Oversized hoodie with soft fleece interior for ultimate comfort.",
    price: 1699,
    originalPrice: 2199,
    colors: ["Grey"],
    sizes: ["M", "L", "XL", "XXL"],
  },
  {
    name: "Minimal White Hoodie",
    category: "Hoodies",
    description:
      "Clean minimal white hoodie perfect for everyday casual wear.",
    price: 1599,
    originalPrice: 2099,
    colors: ["White"],
    sizes: ["M", "L", "XL", "XXL"],
  },
  {
    name: "Streetwear Graphic Hoodie",
    category: "Hoodies",
    description:
      "Bold graphic hoodie inspired by modern streetwear culture.",
    price: 1899,
    originalPrice: 2499,
    colors: ["Black", "White"],
    sizes: ["M", "L", "XL", "XXL"],
  },
  {
    name: "Olive Green Pullover Hoodie",
    category: "Hoodies",
    description:
      "Premium olive green hoodie with adjustable drawstrings and kangaroo pocket.",
    price: 1799,
    originalPrice: 2299,
    colors: ["Green"],
    sizes: ["M", "L", "XL", "XXL"],
  },

  {
    name: "Classic White Sneakers",
    category: "Shoes",
    description:
      "Versatile white sneakers designed for comfort and everyday style.",
    price: 2499,
    originalPrice: 3299,
    colors: ["White"],
    sizes: ["7", "8", "9", "10", "11"],
  },
  {
    name: "Black Running Shoes",
    category: "Shoes",
    description:
      "Lightweight running shoes with cushioned sole and breathable upper.",
    price: 2999,
    originalPrice: 3999,
    colors: ["Black"],
    sizes: ["7", "8", "9", "10", "11"],
  },
  {
    name: "High Top Street Sneakers",
    category: "Shoes",
    description:
      "Stylish high-top sneakers inspired by contemporary streetwear.",
    price: 3499,
    originalPrice: 4499,
    colors: ["Black", "White"],
    sizes: ["7", "8", "9", "10", "11"],
  },
  {
    name: "Casual Canvas Shoes",
    category: "Shoes",
    description:
      "Classic canvas shoes suitable for everyday casual outfits.",
    price: 1999,
    originalPrice: 2699,
    colors: ["Black", "White"],
    sizes: ["7", "8", "9", "10"],
  },
  {
    name: "Minimal Leather Sneakers",
    category: "Shoes",
    description:
      "Premium leather sneakers with a clean and minimal design.",
    price: 3999,
    originalPrice: 4999,
    colors: ["White", "Black"],
    sizes: ["7", "8", "9", "10", "11"],
  },

  {
    name: "Classic Black Jacket",
    category: "Jackets",
    description:
      "Stylish black jacket designed for modern casual outfits.",
    price: 2499,
    originalPrice: 3299,
    colors: ["Black"],
    sizes: ["M", "L", "XL", "XXL"],
  },
  {
    name: "Denim Blue Jacket",
    category: "Jackets",
    description:
      "Classic denim jacket with durable construction and timeless style.",
    price: 2799,
    originalPrice: 3699,
    colors: ["Blue"],
    sizes: ["M", "L", "XL", "XXL"],
  },
  {
    name: "Olive Bomber Jacket",
    category: "Jackets",
    description:
      "Modern bomber jacket with lightweight insulation and stylish fit.",
    price: 2999,
    originalPrice: 3999,
    colors: ["Green"],
    sizes: ["M", "L", "XL", "XXL"],
  },
  {
    name: "Brown Leather Jacket",
    category: "Jackets",
    description:
      "Premium leather jacket with a classic silhouette and detailed finish.",
    price: 4999,
    originalPrice: 6499,
    colors: ["Brown"],
    sizes: ["M", "L", "XL", "XXL"],
  },
  {
    name: "Puffer Winter Jacket",
    category: "Jackets",
    description:
      "Warm puffer jacket designed to provide comfort during cold weather.",
    price: 3999,
    originalPrice: 5499,
    colors: ["Black", "Grey"],
    sizes: ["M", "L", "XL", "XXL"],
  },
];

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

const sizeMap = {
  "Oversized T-Shirt": ["S", "M", "L", "XL"],
  "Cotton Shirt": ["M", "L", "XL", "XXL"],
  "Casual Hoodie": ["M", "L", "XL", "XXL"],
  "Slim Fit Jeans": ["30", "32", "34", "36"],
  "Streetwear Jacket": ["M", "L", "XL", "XXL"],
  "Cargo Pants": ["30", "32", "34", "36"],
  Sweatshirt: ["M", "L", "XL", "XXL"],
  "Polo T-Shirt": ["S", "M", "L", "XL"],
};

for (let i = products.length; i < 100; i++) {
  const color = colors[i % colors.length];
  const type = productTypes[i % productTypes.length];

  const price = Math.floor(Math.random() * 3000) + 599;

  products.push({
    name: `${color} Premium ${type}`,
    category: categoryMap[type],

    price,
    originalPrice:
      price + Math.floor(Math.random() * 1000) + 300,

    description:
      `Premium ${color.toLowerCase()} ${type.toLowerCase()} designed with high quality materials for comfort and everyday style.`,

    colors: [color],
    sizes: sizeMap[type],
  });
}

const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const generateVariants = (product, index) => {
  const variants = [];

  for (const color of product.colors) {
    for (const size of product.sizes) {
      variants.push({
        sku: `${slugify(product.name)}-${slugify(color)}-${slugify(size)}-${index + 1}`,

        attributes: [
          {
            name: "Color",
            value: color,
          },
          {
            name: "Size",
            value: size,
          },
        ],

        price: product.price,

        originalPrice: product.originalPrice,

        // Random stock between 5 and 25
        stock: Math.floor(Math.random() * 21) + 5,

        isActive: true,
      });
    }
  }

  return variants;
};

const seedProducts = async () => {
  try {
    await connectDB();

    const categories = await Category.find();

    if (!categories.length) {
      console.log(
        "No categories found. Please seed categories first."
      );

      process.exit(1);
    }

    const categoryLookup = {};

    categories.forEach((category) => {
      categoryLookup[category.name.toLowerCase()] =
        category._id;
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

        options: [
          {
            name: "Color",
            values: product.colors,
          },
          {
            name: "Size",
            values: product.sizes,
          },
        ],

        variants: generateVariants(product, index),

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