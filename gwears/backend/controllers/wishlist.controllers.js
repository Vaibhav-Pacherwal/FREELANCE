import Wishlist from "../models/wishlist.model.js";
import Product from "../models/product.model.js";

const getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({
            user: req.user._id,
        }).populate({
            path: "products",
            match: { isActive: true },
            populate: {
                path: "category",
                select: "name",
            },
        });

        return res.status(200).json({
            success: true,
            products: wishlist?.products || [],
        });

    } catch (error) {
        console.error("Get wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch wishlist",
        });
    }
};


const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findOne({
            _id: productId,
            isActive: true,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const wishlist = await Wishlist.findOneAndUpdate(
            { user: req.user._id },
            {
                $addToSet: {
                    products: productId,
                },
            },
            {
                new: true,
                upsert: true,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Added to wishlist",
            wishlist,
        });

    } catch (error) {
        console.error("Add wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add to wishlist",
        });
    }
};


const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOneAndUpdate(
            { user: req.user._id },
            {
                $pull: {
                    products: productId,
                },
            },
            {
                new: true,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Removed from wishlist",
            wishlist,
        });

    } catch (error) {
        console.error(
            "Remove wishlist error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to remove from wishlist",
        });
    }
};


const checkWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({
            user: req.user._id,
            products: productId,
        });

        return res.status(200).json({
            success: true,
            isWishlisted: !!wishlist,
        });

    } catch (error) {
        console.error(
            "Check wishlist error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to check wishlist",
        });
    }
};


export {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlist,
};