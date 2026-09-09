import mongoose from "mongoose";

import Offer from "../models/offer.model.js";
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";

import uploadToCloudinary, {
    deleteFromCloudinary
} from "../utils/cloudinaryUpload.js";

const createOffer = async (req, res) => {
    let uploadedImage = null;

    try {
        const {
            title,
            description,
            discountType,
            discountValue,
            appliesTo = "store",
            category,
            product,
            startDate,
            endDate,
            isActive,
            imageAlt,
        } = req.body;

        if (
            !title?.trim() ||
            !discountType ||
            discountValue === undefined ||
            !startDate ||
            !endDate
        ) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing",
            });
        }

        if (
            !["percentage", "fixed"].includes(discountType)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid discount type",
            });
        }

        const numericDiscountValue = Number(discountValue);

        if (
            Number.isNaN(numericDiscountValue) ||
            numericDiscountValue < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Discount value must be a valid positive number",
            });
        }

        if (
            discountType === "percentage" &&
            numericDiscountValue > 100
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Percentage discount must be between 0 and 100",
            });
        }

        if (
            !["store", "category", "product"].includes(
                appliesTo
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid offer target",
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid start or end date",
            });
        }

        if (start >= end) {
            return res.status(400).json({
                success: false,
                message:
                    "End date must be after start date",
            });
        }

        if (appliesTo === "category") {
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Category is required for a category offer",
                });
            }

            if (
                !mongoose.Types.ObjectId.isValid(category)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID",
                });
            }

            const categoryExists = await Category.exists({
                _id: category,
            });

            if (!categoryExists) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }
        }

        if (appliesTo === "product") {
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Product is required for a product offer",
                });
            }

            if (
                !mongoose.Types.ObjectId.isValid(product)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID",
                });
            }

            const productExists = await Product.exists({
                _id: product,
            });

            if (!productExists) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
            }
        }

        if (req.file) {
            uploadedImage = await uploadToCloudinary(
                req.file.buffer
            );
        }

        const offer = await Offer.create({
            title: title.trim(),

            description:
                description?.trim() || "",

            image: {
                url: uploadedImage
                    ? uploadedImage.secure_url
                    : null,

                publicId: uploadedImage
                    ? uploadedImage.public_id
                    : null,

                alt: imageAlt?.trim() || "",
            },

            discountType,

            discountValue: numericDiscountValue,

            appliesTo,

            category:
                appliesTo === "category"
                    ? category
                    : null,

            product:
                appliesTo === "product"
                    ? product
                    : null,

            startDate: start,

            endDate: end,

            isActive:
                isActive === "false" ||
                isActive === false
                    ? false
                    : true,
        });


        return res.status(201).json({
            success: true,
            message: "Offer created successfully",
            offer,
        });

    } catch (error) {

        console.error(
            "Create offer error:",
            error
        );

        if (uploadedImage?.public_id) {
            try {
                await deleteFromCloudinary(
                    uploadedImage.public_id
                );
            } catch (deleteError) {
                console.error(
                    "Failed to rollback Cloudinary image:",
                    deleteError
                );
            }
        }


        return res.status(500).json({
            success: false,
            message: "Failed to create offer",
        });
    }
};

const getOffers = async (req, res) => {
    try {

        const offers = await Offer.find()
            .populate("category", "name")
            .populate("product", "name")
            .sort({ createdAt: -1 });


        return res.status(200).json({
            success: true,
            message: "Offers fetched successfully",
            offers,
        });

    } catch (error) {

        console.error(
            "Get offers error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch offers",
        });
    }
};

const getOffer = async (req, res) => {
    try {

        const { id } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid offer ID",
            });
        }


        const offer = await Offer.findById(id)
            .populate("category", "name")
            .populate("product", "name");


        if (!offer) {
            return res.status(404).json({
                success: false,
                message: "Offer not found",
            });
        }


        return res.status(200).json({
            success: true,
            offer,
        });

    } catch (error) {

        console.error(
            "Get offer error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch offer",
        });
    }
};

const updateOffer = async (req, res) => {
    let newUploadedImage = null;

    try {

        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid offer ID",
            });
        }

        const offer = await Offer.findById(id);

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: "Offer not found",
            });
        }


        const {
            title,
            description,
            discountType,
            discountValue,
            appliesTo,
            category,
            product,
            startDate,
            endDate,
            isActive,
            imageAlt,
        } = req.body;

        const finalTitle =
            title !== undefined
                ? title.trim()
                : offer.title;

        const finalDescription =
            description !== undefined
                ? description.trim()
                : offer.description;

        const finalDiscountType =
            discountType !== undefined
                ? discountType
                : offer.discountType;

        const finalDiscountValue =
            discountValue !== undefined
                ? Number(discountValue)
                : offer.discountValue;

        const finalAppliesTo =
            appliesTo !== undefined
                ? appliesTo
                : offer.appliesTo;

        const finalStartDate =
            startDate !== undefined
                ? new Date(startDate)
                : offer.startDate;

        const finalEndDate =
            endDate !== undefined
                ? new Date(endDate)
                : offer.endDate;

        if (!finalTitle) {
            return res.status(400).json({
                success: false,
                message: "Offer title is required",
            });
        }

        if (
            !["percentage", "fixed"].includes(
                finalDiscountType
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid discount type",
            });
        }

        if (
            Number.isNaN(finalDiscountValue) ||
            finalDiscountValue < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Discount value must be a valid positive number",
            });
        }

        if (
            finalDiscountType === "percentage" &&
            finalDiscountValue > 100
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Percentage discount must be between 0 and 100",
            });
        }

        if (
            !["store", "category", "product"].includes(
                finalAppliesTo
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid offer target",
            });
        }

        if (
            Number.isNaN(finalStartDate.getTime()) ||
            Number.isNaN(finalEndDate.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid start or end date",
            });
        }

        if (finalStartDate >= finalEndDate) {
            return res.status(400).json({
                success: false,
                message:
                    "End date must be after start date",
            });
        }

        let finalCategory = null;
        let finalProduct = null;


        if (finalAppliesTo === "category") {

            finalCategory =
                category !== undefined
                    ? category
                    : offer.category;

            if (!finalCategory) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Category is required for a category offer",
                });
            }

            if (
                !mongoose.Types.ObjectId.isValid(
                    finalCategory
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID",
                });
            }

            const categoryExists =
                await Category.exists({
                    _id: finalCategory,
                });

            if (!categoryExists) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }
        }


        if (finalAppliesTo === "product") {

            finalProduct =
                product !== undefined
                    ? product
                    : offer.product;

            if (!finalProduct) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Product is required for a product offer",
                });
            }

            if (
                !mongoose.Types.ObjectId.isValid(
                    finalProduct
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID",
                });
            }

            const productExists =
                await Product.exists({
                    _id: finalProduct,
                });

            if (!productExists) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
            }
        }

        if (req.file) {
            newUploadedImage =
                await uploadToCloudinary(
                    req.file.buffer
                );
        }

        offer.title = finalTitle;

        offer.description =
            finalDescription || "";

        offer.discountType =
            finalDiscountType;

        offer.discountValue =
            finalDiscountValue;

        offer.appliesTo =
            finalAppliesTo;

        offer.category =
            finalAppliesTo === "category"
                ? finalCategory
                : null;

        offer.product =
            finalAppliesTo === "product"
                ? finalProduct
                : null;

        offer.startDate =
            finalStartDate;

        offer.endDate =
            finalEndDate;


        // Update status only if provided
        if (isActive !== undefined) {
            offer.isActive =
                isActive === "true" ||
                isActive === true;
        }

        const oldImagePublicId =
            offer.image?.publicId;

        if (newUploadedImage) {
            offer.image = {
                url: newUploadedImage.secure_url,
                publicId:
                    newUploadedImage.public_id,
                alt:
                    imageAlt?.trim() ||
                    offer.image?.alt ||
                    "",
            };
        } else if (imageAlt !== undefined) {
            offer.image.alt =
                imageAlt.trim();
        }


        await offer.save();

        if (
            newUploadedImage &&
            oldImagePublicId
        ) {
            try {
                await deleteFromCloudinary(
                    oldImagePublicId
                );
            } catch (deleteError) {
                console.error(
                    "Failed to delete old offer image:",
                    deleteError
                );
            }
        }


        return res.status(200).json({
            success: true,
            message: "Offer updated successfully",
            offer,
        });

    } catch (error) {

        console.error(
            "Update offer error:",
            error
        );

        if (newUploadedImage?.public_id) {
            try {
                await deleteFromCloudinary(
                    newUploadedImage.public_id
                );
            } catch (deleteError) {
                console.error(
                    "Failed to rollback new offer image:",
                    deleteError
                );
            }
        }


        return res.status(500).json({
            success: false,
            message: "Failed to update offer",
        });
    }
};

const toggleOfferStatus = async (req, res) => {
    try {

        const { id } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid offer ID",
            });
        }


        const offer =
            await Offer.findById(id);


        if (!offer) {
            return res.status(404).json({
                success: false,
                message: "Offer not found",
            });
        }


        offer.isActive = !offer.isActive;

        await offer.save();


        return res.status(200).json({
            success: true,
            message: `Offer ${
                offer.isActive
                    ? "activated"
                    : "deactivated"
            } successfully`,
            offer,
        });

    } catch (error) {

        console.error(
            "Toggle offer status error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update offer status",
        });
    }
};

const deleteOffer = async (req, res) => {
    try {

        const { id } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid offer ID",
            });
        }


        const offer =
            await Offer.findById(id);


        if (!offer) {
            return res.status(404).json({
                success: false,
                message: "Offer not found",
            });
        }

        const imagePublicId =
            offer.image?.publicId;

        await offer.deleteOne();

        if (imagePublicId) {
            try {
                await deleteFromCloudinary(
                    imagePublicId
                );
            } catch (deleteError) {

                console.error(
                    "Failed to delete offer image from Cloudinary:",
                    deleteError
                );
            }
        }


        return res.status(200).json({
            success: true,
            message: "Offer deleted successfully",
        });

    } catch (error) {

        console.error(
            "Delete offer error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to delete offer",
        });
    }
};

const getStoreOffers = async (req, res) => {
    try {
        const now = new Date();

        const offers = await Offer.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
        })
            .populate("category", "name")
            .populate("product", "name images")
            .sort({ endDate: 1 });

        return res.status(200).json({
            success: true,
            offers,
        });

    } catch (error) {
        console.error(
            "Get store offers error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch offers",
        });
    }
};


export {
    createOffer,
    getOffers,
    getOffer,
    updateOffer,
    toggleOfferStatus,
    deleteOffer,
    getStoreOffers
};