import dotenv from "dotenv";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import connectDB from "../config/db.js";

dotenv.config({ path: "../.env" });


// =====================================================
// BASE PRODUCTS
// =====================================================

const products = [

    // =========================
    // T-SHIRTS
    // =========================

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


    // =========================
    // SHIRTS
    // =========================

    {
        name: "Classic White Casual Shirt",
        category: "Shirts",
        description:
            "Clean and versatile white shirt suitable for casual and semi-formal occasions.",
        price: 1199,
        originalPrice: 1599,
        colors: ["White"],
        sizes: ["M", "L", "XL", "XXL"],
    },

    {
        name: "Black Relaxed Fit Shirt",
        category: "Shirts",
        description:
            "Modern relaxed fit shirt with a clean silhouette.",
        price: 1299,
        originalPrice: 1699,
        colors: ["Black"],
        sizes: ["M", "L", "XL", "XXL"],
    },

    {
        name: "Beige Linen Style Shirt",
        category: "Shirts",
        description:
            "Lightweight beige shirt designed for a relaxed summer look.",
        price: 1399,
        originalPrice: 1799,
        colors: ["Beige"],
        sizes: ["M", "L", "XL", "XXL"],
    },


    // =========================
    // JEANS
    // =========================

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


    // =========================
    // HOODIES
    // =========================

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


    // =========================
    // SHOES
    // =========================

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


    // =========================
    // SLIPPERS
    // =========================

    {
        name: "Classic Black Slides",
        category: "Slippers",
        description:
            "Comfortable everyday slides with a clean minimal design.",
        price: 699,
        originalPrice: 999,
        colors: ["Black"],
        sizes: ["7", "8", "9", "10", "11"],
    },

    {
        name: "Comfort Grey Slides",
        category: "Slippers",
        description:
            "Soft and comfortable slides designed for everyday use.",
        price: 799,
        originalPrice: 1099,
        colors: ["Grey"],
        sizes: ["7", "8", "9", "10", "11"],
    },


    // =========================
    // JACKETS
    // =========================

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


    // =========================
    // PANTS
    // =========================

    {
        name: "Classic Black Cargo Pants",
        category: "Pants",
        description:
            "Relaxed cargo pants with multiple utility pockets.",
        price: 1399,
        originalPrice: 1899,
        colors: ["Black"],
        sizes: ["30", "32", "34", "36"],
    },

    {
        name: "Beige Relaxed Fit Pants",
        category: "Pants",
        description:
            "Modern relaxed fit pants designed for everyday comfort.",
        price: 1299,
        originalPrice: 1699,
        colors: ["Beige"],
        sizes: ["30", "32", "34", "36"],
    },


    // =========================
    // SWEATSHIRTS
    // =========================

    {
        name: "Classic Grey Sweatshirt",
        category: "Sweatshirts",
        description:
            "Comfortable everyday sweatshirt with a clean minimal design.",
        price: 1199,
        originalPrice: 1599,
        colors: ["Grey"],
        sizes: ["M", "L", "XL", "XXL"],
    },

    {
        name: "Black Minimal Sweatshirt",
        category: "Sweatshirts",
        description:
            "Minimal black sweatshirt made for effortless everyday styling.",
        price: 1299,
        originalPrice: 1699,
        colors: ["Black"],
        sizes: ["M", "L", "XL", "XXL"],
    },


    // =========================
    // TRACK SUITS
    // =========================

    {
        name: "Classic Black Track Suit",
        category: "Track Suits",
        description:
            "Comfortable two-piece track suit designed for casual and active wear.",
        price: 1999,
        originalPrice: 2699,
        colors: ["Black"],
        sizes: ["M", "L", "XL", "XXL"],
    },

    {
        name: "Grey Sport Track Suit",
        category: "Track Suits",
        description:
            "Modern grey track suit combining comfort and sporty style.",
        price: 2199,
        originalPrice: 2899,
        colors: ["Grey"],
        sizes: ["M", "L", "XL", "XXL"],
    },


    // =========================
    // CAPS
    // =========================

    {
        name: "Classic Black Cap",
        category: "Caps",
        description:
            "Minimal everyday cap with an adjustable fit.",
        price: 499,
        originalPrice: 699,
        colors: ["Black"],
        sizes: ["One Size"],
    },

    {
        name: "Beige Casual Cap",
        category: "Caps",
        description:
            "Classic beige cap designed to complement casual outfits.",
        price: 549,
        originalPrice: 749,
        colors: ["Beige"],
        sizes: ["One Size"],
    },
];


// =====================================================
// RANDOM PRODUCT GENERATION
// =====================================================

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
    {
        type: "Oversized T-Shirt",
        category: "T-Shirts",
        sizes: ["S", "M", "L", "XL"],
    },

    {
        type: "Cotton Shirt",
        category: "Shirts",
        sizes: ["M", "L", "XL", "XXL"],
    },

    {
        type: "Casual Hoodie",
        category: "Hoodies",
        sizes: ["M", "L", "XL", "XXL"],
    },

    {
        type: "Slim Fit Jeans",
        category: "Jeans",
        sizes: ["30", "32", "34", "36"],
    },

    {
        type: "Streetwear Jacket",
        category: "Jackets",
        sizes: ["M", "L", "XL", "XXL"],
    },

    {
        type: "Cargo Pants",
        category: "Pants",
        sizes: ["30", "32", "34", "36"],
    },

    {
        type: "Sweatshirt",
        category: "Sweatshirts",
        sizes: ["M", "L", "XL", "XXL"],
    },

    {
        type: "Polo T-Shirt",
        category: "T-Shirts",
        sizes: ["S", "M", "L", "XL"],
    },

    {
        type: "Track Suit",
        category: "Track Suits",
        sizes: ["M", "L", "XL", "XXL"],
    },

    {
        type: "Casual Shoes",
        category: "Shoes",
        sizes: ["7", "8", "9", "10", "11"],
    },

    {
        type: "Casual Slippers",
        category: "Slippers",
        sizes: ["7", "8", "9", "10", "11"],
    },

    {
        type: "Classic Cap",
        category: "Caps",
        sizes: ["One Size"],
    },
];


// Generate products until we have 100
for (
    let i = products.length;
    i < 100;
    i++
) {
    const color =
        colors[i % colors.length];

    const productType =
        productTypes[
            i % productTypes.length
        ];

    const price =
        Math.floor(
            Math.random() * 3000
        ) + 599;


    products.push({
        name:
            `${color} Premium ${productType.type}`,

        category:
            productType.category,

        price,

        originalPrice:
            price +
            Math.floor(
                Math.random() * 1000
            ) +
            300,

        description:
            `Premium ${color.toLowerCase()} ${productType.type.toLowerCase()} designed with high quality materials for comfort and everyday style.`,

        colors: [color],

        sizes:
            productType.sizes,
    });
}


// =====================================================
// SLUGIFY
// =====================================================

const slugify = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(
            /(^-|-$)/g,
            ""
        );
};


// =====================================================
// GENERATE VARIANTS
// =====================================================

const generateVariants = (
    product,
    index
) => {

    const variants = [];


    for (
        const color of product.colors
    ) {

        for (
            const size of product.sizes
        ) {

            variants.push({

                sku:
                    `${slugify(product.name)}-${slugify(color)}-${slugify(size)}-${index + 1}`,

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

                price:
                    product.price,

                originalPrice:
                    product.originalPrice,

                stock:
                    Math.floor(
                        Math.random() * 21
                    ) + 5,

                isActive: true,
            });
        }
    }


    return variants;
};


// =====================================================
// SEED PRODUCTS
// =====================================================

const seedProducts = async () => {

    try {

        await connectDB();


        // -----------------------------------------
        // Get categories
        // -----------------------------------------

        const categories =
            await Category.find({
                isActive: true,
            });


        if (!categories.length) {

            console.log(
                "No active categories found. Please seed categories first."
            );

            process.exit(1);
        }


        // -----------------------------------------
        // Create category lookup
        // -----------------------------------------

        const categoryLookup = {};


        categories.forEach(
            (category) => {

                categoryLookup[
                    category.name.toLowerCase()
                ] = category._id;

            }
        );


        // -----------------------------------------
        // Convert products
        // -----------------------------------------

        const formattedProducts =
            products.map(
                (product, index) => {

                    const categoryId =
                        categoryLookup[
                            product.category.toLowerCase()
                        ];


                    if (!categoryId) {

                        throw new Error(
                            `Category not found: ${product.category}`
                        );
                    }


                    return {

                        name:
                            product.name,

                        slug:
                            `${slugify(product.name)}-${index + 1}`,

                        description:
                            product.description,

                        category:
                            categoryId,

                        options: [

                            {
                                name: "Color",
                                values:
                                    product.colors,
                            },

                            {
                                name: "Size",
                                values:
                                    product.sizes,
                            },

                        ],

                        variants:
                            generateVariants(
                                product,
                                index
                            ),

                        images: [

                            {
                                url:
                                    `https://placehold.co/600x800?text=${encodeURIComponent(
                                        product.name
                                    )}`,

                                alt:
                                    product.name,
                            },

                        ],

                        isActive: true,

                        isFeatured:
                            index % 10 === 0,
                    };
                }
            );


        // -----------------------------------------
        // Delete existing products
        // -----------------------------------------

        await Product.deleteMany({});


        // -----------------------------------------
        // Insert new products
        // -----------------------------------------

        await Product.insertMany(
            formattedProducts
        );


        console.log(
            `Successfully seeded ${formattedProducts.length} products`
        );


        process.exit(0);

    } catch (error) {

        console.error(
            "Product seeding failed:",
            error
        );

        process.exit(1);
    }
};


seedProducts();