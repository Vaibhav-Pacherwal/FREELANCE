import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        sku: {
            type: String,
            required: true,
            trim: true,
        },

        attributes: [
            {
                name: {
                    type: String,
                    required: true,
                    trim: true,
                },

                value: {
                    type: String,
                    required: true,
                    trim: true,
                },
            },
        ],

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        originalPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        discountAmount: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        finalPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        offer: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Offer",
                default: null,
            },

            title: {
                type: String,
                default: null,
            },

            discountType: {
                type: String,
                default: null,
            },

            discountValue: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        _id: true,
    }
);


const shippingAddressSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        addressLine1: {
            type: String,
            required: true,
            trim: true,
        },

        addressLine2: {
            type: String,
            default: "",
            trim: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        state: {
            type: String,
            required: true,
            trim: true,
        },

        pincode: {
            type: String,
            required: true,
            trim: true,
        },

        landmark: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        _id: false,
    }
);


const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: function (items) {
                    return items.length > 0;
                },
                message: "Order must contain at least one item",
            },
        },

        shippingAddress: {
            type: shippingAddressSchema,
            required: true,
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        discount: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        shippingFee: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        total: {
            type: Number,
            required: true,
            min: 0,
        },

        paymentMethod: {
            type: String,
            enum: [
                "cod",
                "razorpay",
            ],
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed",
                "refunded",
            ],
            default: "pending",
        },

        orderStatus: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
            ],
            default: "pending",
        },

        paymentId: {
            type: String,
            default: null,
        },

        razorpayOrderId: {
            type: String,
            default: null,
        },

        cancelledAt: {
            type: Date,
            default: null,
        },

        deliveredAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);


orderSchema.index({
    user: 1,
    createdAt: -1,
});

orderSchema.index({
    orderStatus: 1,
    createdAt: -1,
});

orderSchema.index({
    paymentStatus: 1,
    createdAt: -1,
});


const Order = mongoose.model(
    "Order",
    orderSchema
);

export default Order;