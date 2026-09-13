import uploadToCloudinary from "../utils/cloudinaryUpload.js";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import { deleteFromCloudinary } from "../utils/cloudinaryUpload.js";
import Offer from "../models/offer.model.js";
import {
    getActiveStoreOffers,
    getBestOfferForProduct,
} from "../utils/offerPricing.js";

const slugify = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
};

const parseJSON = (value, fallback = null) => {
    try {
        return typeof value === "string"
            ? JSON.parse(value)
            : value ?? fallback;
    } catch {
        return fallback;
    }
};

const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            options,
            variants,
            isFeatured,
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Product name is required",
            });
        }

        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category is required",
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one product image is required",
            });
        }

        if (req.files.length > 5) {
            return res.status(400).json({
                success: false,
                message: "Maximum 5 product images are allowed",
            });
        }

        const parsedOptions = parseJSON(options, []);
        const parsedVariants = parseJSON(variants, []);

        if (!Array.isArray(parsedOptions)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product options",
            });
        }

        if (
            !Array.isArray(parsedVariants) ||
            parsedVariants.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "At least one product variant is required",
            });
        }

        const skus = parsedVariants.map((variant) =>
            String(variant.sku || "").trim()
        );

        if (skus.some((sku) => !sku)) {
            return res.status(400).json({
                success: false,
                message: "Every variant must have a SKU",
            });
        }

        if (new Set(skus).size !== skus.length) {
            return res.status(400).json({
                success: false,
                message: "Variant SKUs must be unique",
            });
        }

        for (const variant of parsedVariants) {
            if (
                variant.price === undefined ||
                variant.price === null ||
                variant.price === "" ||
                Number(variant.price) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid price for SKU ${variant.sku}`,
                });
            }

            if (
                variant.stock === undefined ||
                variant.stock === null ||
                variant.stock === "" ||
                Number(variant.stock) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid stock for SKU ${variant.sku}`,
                });
            }

            if (
                variant.originalPrice !== null &&
                variant.originalPrice !== undefined &&
                variant.originalPrice !== "" &&
                Number(variant.originalPrice) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid original price for SKU ${variant.sku}`,
                });
            }

            if (!Array.isArray(variant.attributes)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid attributes for SKU ${variant.sku}`,
                });
            }
        }

        const uploadedImages = await Promise.all(
            req.files.map(async (file) => {
                const result = await uploadToCloudinary(file.buffer);

                return {
                    url: result.secure_url,
                    publicId: result.public_id,
                    alt: name.trim(),
                };
            })
        );

        const slug = slugify(name);

        const existingProduct = await Product.findOne({
            slug,
        });

        const finalSlug = existingProduct
            ? `${slug}-${Date.now()}`
            : slug;

        const product = await Product.create({
            name: name.trim(),

            slug: finalSlug,

            description:
                description?.trim() || "",

            category,

            options: parsedOptions,

            variants: parsedVariants.map((variant) => ({
                sku: String(variant.sku).trim(),

                attributes: variant.attributes.map(
                    (attribute) => ({
                        name: String(attribute.name).trim(),
                        value: String(attribute.value).trim(),
                    })
                ),

                price: Number(variant.price),

                originalPrice:
                    variant.originalPrice === null ||
                        variant.originalPrice === "" ||
                        variant.originalPrice === undefined
                        ? null
                        : Number(variant.originalPrice),

                stock: Number(variant.stock),

                isActive:
                    variant.isActive === false ||
                        variant.isActive === "false"
                        ? false
                        : true,
            })),

            images: uploadedImages,

            isActive: true,

            isFeatured:
                isFeatured === "true" ||
                isFeatured === true,
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });

    } catch (error) {
        console.error(
            "Create product error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create product",
            error: error.message,
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const {
            search = "",
            category,
            status,
            page = 1,
            limit = 10,
        } = req.query;

        const pageNumber = Math.max(Number(page), 1);
        const limitNumber = Math.min(
            Math.max(Number(limit), 1),
            100
        );

        const filter = {};

        if (search.trim()) {
            const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.name = {
                $regex: escapedSearch,
                $options: "i",
            };
        }

        if (category) {
            filter.category = category;
        }

        if (status === "active") {
            filter.isActive = true;
        }

        if (status === "inactive") {
            filter.isActive = false;
        }

        const skip = (pageNumber - 1) * limitNumber;

        const [products, totalProducts] = await Promise.all([
            Product.find(filter)
                .populate("category", "name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),

            Product.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(
            totalProducts / limitNumber
        );

        return res.status(200).json({
            success: true,
            products,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalProducts,
                limit: limitNumber,
                hasNextPage: pageNumber < totalPages,
                hasPreviousPage: pageNumber > 1,
            },
        });

    } catch (error) {
        console.error("Get products error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id)
            .populate("category", "name");

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        return res.status(200).json({
            success: true,
            product,
        });

    } catch (error) {
        console.error("Get product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch product",
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            description,
            category,
            options,
            variants,
            existingImages,
            isFeatured,
        } = req.body;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const parsedOptions = parseJSON(options, []);
        const parsedVariants = parseJSON(variants, []);

        if (!Array.isArray(parsedOptions)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product options",
            });
        }

        if (
            !Array.isArray(parsedVariants) ||
            parsedVariants.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "At least one product variant is required",
            });
        }

        const skus = parsedVariants.map((variant) =>
            String(variant.sku || "").trim()
        );

        if (skus.some((sku) => !sku)) {
            return res.status(400).json({
                success: false,
                message: "Every variant must have a SKU",
            });
        }

        if (new Set(skus).size !== skus.length) {
            return res.status(400).json({
                success: false,
                message: "Variant SKUs must be unique",
            });
        }

        // ----------------------------------------------
        // Validate variants
        // ----------------------------------------------

        for (const variant of parsedVariants) {

            if (
                variant.price === undefined ||
                variant.price === null ||
                variant.price === "" ||
                Number(variant.price) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid price for SKU ${variant.sku}`,
                });
            }

            if (
                variant.stock === undefined ||
                variant.stock === null ||
                variant.stock === "" ||
                Number(variant.stock) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid stock for SKU ${variant.sku}`,
                });
            }

            if (
                variant.originalPrice !== null &&
                variant.originalPrice !== undefined &&
                variant.originalPrice !== "" &&
                Number(variant.originalPrice) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid original price for SKU ${variant.sku}`,
                });
            }

            if (!Array.isArray(variant.attributes)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid attributes for SKU ${variant.sku}`,
                });
            }
        }

        // ----------------------------------------------
        // Existing images
        // ----------------------------------------------

        let imagesToKeep = [];

        if (existingImages) {
            imagesToKeep = parseJSON(
                existingImages,
                []
            );
        }

        if (!Array.isArray(imagesToKeep)) {
            return res.status(400).json({
                success: false,
                message: "Invalid existing images",
            });
        }

        // Maximum 5 images

        const newImageCount =
            req.files?.length || 0;

        if (
            imagesToKeep.length +
            newImageCount >
            5
        ) {
            return res.status(400).json({
                success: false,
                message: "Maximum 5 images allowed",
            });
        }

        // At least one image

        if (
            imagesToKeep.length +
            newImageCount ===
            0
        ) {
            return res.status(400).json({
                success: false,
                message: "At least one product image is required",
            });
        }

        // ----------------------------------------------
        // Delete removed Cloudinary images
        // ----------------------------------------------

        const keptPublicIds = new Set(
            imagesToKeep
                .map((image) => image.publicId)
                .filter(Boolean)
        );

        const removedImages =
            product.images.filter(
                (image) =>
                    image.publicId &&
                    !keptPublicIds.has(
                        image.publicId
                    )
            );

        await Promise.all(
            removedImages.map((image) =>
                deleteFromCloudinary(
                    image.publicId
                )
            )
        );

        // ----------------------------------------------
        // Upload new images
        // ----------------------------------------------

        let uploadedImages = [];

        if (
            req.files &&
            req.files.length > 0
        ) {
            uploadedImages =
                await Promise.all(
                    req.files.map(
                        async (file) => {

                            const result =
                                await uploadToCloudinary(
                                    file.buffer
                                );

                            return {
                                url: result.secure_url,

                                publicId:
                                    result.public_id,

                                alt:
                                    name?.trim() ||
                                    product.name,
                            };
                        }
                    )
                );
        }

        // ----------------------------------------------
        // Slug
        // ----------------------------------------------

        let slug = product.slug;

        if (
            name &&
            name.trim() !== product.name
        ) {
            const newSlug =
                slugify(name);

            const slugExists =
                await Product.findOne({
                    slug: newSlug,
                    _id: {
                        $ne: id,
                    },
                });

            slug = slugExists
                ? `${newSlug}-${Date.now()}`
                : newSlug;
        }

        // ----------------------------------------------
        // Update basic information
        // ----------------------------------------------

        product.name =
            name?.trim() ||
            product.name;

        product.slug = slug;

        product.description =
            description?.trim() ??
            product.description;

        product.category =
            category ||
            product.category;

        // ----------------------------------------------
        // Update options
        // ----------------------------------------------

        product.options =
            parsedOptions;

        // ----------------------------------------------
        // Update variants
        // ----------------------------------------------

        product.variants =
            parsedVariants.map(
                (variant) => ({
                    sku:
                        String(
                            variant.sku
                        ).trim(),

                    attributes:
                        variant.attributes.map(
                            (attribute) => ({
                                name:
                                    String(
                                        attribute.name
                                    ).trim(),

                                value:
                                    String(
                                        attribute.value
                                    ).trim(),
                            })
                        ),

                    price:
                        Number(
                            variant.price
                        ),

                    originalPrice:
                        variant.originalPrice ===
                            null ||
                            variant.originalPrice ===
                            "" ||
                            variant.originalPrice ===
                            undefined
                            ? null
                            : Number(
                                variant.originalPrice
                            ),

                    stock:
                        Number(
                            variant.stock
                        ),

                    // IMPORTANT:
                    // Preserve individual
                    // variant status.
                    isActive:
                        variant.isActive ===
                            false ||
                            variant.isActive ===
                            "false"
                            ? false
                            : true,
                })
            );

        // ----------------------------------------------
        // Update images
        // ----------------------------------------------

        product.images = [
            ...imagesToKeep,
            ...uploadedImages,
        ];

        // ----------------------------------------------
        // Featured
        // ----------------------------------------------

        if (
            isFeatured !== undefined
        ) {
            product.isFeatured =
                isFeatured === "true" ||
                isFeatured === true;
        }

        // ----------------------------------------------
        // IMPORTANT:
        // DO NOT update product.isActive here.
        //
        // Product status is controlled by:
        // PATCH /products/:id/status
        // ----------------------------------------------

        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product,
        });

    } catch (error) {

        console.error(
            "Update product error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update product",
            error: error.message,
        });
    }
};

// --------------------------------------------------
// Delete Product
// --------------------------------------------------

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        if (product.images?.length > 0) {
            await Promise.all(
                product.images
                    .filter((image) => image.publicId)
                    .map((image) =>
                        deleteFromCloudinary(image.publicId)
                    )
            );
        }

        await Product.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });

    } catch (error) {
        console.error("Delete product error:", error);

        return res.status(500).json({
            message: "Failed to delete product",
            error: error.message,
        });
    }
};

const toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id)
            .populate("category", "name");

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        product.isActive = !product.isActive;

        await product.save();

        return res.status(200).json({
            success: true,
            message: `Product ${product.isActive
                    ? "activated"
                    : "deactivated"
                } successfully`,
            product,
        });

    } catch (error) {
        console.error(
            "Toggle product status error:",
            error
        );

        return res.status(500).json({
            message: "Failed to update product status",
        });
    }
};

const getStoreProducts = async (req, res) => {
    try {

        const {
            search = "",
            category,
            group,
            page = 1,
            limit = 12,
        } = req.query;


        const pageNumber = Math.max(
            Number(page),
            1
        );

        const limitNumber = Math.min(
            Math.max(Number(limit), 1),
            100
        );


        const filter = {
            isActive: true,
        };


        if (search.trim()) {
            const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.name = {
                $regex: escapedSearch,
                $options: "i",
            };
        }


        if (category) {

            filter.category = category;

        }


        if (group) {

            const categories =
                await Category.find({
                    group: group,
                    isActive: true,
                }).select("_id");


            const categoryIds =
                categories.map(
                    (category) =>
                        category._id
                );


            filter.category = {
                $in: categoryIds,
            };

        }


        const skip =
            (pageNumber - 1) *
            limitNumber;


        // Fetch products, count and active offers
        const [
            products,
            totalProducts,
            activeOffers,
        ] = await Promise.all([

            Product.find(filter)
                .populate(
                    "category",
                    "name group"
                )
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limitNumber),

            Product.countDocuments(filter),

            getActiveStoreOffers(Offer),

        ]);


        // Apply best offer pricing
        const productsWithPricing =
            products.map((product) => {

                const productObject =
                    product.toObject();


                productObject.variants =
                    productObject.variants.map(
                        (variant) => {

                            const pricing =
                                getBestOfferForProduct(
                                    productObject,
                                    variant,
                                    activeOffers
                                );


                            return {
                                ...variant,
                                pricing,
                            };

                        }
                    );


                return productObject;

            });


        const totalPages =
            Math.ceil(
                totalProducts /
                limitNumber
            );


        return res.status(200).json({

            success: true,

            products:
                productsWithPricing,

            pagination: {

                currentPage:
                    pageNumber,

                totalPages,

                totalProducts,

                limit:
                    limitNumber,

                hasNextPage:
                    pageNumber <
                    totalPages,

                hasPreviousPage:
                    pageNumber > 1,

            },

        });


    } catch (error) {

        console.error(
            "Get store products error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch products",

        });

    }
};

const getStoreProductById = async (req, res) => {
    try {

        const { id } = req.params;


        const product = await Product.findOne({
            _id: id,
            isActive: true,
        })
            .populate(
                "category",
                "name group"
            );


        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found",
            });

        }


        // Fetch currently active offers
        const activeOffers =
            await getActiveStoreOffers(Offer);


        // Convert mongoose document to normal object
        const productObject =
            product.toObject();


        // Calculate pricing for every variant
        productObject.variants =
            productObject.variants.map(
                (variant) => {

                    const pricing =
                        getBestOfferForProduct(
                            productObject,
                            variant,
                            activeOffers
                        );


                    return {
                        ...variant,
                        pricing,
                    };

                }
            );


        return res.status(200).json({

            success: true,

            product:
                productObject,

        });


    } catch (error) {

        console.error(
            "Get store product by ID error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch product",

        });

    }
};

export {
    createProduct,
    getProducts,
    getStoreProducts,
    getStoreProductById,
    deleteProduct,
    getProductById,
    updateProduct,
    toggleProductStatus,
};