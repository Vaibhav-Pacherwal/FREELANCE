import mongoose from "mongoose";

import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
import Offer from "../models/offer.model.js";
import User from "../models/user.model.js";

import {
    getActiveStoreOffers,
    getBestOfferForProduct,
} from "../utils/offerPricing.js";
import crypto from "crypto";
import razorpay from "../utils/razorpay.js";

const isRazorpayConfigured = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    return Boolean(
        keyId &&
        keySecret &&
        !keyId.includes("xxxxx") &&
        !keySecret.includes("xxxxx")
    );
};

const createOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {

        const {
            addressId,
            paymentMethod,
        } = req.body;

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

        const activeOffers =
            await getActiveStoreOffers(Offer);


        const orderItems = [];

        let subtotal = 0;

        let totalDiscount = 0;

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

            orderItems.push({

                product:
                    product._id,

                variantId:
                    variant._id,

                name:
                    product.name,

                image: {
                    url: product.images?.[0]?.url || "",
                    alt: product.images?.[0]?.alt || product.name,
                },

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

        const shippingFee = 0;

        const total =
            subtotal +
            shippingFee;

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

        session.startTransaction();

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
            }).populate({
                path: "items.product",
                select: "name slug images category",
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

const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const cancellableStatuses = [
            "pending",
            "confirmed",
            "processing",
        ];

        if (!cancellableStatuses.includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled once it is ${order.orderStatus}.`,
            });
        }

        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            for (const item of order.items) {
                const result = await Product.updateOne(
                    {
                        _id: item.product,
                        "variants._id": item.variantId,
                    },
                    {
                        $inc: {
                            "variants.$.stock": item.quantity,
                        },
                    },
                    { session }
                );

                if (result.modifiedCount !== 1) {
                    throw new Error(
                        `Failed to restore stock for product ${item.product}`
                    );
                }
            }

            order.orderStatus = "cancelled";
            order.cancelledAt = new Date();

            if (order.paymentStatus === "paid") {
                order.paymentStatus = "refunded";
            }

            await order.save({ session });

            await session.commitTransaction();

            return res.status(200).json({
                success: true,
                message: "Order cancelled successfully",
                order,
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error("Cancel order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to cancel order",
        });
    }
};

const getAdminOrders = async (req, res) => {
    try {
        const {
            search = "",
            status,
            paymentStatus,
            page = 1,
            limit = 20,
        } = req.query;

        const pageNumber = Math.max(Number(page), 1);
        const limitNumber = Math.min(
            Math.max(Number(limit), 1),
            100
        );

        const filter = {};

        if (status) {
            filter.orderStatus = status;
        }

        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }

        if (search.trim()) {
            const searchValue = search.trim();

            const searchRegex = new RegExp(
                searchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
            );

            const orConditions = [
                { "shippingAddress.fullName": searchRegex },
                { "shippingAddress.phone": searchRegex },
            ];

            if (mongoose.Types.ObjectId.isValid(searchValue)) {
                orConditions.push({
                    _id: searchValue,
                });
            }

            console.log("ADMIN SEARCH:", searchValue);

            const matchingUsers = await User.find({
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                ],
            }).select("_id name email");

            console.log("MATCHING USERS:", matchingUsers);

            if (matchingUsers.length > 0) {
                orConditions.push({
                    user: {
                        $in: matchingUsers.map(
                            (user) => user._id
                        ),
                    },
                });
            }

            filter.$or = orConditions;
        }

        const skip =
            (pageNumber - 1) * limitNumber;

        const [
            orders,
            totalOrders,
        ] = await Promise.all([
            Order.find(filter)
                .populate(
                    "user",
                    "name email avatar"
                )
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limitNumber),

            Order.countDocuments(filter),
        ]);

        const totalPages =
            Math.ceil(
                totalOrders / limitNumber
            );

        return res.status(200).json({
            success: true,
            orders,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalOrders,
                limit: limitNumber,
                hasNextPage:
                    pageNumber < totalPages,
                hasPreviousPage:
                    pageNumber > 1,
            },
        });
    } catch (error) {
        console.error(
            "Get admin orders error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
        });
    }
};

const getAdminOrderById = async (
    req,
    res
) => {
    try {
        const order =
            await Order.findById(
                req.params.id
            ).populate(
                "user",
                "name email avatar"
            ).populate({
                path: "items.product",
                select: "name slug images category",
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message:
                    "Order not found",
            });
        }

        return res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error(
            "Get admin order error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch order",
        });
    }
};


const updateAdminOrderStatus = async (
    req,
    res
) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
        ];

        if (
            !status ||
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid order status",
            });
        }

        const order =
            await Order.findById(
                req.params.id
            );

        if (!order) {
            return res.status(404).json({
                success: false,
                message:
                    "Order not found",
            });
        }

        if (
            order.orderStatus ===
            "cancelled" &&
            status !== "cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Cancelled orders cannot be reopened",
            });
        }

        const statusOrder = [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
        ];

        const currentIndex =
            statusOrder.indexOf(
                order.orderStatus
            );

        const requestedIndex =
            statusOrder.indexOf(status);

        if (
            status !== "cancelled" &&
            currentIndex !== -1 &&
            requestedIndex !== -1 &&
            requestedIndex < currentIndex
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Order status cannot move backwards",
            });
        }

        order.orderStatus = status;

        if (status === "delivered") {
            order.deliveredAt = new Date();
        }

        if (status === "cancelled" && order.orderStatus !== "cancelled") {
            order.cancelledAt = new Date();

            // Restore variant stock on admin cancellation
            for (const item of order.items) {
                await Product.updateOne(
                    {
                        _id: item.product,
                        "variants._id": item.variantId,
                    },
                    {
                        $inc: {
                            "variants.$.stock": item.quantity,
                        },
                    }
                );
            }

            if (order.paymentStatus === "paid") {
                order.paymentStatus = "refunded";
            }
        }

        order.orderStatus = status;

        await order.save();

        return res.status(200).json({
            success: true,
            message:
                "Order status updated successfully",
            order,
        });
    } catch (error) {
        console.error(
            "Update admin order status error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update order status",
        });
    }
};

// RAZORPAY HELPERS & HANDLERS

const getRazorpayConfig = async (req, res) => {
    try {
        const configured = isRazorpayConfigured();
        return res.status(200).json({
            success: true,
            isConfigured: configured,
            keyId: configured ? process.env.RAZORPAY_KEY_ID : null,
        });
    } catch (error) {
        console.error("Get Razorpay config error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve payment configuration",
        });
    }
};

const createRazorpayOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!isRazorpayConfigured()) {
            return res.status(400).json({
                success: false,
                configured: false,
                message: "Online payment gateway is not configured yet. Please select Cash on Delivery.",
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (order.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "Order is already paid",
            });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(order.total * 100), // amount in paise
            currency: "INR",
            receipt: `order_rcpt_${order._id.toString()}`,
        });

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(200).json({
            success: true,
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });

    } catch (error) {
        console.error("Create Razorpay order error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create payment order",
        });
    }
};

const verifyRazorpayPayment = async (req, res) => {
    try {
        const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

        if (!isRazorpayConfigured()) {
            return res.status(400).json({
                success: false,
                configured: false,
                message: "Online payment gateway is not configured yet.",
            });
        }

        if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
            return res.status(400).json({
                success: false,
                message: "Incomplete payment verification payload",
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");

        if (generatedSignature !== razorpaySignature) {
            order.paymentStatus = "failed";
            await order.save();

            return res.status(400).json({
                success: false,
                message: "Payment verification failed. Invalid signature.",
            });
        }

        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
        order.paymentId = razorpayPaymentId;
        order.razorpayOrderId = razorpayOrderId;
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            order,
        });

    } catch (error) {
        console.error("Verify Razorpay payment error:", error);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
        });
    }
};

export {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder,
    getAdminOrders,
    getAdminOrderById,
    updateAdminOrderStatus,
    getRazorpayConfig,
    createRazorpayOrder,
    verifyRazorpayPayment,
};