import mongoose from "mongoose";

import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
import Offer from "../models/offer.model.js";

import {
    getActiveStoreOffers,
    getBestOfferForProduct,
} from "../utils/offerPricing.js";


// CREATE ORDER
const createOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {

        const {
            addressId,
            paymentMethod,
        } = req.body;


        // -----------------------------------
        // BASIC VALIDATION
        // -----------------------------------

        if (!addressId) {

            return res.status(400).json({
                success: false,
                message: "Address is required",
            });

        }


        if (
            !paymentMethod ||
            !["cod", "razorpay"].includes(
                paymentMethod
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Valid payment method is required",
            });

        }


        // -----------------------------------
        // ADDRESS
        // -----------------------------------

        const address =
            await Address.findOne({
                _id: addressId,
                user: req.user._id,
            });


        if (!address) {

            return res.status(404).json({
                success: false,
                message:
                    "Shipping address not found",
            });

        }


        // -----------------------------------
        // CART
        // -----------------------------------

        const cart =
            await Cart.findOne({
                user: req.user._id,
            }).populate({
                path: "items.product",
                select:
                    "name category variants isActive",
                populate: {
                    path: "category",
                    select: "name group",
                },
            });


        if (
            !cart ||
            cart.items.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Cart is empty",
            });

        }


        // -----------------------------------
        // ACTIVE OFFERS
        // -----------------------------------

        const activeOffers =
            await getActiveStoreOffers(Offer);


        const orderItems = [];

        let subtotal = 0;

        let totalDiscount = 0;


        // -----------------------------------
        // VALIDATE CART + CALCULATE PRICES
        // -----------------------------------

        for (const cartItem of cart.items) {

            const product =
                cartItem.product;


            if (
                !product ||
                !product.isActive
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "One or more products are no longer available",
                });

            }


            const variant =
                product.variants.find(
                    (variant) =>
                        variant._id.toString() ===
                        cartItem.variantId.toString()
                );


            if (
                !variant ||
                !variant.isActive
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `Variant for ${product.name} is no longer available`,
                });

            }


            // -----------------------------------
            // STOCK CHECK
            // -----------------------------------

            if (
                variant.stock <
                cartItem.quantity
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `Only ${variant.stock} units of ${product.name} are available`,
                });

            }


            // -----------------------------------
            // OFFER CALCULATION
            // -----------------------------------

            const pricing =
                getBestOfferForProduct(
                    product,
                    variant,
                    activeOffers
                );


            const itemSubtotal =
                pricing.finalPrice *
                cartItem.quantity;


            const itemDiscount =
                pricing.discountAmount *
                cartItem.quantity;


            subtotal += itemSubtotal;

            totalDiscount += itemDiscount;


            // -----------------------------------
            // ORDER SNAPSHOT
            // -----------------------------------

            orderItems.push({

                product:
                    product._id,

                variantId:
                    variant._id,

                name:
                    product.name,

                sku:
                    variant.sku,

                attributes:
                    variant.attributes.map(
                        (attribute) => ({
                            name:
                                attribute.name,

                            value:
                                attribute.value,
                        })
                    ),

                quantity:
                    cartItem.quantity,

                originalPrice:
                    pricing.originalPrice,

                discountAmount:
                    pricing.discountAmount,

                finalPrice:
                    pricing.finalPrice,

                subtotal:
                    itemSubtotal,

                offer: pricing.offer
                    ? {
                        id:
                            pricing.offer._id,

                        title:
                            pricing.offer.title,

                        discountType:
                            pricing.discountType,

                        discountValue:
                            pricing.discountValue,
                    }
                    : {
                        id: null,

                        title: null,

                        discountType: null,

                        discountValue: 0,
                    },

            });

        }


        // -----------------------------------
        // SHIPPING
        // -----------------------------------

        /*
         * For now shipping is free.
         *
         * Later we can calculate shipping based
         * on pincode, order value, weight, etc.
         */

        const shippingFee = 0;


        // -----------------------------------
        // FINAL TOTAL
        // -----------------------------------

        const total =
            subtotal +
            shippingFee;


        // -----------------------------------
        // ADDRESS SNAPSHOT
        // -----------------------------------

        const shippingAddress = {

            fullName:
                address.fullName,

            phone:
                address.phone,

            addressLine1:
                address.addressLine1,

            addressLine2:
                address.addressLine2,

            city:
                address.city,

            state:
                address.state,

            pincode:
                address.pincode,

            landmark:
                address.landmark,

        };


        // -----------------------------------
        // START TRANSACTION
        // -----------------------------------

        session.startTransaction();


        // -----------------------------------
        // RE-CHECK STOCK INSIDE TRANSACTION
        // -----------------------------------

        for (const item of orderItems) {

            const updatedProduct =
                await Product.findOneAndUpdate(

                    {
                        _id:
                            item.product,

                        isActive:
                            true,

                        "variants._id":
                            item.variantId,

                        "variants.isActive":
                            true,

                        "variants.stock":
                            {
                                $gte:
                                    item.quantity,
                            },
                    },

                    {
                        $inc: {
                            "variants.$.stock":
                                -item.quantity,
                        },
                    },

                    {
                        new: true,

                        session,
                    }
                );


            if (!updatedProduct) {

                await session.abortTransaction();

                return res.status(409).json({

                    success: false,

                    message:
                        "Stock changed while processing your order. Please review your cart and try again.",

                });

            }

        }


        // -----------------------------------
        // CREATE ORDER
        // -----------------------------------

        const order =
            await Order.create(
                [
                    {

                        user:
                            req.user._id,

                        items:
                            orderItems,

                        shippingAddress,

                        subtotal,

                        discount:
                            totalDiscount,

                        shippingFee,

                        total,

                        paymentMethod,

                        paymentStatus:
                            paymentMethod === "cod"
                                ? "pending"
                                : "pending",

                        orderStatus:
                            paymentMethod === "cod"
                                ? "confirmed"
                                : "pending",

                    },
                ],
                {
                    session,
                }
            );


        // -----------------------------------
        // CLEAR CART
        // -----------------------------------

        await Cart.updateOne(

            {
                _id:
                    cart._id,

                user:
                    req.user._id,
            },

            {
                $set: {
                    items: [],
                },
            },

            {
                session,
            }

        );


        // -----------------------------------
        // COMMIT
        // -----------------------------------

        await session.commitTransaction();


        return res.status(201).json({

            success: true,

            message:
                "Order created successfully",

            order:
                order[0],

        });


    } catch (error) {

        if (
            session.inTransaction()
        ) {
            await session.abortTransaction();
        }


        console.error(
            "Create order error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to create order",

        });

    } finally {

        await session.endSession();

    }
};

const getOrders = async (req, res) => {
    try {

        const orders =
            await Order.find({
                user: req.user._id,
            })
                .sort({
                    createdAt: -1,
                });

        return res.status(200).json({
            success: true,
            orders,
        });

    } catch (error) {

        console.error(
            "Get orders error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch orders",
        });
    }
};


const getOrderById = async (req, res) => {
    try {

        const order =
            await Order.findOne({
                _id: req.params.id,
                user: req.user._id,
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        return res.status(200).json({
            success: true,
            order,
        });

    } catch (error) {

        console.error(
            "Get order error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch order",
        });
    }
};

export {
    createOrder,
    getOrders,
    getOrderById
};