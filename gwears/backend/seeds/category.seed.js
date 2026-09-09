import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Category from "../models/category.model.js";

dotenv.config({ path: "../.env" });

const categories = [
    // ===============================
    // CLOTHING
    // ===============================

    {
        name: "T-Shirts",
        slug: "t-shirts",
        group: "clothing",
        description:
            "Comfortable and stylish t-shirts for everyday wear.",
        image: {
            url: "https://placehold.co/600x600?text=T-Shirts",
            alt: "T-Shirts Collection",
        },
        isActive: true,
    },

    {
        name: "Shirts",
        slug: "shirts",
        group: "clothing",
        description:
            "Casual and formal shirts for every occasion.",
        image: {
            url: "https://placehold.co/600x600?text=Shirts",
            alt: "Shirts Collection",
        },
        isActive: true,
    },

    {
        name: "Hoodies",
        slug: "hoodies",
        group: "clothing",
        description:
            "Warm, comfortable and stylish hoodies.",
        image: {
            url: "https://placehold.co/600x600?text=Hoodies",
            alt: "Hoodies Collection",
        },
        isActive: true,
    },

    {
        name: "Jeans",
        slug: "jeans",
        group: "clothing",
        description:
            "Premium denim jeans with modern fits.",
        image: {
            url: "https://placehold.co/600x600?text=Jeans",
            alt: "Jeans Collection",
        },
        isActive: true,
    },

    {
        name: "Jackets",
        slug: "jackets",
        group: "clothing",
        description:
            "Stylish jackets for every season.",
        image: {
            url: "https://placehold.co/600x600?text=Jackets",
            alt: "Jackets Collection",
        },
        isActive: true,
    },

    {
        name: "Pants",
        slug: "pants",
        group: "clothing",
        description:
            "Modern pants and trousers for everyday style.",
        image: {
            url: "https://placehold.co/600x600?text=Pants",
            alt: "Pants Collection",
        },
        isActive: true,
    },

    {
        name: "Sweatshirts",
        slug: "sweatshirts",
        group: "clothing",
        description:
            "Comfortable sweatshirts with modern designs.",
        image: {
            url: "https://placehold.co/600x600?text=Sweatshirts",
            alt: "Sweatshirts Collection",
        },
        isActive: true,
    },

    {
        name: "Track Suits",
        slug: "track-suits",
        group: "clothing",
        description:
            "Comfortable and versatile track suits for an active lifestyle.",
        image: {
            url: "https://placehold.co/600x600?text=Track+Suits",
            alt: "Track Suits Collection",
        },
        isActive: true,
    },


    // ===============================
    // FOOTWEAR
    // ===============================

    {
        name: "Shoes",
        slug: "shoes",
        group: "footwear",
        description:
            "Comfortable and fashionable footwear for every occasion.",
        image: {
            url: "https://placehold.co/600x600?text=Shoes",
            alt: "Shoes Collection",
        },
        isActive: true,
    },

    {
        name: "Slippers",
        slug: "slippers",
        group: "footwear",
        description:
            "Comfortable slippers for everyday use.",
        image: {
            url: "https://placehold.co/600x600?text=Slippers",
            alt: "Slippers Collection",
        },
        isActive: true,
    },


    // ===============================
    // ACCESSORIES
    // ===============================

    {
        name: "Caps",
        slug: "caps",
        group: "accessories",
        description:
            "Stylish caps to complete your everyday look.",
        image: {
            url: "https://placehold.co/600x600?text=Caps",
            alt: "Caps Collection",
        },
        isActive: true,
    },
];


const seedCategories = async () => {
    try {
        await connectDB();

        // Completely recreate category data
        await Category.deleteMany({});

        await Category.insertMany(categories);

        console.log(
            `Successfully seeded ${categories.length} categories`
        );

        process.exit(0);

    } catch (error) {

        console.error(
            "Category seeding failed:",
            error.message
        );

        process.exit(1);
    }
};


seedCategories();