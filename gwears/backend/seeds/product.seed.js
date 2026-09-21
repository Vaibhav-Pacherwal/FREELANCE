import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import connectDB from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Helper: URL-friendly slug creation
const slugify = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
};

// Normalize category name for matching (e.g., "Track Suits" matches "Tracksuits")
const normalizeCategory = (name) => {
    return String(name || "").toLowerCase().replace(/[\s\-_]+/g, "");
};

// =====================================================
// 30 SAMPLE GUPTA WEARS PRODUCTS
// 10 categories x 3 realistic products
// Reusing the 10 photos from backend/sample_products/
// =====================================================

const sampleProducts = [
    // -------------------------------------------------
    // 1. SHIRTS
    // -------------------------------------------------
    {
        name: "Gupta Wears Classic Cotton Piqué Polo Shirt",
        category: "Shirts",
        description: "Refined polo shirt tailored from breathable cotton piqué knit, featuring a structured collar, two-button placket, and pearlized buttons for a versatile smart-casual look.",
        image: "Cotton Piqué Polo.avif",
        price: 1199,
        originalPrice: 1599,
        colors: ["Navy", "White", "Black"],
        sizes: ["M", "L", "XL"],
        isFeatured: true,
    },
    {
        name: "Gupta Wears Baroque Print Casual Shirt",
        category: "Shirts",
        description: "Statement casual shirt showcasing an ornate heritage baroque pattern printed on lightweight cotton fabric, cut in a modern relaxed drape perfect for evenings.",
        image: "Barocco cotton T-shirt.webp",
        price: 1499,
        originalPrice: 1999,
        colors: ["Black/Gold", "Monochrome"],
        sizes: ["S", "M", "L", "XL"],
        isFeatured: false,
    },
    {
        name: "Gupta Wears Urban Utility Overshirt",
        category: "Shirts",
        description: "Durable cotton-nylon blend overshirt featuring twin bellows chest pockets, point collar, and reinforced stitching for effortless layering across seasons.",
        image: "cotton nylon blend jacket.jpg",
        price: 1699,
        originalPrice: 2299,
        colors: ["Olive", "Charcoal", "Beige"],
        sizes: ["M", "L", "XL"],
        isFeatured: false,
    },

    // -------------------------------------------------
    // 2. T-SHIRTS
    // -------------------------------------------------
    {
        name: "Gupta Wears Barocco Signature Graphic Tee",
        category: "T-Shirts",
        description: "Signature streetwear t-shirt crafted from heavy 240 GSM combed cotton with high-definition baroque graphics, dropped shoulders, and a thick ribbed collar.",
        image: "Barocco cotton T-shirt.webp",
        price: 899,
        originalPrice: 1299,
        colors: ["Black", "White"],
        sizes: ["S", "M", "L", "XL"],
        isFeatured: true,
    },
    {
        name: "Gupta Wears Regular Fit Cotton-Jersey T-Shirt",
        category: "T-Shirts",
        description: "Timeless everyday crewneck tee constructed from premium 100% organic cotton jersey with minimal chest typography and superior color fastness.",
        image: "Printed Cotton-Jersey Regular T-Shirt.avif",
        price: 699,
        originalPrice: 999,
        colors: ["White", "Black", "Melange Grey"],
        sizes: ["S", "M", "L", "XL"],
        isFeatured: false,
    },
    {
        name: "Gupta Wears Relaxed Fit Vintage Wash Tee",
        category: "T-Shirts",
        description: "Relaxed fit vintage tee featuring an artisanal garment-dyed wash for a lived-in texture, soft hand-feel, and effortless relaxed streetwear silhouette.",
        image: "Relaxed Fit Printed T-shirt.avif",
        price: 799,
        originalPrice: 1099,
        colors: ["Washed Grey", "Faded Black", "Sand"],
        sizes: ["M", "L", "XL", "XXL"],
        isFeatured: false,
    },

    // -------------------------------------------------
    // 3. JEANS
    // -------------------------------------------------
    {
        name: "Gupta Wears Classic Indigo Denim Jeans",
        category: "Jeans",
        description: "Classic 5-pocket jeans forged from 13.5 oz authentic ring-spun denim with 1% elastane for subtle stretch, tailored in a timeless straight leg cut.",
        image: "demin jeans.avif",
        price: 1899,
        originalPrice: 2499,
        colors: ["Indigo Blue", "Dark Stone Wash"],
        sizes: ["30", "32", "34", "36"],
        isFeatured: true,
    },
    {
        name: "Gupta Wears Loose Fit Skate Jeans",
        category: "Jeans",
        description: "90s-inspired loose fit skate denim featuring a roomy leg, comfortable mid-rise waist, heavy-duty metal rivets, and reinforced belt loops.",
        image: "loose fit jeans.jpg",
        price: 1999,
        originalPrice: 2699,
        colors: ["Light Blue", "Vintage Tint"],
        sizes: ["30", "32", "34", "36"],
        isFeatured: false,
    },
    {
        name: "Gupta Wears Distressed Vintage Straight Jeans",
        category: "Jeans",
        description: "Hand-finished straight leg denim jeans with artisanal distressed abrasions, subtle whiskering, and custom branded copper hardware.",
        image: "demin jeans.avif",
        price: 2199,
        originalPrice: 2899,
        colors: ["Medium Blue", "Washed Charcoal"],
        sizes: ["30", "32", "34", "36"],
        isFeatured: false,
    },

    // -------------------------------------------------
    // 4. PANTS
    // -------------------------------------------------
    {
        name: "Gupta Wears Relaxed Chino Pants",
        category: "Pants",
        description: "Modern casual chino trousers made with premium washed cotton twill, featuring front slant pockets, welt rear pockets, and a neat tapered leg.",
        image: "loose fit jeans.jpg",
        price: 1599,
        originalPrice: 2199,
        colors: ["Khaki", "Navy", "Olive"],
        sizes: ["30", "32", "34", "36"],
        isFeatured: false,
    },
    {
        name: "Gupta Wears Utility Cargo Trousers",
        category: "Pants",
        description: "Heavyweight cotton utility cargo pants designed with articulated knee panels, generous bellow cargo pockets, and adjustable toggle drawstring hems.",
        image: "demin jeans.avif",
        price: 1799,
        originalPrice: 2399,
        colors: ["Matte Black", "Army Green"],
        sizes: ["30", "32", "34", "36"],
        isFeatured: true,
    },
    {
        name: "Gupta Wears Minimalist Everyday Trousers",
        category: "Pants",
        description: "Sleek smart-casual trousers crafted from stretch-infused twill with an elasticated waistband and drawstring for seamless desk-to-dinner comfort.",
        image: "loose fit jeans.jpg",
        price: 1699,
        originalPrice: 2299,
        colors: ["Charcoal Grey", "Black"],
        sizes: ["30", "32", "34", "36"],
        isFeatured: false,
    },

    // -------------------------------------------------
    // 5. HOODIES
    // -------------------------------------------------
    {
        name: "Gupta Wears Zero Degree Oversized Hoodie",
        category: "Hoodies",
        description: "Ultra-heavyweight 420 GSM fleece hoodie built for cold climates, featuring double-needle construction, a double-lined structured hood, and oversized silhouette.",
        image: "Zero Degree Oversized Hoodie.avif",
        price: 2199,
        originalPrice: 2999,
        colors: ["Washed Black", "Heather Grey", "Cream"],
        sizes: ["S", "M", "L", "XL"],
        isFeatured: true,
    },
    {
        name: "Gupta Wears Cotton Fleece Pullover Hoodie",
        category: "Hoodies",
        description: "Plush brushed fleece hoodie with classic pouch kangaroo pocket, flat-woven drawcords, and thick 2x2 ribbed cuffs and hem for everyday warmth.",
        image: "cotton fleece oversize hoodie.jpg",
        price: 1999,
        originalPrice: 2699,
        colors: ["Dusty Sage", "Black", "Mocha Brown"],
        sizes: ["S", "M", "L", "XL"],
        isFeatured: false,
    },
    {
        name: "Gupta Wears Street Graphic Oversized Hoodie",
        category: "Hoodies",
        description: "Contemporary streetwear hoodie showcasing high-density tonal graphics on durable fleece, designed with dropped shoulders and a boxy relaxed fit.",
        image: "Zero Degree Oversized Hoodie.avif",
        price: 2299,
        originalPrice: 3199,
        colors: ["Onyx Black", "Off White"],
        sizes: ["M", "L", "XL"],
        isFeatured: false,
    },

    // -------------------------------------------------
    // 6. JACKETS
    // -------------------------------------------------
    {
        name: "Gupta Wears Cotton-Nylon Windbreaker Jacket",
        category: "Jackets",
        description: "Lightweight weather-resistant zip jacket engineered from technical cotton-nylon with high funnel collar, storm flap, and breathable interior mesh lining.",
        image: "cotton nylon blend jacket.jpg",
        price: 2799,
        originalPrice: 3799,
        colors: ["Matte Black", "Olive Green", "Desert Sand"],
        sizes: ["M", "L", "XL"],
        isFeatured: true,
    },
    {
        name: "Gupta Wears Classic Biker Leather Jacket",
        category: "Jackets",
        description: "Heritage biker jacket crafted from rich textured vegan leather, styled with an asymmetrical front zipper, notch lapels, and quilted diamond shoulder padding.",
        image: "leather jacket.jpg",
        price: 4499,
        originalPrice: 5999,
        colors: ["Classic Black", "Espresso Brown"],
        sizes: ["S", "M", "L", "XL"],
        isFeatured: true,
    },
    {
        name: "Gupta Wears Minimalist Bomber Jacket",
        category: "Jackets",
        description: "Sleek zip-through bomber jacket with tonal ribbed baseball collar, side slip pockets, utility sleeve pocket, and smooth satin interior lining.",
        image: "cotton nylon blend jacket.jpg",
        price: 2999,
        originalPrice: 3999,
        colors: ["Navy Blue", "Dark Olive", "Black"],
        sizes: ["M", "L", "XL"],
        isFeatured: false,
    },

    // -------------------------------------------------
    // 7. TRACKSUITS
    // -------------------------------------------------
    {
        name: "Gupta Wears Fleece Lounge Tracksuit",
        category: "Tracksuits",
        description: "Premium two-piece lounge tracksuit including a pullover fleece top and matching tapered joggers with deep zippered pockets and ribbed ankles.",
        image: "cotton fleece oversize hoodie.jpg",
        price: 3199,
        originalPrice: 4299,
        colors: ["Charcoal", "Oatmeal Melange", "Black"],
        sizes: ["S", "M", "L", "XL"],
        isFeatured: false,
    },
    {
        name: "Gupta Wears Athletic Street Tracksuit",
        category: "Tracksuits",
        description: "Athletic-cut tracksuit featuring color-block chevron side stripes, full-zip funnel jacket, and performance joggers with an elastic drawstring waist.",
        image: "Zero Degree Oversized Hoodie.avif",
        price: 3499,
        originalPrice: 4699,
        colors: ["Black/White", "Grey/Black"],
        sizes: ["M", "L", "XL"],
        isFeatured: true,
    },
    {
        name: "Gupta Wears Heritage Active Tracksuit",
        category: "Tracksuits",
        description: "Technical windproof tracksuit designed for training or city movement, finished with reflective accents, zip ankles, and durable weather coating.",
        image: "cotton nylon blend jacket.jpg",
        price: 3299,
        originalPrice: 4499,
        colors: ["Navy/Teal", "Burgundy/Navy"],
        sizes: ["M", "L", "XL"],
        isFeatured: false,
    },

    // -------------------------------------------------
    // 8. SHOES
    // -------------------------------------------------
    {
        name: "Gupta Wears Low-Top Minimalist Sneakers",
        category: "Shoes",
        description: "Crisp low-top court sneakers featuring supple micro-leather uppers, breathable perforation details, and a cushioned vulcanized rubber cupsole.",
        image: "cotton nylon blend jacket.jpg",
        price: 2499,
        originalPrice: 3499,
        colors: ["Triple White", "White/Gum", "Black/White"],
        sizes: ["7", "8", "9", "10", "11"],
        isFeatured: true,
    },
    {
        name: "Gupta Wears Urban Leather Street Boots",
        category: "Shoes",
        description: "Rugged urban lace-up ankle boots crafted from full-grain textured leather with reinforced toe caps and aggressive lugged commando outsoles.",
        image: "leather jacket.jpg",
        price: 3499,
        originalPrice: 4999,
        colors: ["Vintage Black", "Saddle Brown"],
        sizes: ["8", "9", "10", "11"],
        isFeatured: false,
    },
    {
        name: "Gupta Wears Retro Runner Casual Trainers",
        category: "Shoes",
        description: "Athletic lifestyle trainers engineered with mesh underlays, suede reinforcements, responsive EVA midsole foam, and grippy waffle tread.",
        image: "Cotton Piqué Polo.avif",
        price: 2799,
        originalPrice: 3899,
        colors: ["Grey/White", "Navy/Beige"],
        sizes: ["7", "8", "9", "10"],
        isFeatured: false,
    },

    // -------------------------------------------------
    // 9. SLIPPERS
    // -------------------------------------------------
    {
        name: "Gupta Wears Ergonomic Comfort Slide Slippers",
        category: "Slippers",
        description: "Ultra-cushioned injection-molded EVA slide sandals engineered with an anatomical contour footbed, arch support, and anti-slip wave traction.",
        image: "Relaxed Fit Printed T-shirt.avif",
        price: 799,
        originalPrice: 1199,
        colors: ["Matte Black", "Bone White", "Olive"],
        sizes: ["7", "8", "9", "10", "11"],
        isFeatured: false,
    },
    {
        name: "Gupta Wears Leather Comfort Dual-Strap Slippers",
        category: "Slippers",
        description: "Premium slide sandals with dual adjustable buckle straps in faux leather, set atop a suede-lined genuine cork-latex ergonomic footbed.",
        image: "leather jacket.jpg",
        price: 1199,
        originalPrice: 1699,
        colors: ["Tan Brown", "Dark Brown", "Black"],
        sizes: ["7", "8", "9", "10"],
        isFeatured: true,
    },
    {
        name: "Gupta Wears Casual Daily Flip-Flop Slippers",
        category: "Slippers",
        description: "Lightweight everyday thong slippers with comfortable woven canvas toe post straps, textured footbed patterning, and durable rubber sponge soles.",
        image: "Cotton Piqué Polo.avif",
        price: 599,
        originalPrice: 899,
        colors: ["Navy Blue", "Black", "Grey"],
        sizes: ["7", "8", "9", "10", "11"],
        isFeatured: false,
    },

    // -------------------------------------------------
    // 10. CAPS
    // -------------------------------------------------
    {
        name: "Gupta Wears Signature Embroidered Baseball Cap",
        category: "Caps",
        description: "Classic unstructured 6-panel dad cap constructed from 100% washed cotton twill, detailed with tone-on-tone embroidery and antique brass buckle closure.",
        image: "Printed Cotton-Jersey Regular T-Shirt.avif",
        price: 499,
        originalPrice: 799,
        colors: ["Black", "Washed Navy", "Khaki"],
        sizes: ["Free Size"],
        isFeatured: false,
    },
    {
        name: "Gupta Wears Vintage Corduroy Strapback Cap",
        category: "Caps",
        description: "Retro wide-wale cotton corduroy cap featuring embroidered breathability eyelets, pre-curved peak, and an adjustable genuine leather strap closure.",
        image: "Barocco cotton T-shirt.webp",
        price: 599,
        originalPrice: 899,
        colors: ["Rust Orange", "Forest Green", "Charcoal"],
        sizes: ["Free Size"],
        isFeatured: true,
    },
    {
        name: "Gupta Wears Streetwear Trucker Snapback Cap",
        category: "Caps",
        description: "Structured 5-panel trucker cap featuring a high-density foam front panel, breathable nylon mesh back, and an adjustable 7-hole snapback closure.",
        image: "leather jacket.jpg",
        price: 549,
        originalPrice: 849,
        colors: ["Black/White", "All Black"],
        sizes: ["Free Size"],
        isFeatured: false,
    },
];

// =====================================================
// GENERATE DETERMINISTIC VARIANTS
// =====================================================

const generateVariants = (product, baseSlug) => {
    const variants = [];
    let variantIndex = 1;

    for (const color of product.colors) {
        for (const size of product.sizes) {
            const colorSlug = slugify(color);
            const sizeSlug = slugify(size);
            const sku = `${baseSlug}-${colorSlug}-${sizeSlug}`.toUpperCase();

            // Deterministic stock calculation based on product name and variant index
            const stock = 15 + ((product.name.length * 7 + variantIndex * 3) % 25);

            variants.push({
                sku,
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
                stock,
                isActive: true,
            });

            variantIndex++;
        }
    }

    return variants;
};

// =====================================================
// SEED PRODUCTS EXECUTION
// Safe, idempotent upsert without deleting existing products
// =====================================================

export const seedProducts = async () => {
    try {
        await connectDB();

        // 1. Fetch active categories
        const categories = await Category.find({ isActive: true });
        if (!categories.length) {
            console.error("No active categories found in database. Please seed categories first.");
            process.exit(1);
        }

        // Build normalized category lookup map
        const categoryLookup = {};
        categories.forEach((cat) => {
            categoryLookup[normalizeCategory(cat.name)] = cat._id;
            categoryLookup[normalizeCategory(cat.slug)] = cat._id;
        });

        console.log(`Loaded ${categories.length} categories for product mapping.`);

        let insertedCount = 0;
        let updatedCount = 0;

        for (let i = 0; i < sampleProducts.length; i++) {
            const item = sampleProducts[i];
            const normCat = normalizeCategory(item.category);
            const categoryId = categoryLookup[normCat];

            if (!categoryId) {
                throw new Error(`Category not found for product "${item.name}" (category: "${item.category}")`);
            }

            const baseSlug = `gw-sample-${slugify(item.name)}`;

            const formattedProduct = {
                name: item.name,
                slug: baseSlug,
                description: item.description,
                category: categoryId,
                options: [
                    {
                        name: "Color",
                        values: item.colors,
                    },
                    {
                        name: "Size",
                        values: item.sizes,
                    },
                ],
                variants: generateVariants(item, baseSlug),
                images: [
                    {
                        url: `/sample_products/${item.image}`,
                        publicId: null,
                        alt: item.name,
                    },
                ],
                isActive: true,
                isFeatured: Boolean(item.isFeatured),
            };

            // SAFE IDEMPOTENT UPSERT: Never delete existing products, upsert by deterministic slug
            const existing = await Product.findOne({ slug: baseSlug });

            if (existing) {
                await Product.updateOne({ _id: existing._id }, { $set: formattedProduct });
                updatedCount++;
            } else {
                await Product.create(formattedProduct);
                insertedCount++;
            }
        }

        console.log("==================================================");
        console.log("SEEDING COMPLETED SUCCESSFULLY");
        console.log(`Inserted: ${insertedCount} new products`);
        console.log(`Updated:  ${updatedCount} existing sample products`);
        console.log(`Total 30 sample products are active in the database.`);
        console.log("Existing real products and other collections remain untouched.");
        console.log("==================================================");

        process.exit(0);
    } catch (error) {
        console.error("Product seeding failed:", error);
        process.exit(1);
    }
};

// Direct script execution
seedProducts();