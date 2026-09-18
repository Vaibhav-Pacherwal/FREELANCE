import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Address from "../models/address.model.js";
import Offer from "../models/offer.model.js";

import {
    getRazorpayConfig,
    createRazorpayOrder,
    verifyRazorpayPayment,
    createOrder,
    cancelOrder,
} from "../controllers/order.controllers.js";

const runTests = async () => {
    console.log("=== STARTING RAZORPAY INTEGRATION & COD REMOVAL TESTS ===");

    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/gwears");
    console.log("✓ Connected to MongoDB");

    // Mock Express res/req helper
    const createMockRes = () => {
        const res = {
            statusCode: 200,
            data: null,
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(obj) {
                this.data = obj;
                return this;
            },
        };
        return res;
    };

    // Test 1: Config endpoint
    console.log("\n[TEST 1] Config Endpoint & Secret Protection");
    const mockRes1 = createMockRes();
    await getRazorpayConfig({}, mockRes1);
    console.log("Status:", mockRes1.statusCode);
    console.log("Data:", mockRes1.data);
    if (mockRes1.statusCode === 200 && mockRes1.data.keyId && !mockRes1.data.keySecret) {
        console.log("✓ PASS: Config returned keyId without exposing keySecret");
    } else {
        throw new Error("FAIL: Config endpoint issue or secret exposed");
    }

    // Set up test user, address, category, product, variant
    const testEmail = `test_rzp_${Date.now()}@gwears.com`;
    const user = await User.create({
        name: "Test RZP User",
        email: testEmail,
        password: "Password123!",
        role: "customer",
    });

    const address = await Address.create({
        user: user._id,
        fullName: "Test Customer",
        phone: "9876543210",
        addressLine1: "123 Luxury Avenue",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302001",
        isDefault: true,
    });

    let category = await Category.findOne({ slug: "mens-shirts" });
    if (!category) {
        category = await Category.create({
            name: "Men's Shirts",
            slug: "mens-shirts",
            group: "clothing",
        });
    }

    const initialStock = 15;
    const testPrice = 1499;
    const product = await Product.create({
        name: "Razorpay Test Shirt",
        slug: `rzp-test-shirt-${Date.now()}`,
        category: category._id,
        description: "Test product for Razorpay validation",
        variants: [
            {
                sku: `SKU-RZP-${Date.now()}`,
                price: testPrice,
                originalPrice: 1999,
                stock: initialStock,
                isActive: true,
                attributes: [{ name: "Size", value: "M" }],
            },
        ],
        isActive: true,
    });

    const variantId = product.variants[0]._id;

    // Put item in user's cart (2 units)
    const cart = await Cart.create({
        user: user._id,
        items: [
            {
                product: product._id,
                variantId: variantId,
                quantity: 2,
            },
        ],
    });

    // Test 2: Verify COD rejection (400 Bad Request)
    console.log("\n[TEST 2] Rejection of COD payment method");
    const mockRes2 = createMockRes();
    await createOrder(
        {
            user: { _id: user._id },
            body: {
                addressId: address._id,
                paymentMethod: "cod",
            },
        },
        mockRes2
    );
    console.log("COD attempt status:", mockRes2.statusCode);
    console.log("COD attempt message:", mockRes2.data?.message);
    if (mockRes2.statusCode === 400 && mockRes2.data?.message?.includes("Cash on Delivery is no longer supported")) {
        console.log("✓ PASS: COD was rejected with HTTP 400");
    } else {
        throw new Error("FAIL: COD was not properly rejected with HTTP 400");
    }

    // Test 3: Create Razorpay Order via createRazorpayOrder
    console.log("\n[TEST 3] Authoritative Razorpay Order Creation");
    const mockRes3 = createMockRes();
    await createRazorpayOrder(
        {
            user: { _id: user._id },
            body: {
                addressId: address._id,
                // Notice we send a tampered client amount to verify server overrides it!
                amount: 1, 
            },
        },
        mockRes3
    );

    console.log("Create RZP order status:", mockRes3.statusCode);
    console.log("Create RZP order response:", mockRes3.data);

    const createdOrderInDb = await Order.findById(mockRes3.data.orderId);
    const expectedTotal = createdOrderInDb.total;
    const expectedPaise = Math.round(createdOrderInDb.total * 100);

    if (
        mockRes3.statusCode === 200 &&
        mockRes3.data.razorpayOrderId &&
        mockRes3.data.amount === expectedPaise
    ) {
        console.log(`✓ PASS: Razorpay order created with authoritative price: ₹${expectedTotal} (${expectedPaise} paise)`);
    } else {
        throw new Error(`FAIL: Razorpay order amount mismatch. Expected ${expectedPaise}, got ${mockRes3.data?.amount}`);
    }

    // Verify stock and cart are INTACT before payment
    const checkProductBeforePay = await Product.findById(product._id);
    const checkCartBeforePay = await Cart.findOne({ user: user._id });
    if (checkProductBeforePay.variants[0].stock === initialStock && checkCartBeforePay.items.length === 1) {
        console.log("✓ PASS: Stock and cart remained untouched before payment verification");
    } else {
        throw new Error("FAIL: Stock or cart was prematurely modified before payment");
    }

    const createdOrderId = mockRes3.data.orderId;
    const rzpOrderId = mockRes3.data.razorpayOrderId;

    // Test 4: Signature Tampering / Failure
    console.log("\n[TEST 4] Signature Tampering Check");
    const mockRes4 = createMockRes();
    const fakePaymentId = "pay_fake123456789";
    const invalidSignature = "invalid_tampered_signature_hex";

    await verifyRazorpayPayment(
        {
            user: { _id: user._id },
            body: {
                orderId: createdOrderId,
                razorpayOrderId: rzpOrderId,
                razorpayPaymentId: fakePaymentId,
                razorpaySignature: invalidSignature,
            },
        },
        mockRes4
    );

    console.log("Invalid signature status:", mockRes4.statusCode);
    console.log("Invalid signature message:", mockRes4.data?.message);

    const orderAfterTamper = await Order.findById(createdOrderId);
    if (mockRes4.statusCode === 400 && orderAfterTamper.paymentStatus === "failed") {
        console.log("✓ PASS: Tampered signature rejected with 400 and order marked failed");
    } else {
        throw new Error("FAIL: Tampered signature was not rejected properly");
    }

    // Check cart is still intact after failed payment
    const checkCartAfterTamper = await Cart.findOne({ user: user._id });
    if (checkCartAfterTamper.items.length === 1) {
        console.log("✓ PASS: Cart preserved after payment failure");
    } else {
        throw new Error("FAIL: Cart was cleared on payment failure");
    }

    // Test 5: Valid Razorpay Signature Verification
    console.log("\n[TEST 5] Valid Signature Verification & Atomic Settlement");
    const realPaymentId = "pay_test_" + Date.now();
    const validSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${rzpOrderId}|${realPaymentId}`)
        .digest("hex");

    const mockRes5 = createMockRes();
    await verifyRazorpayPayment(
        {
            user: { _id: user._id },
            body: {
                orderId: createdOrderId,
                razorpayOrderId: rzpOrderId,
                razorpayPaymentId: realPaymentId,
                razorpaySignature: validSignature,
            },
        },
        mockRes5
    );

    console.log("Valid verification status:", mockRes5.statusCode);
    console.log("Valid verification message:", mockRes5.data?.message);

    const orderAfterVerification = await Order.findById(createdOrderId);
    const productAfterPay = await Product.findById(product._id);
    const cartAfterPay = await Cart.findOne({ user: user._id });

    if (
        mockRes5.statusCode === 200 &&
        orderAfterVerification.paymentStatus === "paid" &&
        orderAfterVerification.orderStatus === "confirmed" &&
        orderAfterVerification.paymentId === realPaymentId &&
        productAfterPay.variants[0].stock === initialStock - 2 &&
        cartAfterPay.items.length === 0
    ) {
        console.log("✓ PASS: Payment successfully verified! Order marked paid & confirmed, stock decremented (15 -> 13), cart emptied");
    } else {
        throw new Error("FAIL: Verification settlement did not update order, stock, or cart correctly");
    }

    // Test 6: Idempotency Check (repeat verification)
    console.log("\n[TEST 6] Idempotency Verification");
    const mockRes6 = createMockRes();
    await verifyRazorpayPayment(
        {
            user: { _id: user._id },
            body: {
                orderId: createdOrderId,
                razorpayOrderId: rzpOrderId,
                razorpayPaymentId: realPaymentId,
                razorpaySignature: validSignature,
            },
        },
        mockRes6
    );

    console.log("Repeated verification status:", mockRes6.statusCode);
    console.log("Repeated verification message:", mockRes6.data?.message);

    const productAfterRepeat = await Product.findById(product._id);
    if (
        mockRes6.statusCode === 200 &&
        mockRes6.data?.message?.includes("already verified") &&
        productAfterRepeat.variants[0].stock === initialStock - 2
    ) {
        console.log("✓ PASS: Idempotent - repeated call returned 200 without double-decrementing stock");
    } else {
        throw new Error("FAIL: Idempotency violated; stock double-decremented or error thrown");
    }

    // Test 7: Cancel Paid Order (Stock Restoration)
    console.log("\n[TEST 7] Stock Restoration on Cancelling Paid Order");
    const mockRes7 = createMockRes();
    await cancelOrder(
        {
            user: { _id: user._id },
            params: { id: createdOrderId },
        },
        mockRes7
    );
    console.log("Cancel paid order status:", mockRes7.statusCode);
    const productAfterPaidCancel = await Product.findById(product._id);
    if (mockRes7.statusCode === 200 && productAfterPaidCancel.variants[0].stock === initialStock) {
        console.log(`✓ PASS: Paid order cancellation properly restored stock (13 -> ${productAfterPaidCancel.variants[0].stock})`);
    } else {
        throw new Error(`FAIL: Stock not restored properly on cancelling paid order. Got ${productAfterPaidCancel.variants[0].stock}`);
    }

    // Test 8: Cancel Unpaid Pending Order (No Phantom Stock)
    console.log("\n[TEST 8] Safe Cancellation of Unpaid Pending Order (No Phantom Stock)");
    const unpaidOrder = await Order.create({
        user: user._id,
        items: [
            {
                product: product._id,
                variantId: variantId,
                name: product.name,
                sku: product.variants[0].sku,
                attributes: [{ name: "Size", value: "M" }],
                quantity: 3,
                originalPrice: testPrice,
                discountAmount: 0,
                finalPrice: testPrice,
                subtotal: testPrice * 3,
            },
        ],
        shippingAddress: {
            fullName: address.fullName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
        },
        subtotal: testPrice * 3,
        discount: 0,
        shippingFee: 0,
        total: testPrice * 3,
        paymentMethod: "razorpay",
        paymentStatus: "pending",
        orderStatus: "pending",
    });

    const mockRes8 = createMockRes();
    await cancelOrder(
        {
            user: { _id: user._id },
            params: { id: unpaidOrder._id },
        },
        mockRes8
    );

    console.log("Cancel unpaid order status:", mockRes8.statusCode);
    const productAfterUnpaidCancel = await Product.findById(product._id);
    if (mockRes8.statusCode === 200 && productAfterUnpaidCancel.variants[0].stock === initialStock) {
        console.log(`✓ PASS: Unpaid order cancellation did NOT add phantom stock (remained ${productAfterUnpaidCancel.variants[0].stock})`);
    } else {
        throw new Error(`FAIL: Phantom stock added! Expected ${initialStock}, got ${productAfterUnpaidCancel.variants[0].stock}`);
    }

    // Clean up test data
    await Order.deleteMany({ user: user._id });
    await Cart.deleteMany({ user: user._id });
    await Address.deleteMany({ user: user._id });
    await Product.deleteOne({ _id: product._id });
    await User.deleteOne({ _id: user._id });
    console.log("\n✓ Cleaned up test data");

    console.log("\n=======================================================");
    console.log("ALL RAZORPAY & COD REMOVAL TESTS PASSED SUCCESSFULLY! ✓");
    console.log("=======================================================\n");

    await mongoose.disconnect();
    process.exit(0);
};

runTests().catch((err) => {
    console.error("\n❌ TEST ERROR:", err);
    process.exit(1);
});
