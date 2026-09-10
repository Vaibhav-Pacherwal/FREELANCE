import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Offer from "../models/offer.model.js";
import {
    getActiveStoreOffers,
    getBestOfferForProduct,
} from "../utils/offerPricing.js";

const getCart = async (req, res) => {
    try {

        const cart = await Cart.findOne({
            user: req.user._id,
        }).populate({
            path: "items.product",
            select:
                "name slug images category variants isActive",
            populate: {
                path: "category",
                select: "name group",
            },
        });


        if (!cart) {

            return res.status(200).json({
                success: true,
                cart: {
                    items: [],
                    totalItems: 0,
                    subtotal: 0,
                },
            });

        }


        // Get all currently valid offers
        const activeOffers =
            await getActiveStoreOffers(Offer);


        let totalItems = 0;
        let subtotal = 0;


        const cartItems =
            cart.items.map((item) => {

                const product =
                    item.product;


                if (!product) {
                    return {
                        ...item.toObject(),
                        pricing: null,
                        unitPrice: 0,
                        subtotal: 0,
                    };
                }


                const variant =
                    product.variants.find(
                        (variant) =>
                            variant._id.toString() ===
                            item.variantId.toString()
                    );


                if (!variant) {
                    return {
                        ...item.toObject(),
                        pricing: null,
                        unitPrice: 0,
                        subtotal: 0,
                    };
                }


                const pricing =
                    getBestOfferForProduct(
                        product,
                        variant,
                        activeOffers
                    );


                const unitPrice =
                    pricing.finalPrice;


                const itemSubtotal =
                    unitPrice * item.quantity;


                totalItems += item.quantity;

                subtotal += itemSubtotal;


                return {
                    ...item.toObject(),

                    variant: {
                        _id: variant._id,
                        sku: variant.sku,
                        attributes: variant.attributes,
                        price: variant.price,
                        originalPrice:
                            variant.originalPrice,
                        stock: variant.stock,
                        isActive:
                            variant.isActive,
                    },

                    pricing,

                    unitPrice,

                    subtotal:
                        itemSubtotal,
                };

            });


        return res.status(200).json({

            success: true,

            cart: {

                _id: cart._id,

                user: cart.user,

                items: cartItems,

                totalItems,

                subtotal,

            },

        });


    } catch (error) {

        console.error(
            "Get cart error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch cart",

        });

    }
};

const addToCart = async (req, res) => {
    try {

        const { productId, variantId, quantity } = req.body;

        if (!productId || !variantId || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "Product, variant and quantity are required",
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (!product.isActive) {
            return res.status(400).json({
                success: false,
                message: "This product is currently unavailable",
            });
        }

        const variant = product.variants.id(variantId);

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Product variant not found",
            });
        }

        if (!variant.isActive) {
            return res.status(400).json({
                success: false,
                message: "This product variant is currently unavailable",
            });
        }

        if (variant.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${variant.stock} item${
                    variant.stock === 1 ? "" : "s"
                } available`,
            });
        }

        let cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {

            cart = await Cart.create({
                user: req.user._id,
                items: [
                    {
                        product: product._id,
                        variantId: variant._id,
                        quantity,
                    },
                ],
            });

            return res.status(201).json({
                success: true,
                message: "Item added to cart",
                cart,
            });
        }

        const existingItem = cart.items.find(
            (item) =>
                item.product.toString() === productId &&
                item.variantId.toString() === variantId
        );

        if (existingItem) {

            const newQuantity =
                existingItem.quantity + quantity;

            if (newQuantity > variant.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${variant.stock} item${
                        variant.stock === 1 ? "" : "s"
                    } available`,
                });
            }

            existingItem.quantity = newQuantity;

        } else {

            cart.items.push({
                product: product._id,
                variantId: variant._id,
                quantity,
            });
        }

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Item added to cart",
            cart,
        });

    } catch (error) {

        console.error("Add to cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add item to cart",
        });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { productId, variantId, quantity } = req.body;

        if (!productId || !variantId || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "Product, variant and quantity are required",
            });
        }

        if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1",
            });
        }

        const product = await Product.findOne({
            _id: productId,
            isActive: true,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product is no longer available",
            });
        }

        const variant = product.variants.id(variantId);

        if (!variant || !variant.isActive) {
            return res.status(400).json({
                success: false,
                message: "Selected variant is no longer available",
            });
        }

        const requestedQuantity = Number(quantity);

        if (requestedQuantity > variant.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${variant.stock} items are available`,
            });
        }

        const cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const item = cart.items.find(
            (item) =>
                item.product.toString() === productId &&
                item.variantId.toString() === variantId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        item.quantity = requestedQuantity;

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            cart,
        });

    } catch (error) {
        console.error("Update cart item error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update cart",
        });
    }
};

const removeCartItem = async (req, res) => {
    try {

        const { itemId } = req.params;

        const cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const item = cart.items.id(itemId);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        item.deleteOne();

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Item removed from cart",
            cart,
        });

    } catch (error) {

        console.error("Remove cart item error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to remove item",
        });
    }
};

const clearCart = async (req, res) => {
    try {

        const cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Cart is already empty",
            });
        }

        cart.items = [];

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart cleared",
            cart,
        });

    } catch (error) {

        console.error("Clear cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to clear cart",
        });
    }
};

const validateCart = async (req, res) => {
    try {

        const cart = await Cart.findOne({
            user: req.user._id,
        }).populate({
            path: "items.product",
            select:
                "name slug category variants isActive",
            populate: {
                path: "category",
                select: "name group",
            },
        });


        if (!cart || cart.items.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Cart is empty",
            });

        }


        const activeOffers =
            await getActiveStoreOffers(Offer);


        const invalidItems = [];


        cart.items.forEach((item) => {

            const product =
                item.product;


            if (!product || !product.isActive) {

                invalidItems.push({
                    productId: item.product?._id || item.product,
                    variantId: item.variantId,
                    reason:
                        "Product is no longer available",
                });

                return;
            }


            const variant =
                product.variants.find(
                    (variant) =>
                        variant._id.toString() ===
                        item.variantId.toString()
                );


            if (!variant || !variant.isActive) {

                invalidItems.push({
                    productId: product._id,
                    variantId: item.variantId,
                    reason:
                        "Selected variant is no longer available",
                });

                return;
            }


            if (variant.stock < item.quantity) {

                invalidItems.push({
                    productId: product._id,
                    variantId: item.variantId,
                    reason:
                        `Only ${variant.stock} items available`,
                });

                return;
            }

        });


        if (invalidItems.length > 0) {

            return res.status(400).json({

                success: false,

                message:
                    "Some cart items are no longer available",

                invalidItems,

            });

        }

        let subtotal = 0;
        let totalItems = 0;


        const items = cart.items.map((item) => {

            const product =
                item.product;


            const variant =
                product.variants.find(
                    (variant) =>
                        variant._id.toString() ===
                        item.variantId.toString()
                );


            const pricing =
                getBestOfferForProduct(
                    product,
                    variant,
                    activeOffers
                );


            const unitPrice =
                pricing.finalPrice;


            const itemSubtotal =
                unitPrice * item.quantity;


            subtotal += itemSubtotal;

            totalItems += item.quantity;


            return {

                productId:
                    product._id,

                variantId:
                    variant._id,

                quantity:
                    item.quantity,

                unitPrice,

                subtotal:
                    itemSubtotal,

                pricing,

            };

        });


        return res.status(200).json({

            success: true,

            message:
                "Cart is valid",

            cart: {

                items,

                totalItems,

                subtotal,

            },

        });


    } catch (error) {

        console.error(
            "Validate cart error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to validate cart",

        });

    }
};

export {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    validateCart,
};