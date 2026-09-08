import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

const getCart = async (req, res) => {
    try {

        const cart = await Cart.findOne({
            user: req.user._id,
        }).populate({
            path: "items.product",
            select: "name slug images variants isActive",
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                cart: {
                    items: [],
                },
            });
        }

        return res.status(200).json({
            success: true,
            cart,
        });

    } catch (error) {

        console.error("Get cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch cart",
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

        const { itemId } = req.params;
        const { quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1",
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

        const item = cart.items.id(itemId);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        const product = await Product.findById(item.product);

        if (!product || !product.isActive) {
            return res.status(400).json({
                success: false,
                message: "Product is no longer available",
            });
        }

        const variant = product.variants.id(item.variantId);

        if (!variant || !variant.isActive) {
            return res.status(400).json({
                success: false,
                message: "Product variant is no longer available",
            });
        }

        if (quantity > variant.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${variant.stock} item${
                    variant.stock === 1 ? "" : "s"
                } available`,
            });
        }

        item.quantity = quantity;

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart,
        });

    } catch (error) {

        console.error("Update cart error:", error);

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


export {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
};