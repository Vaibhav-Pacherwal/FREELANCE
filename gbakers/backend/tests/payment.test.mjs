/**
 * payment.test.mjs – Gupta Bakers Razorpay payment & order routes tests
 *
 * Runs with Node.js test runner:
 *   node --test tests/payment.test.mjs
 */

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import crypto from "node:crypto";
import express from "express";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import paymentRoutes from "../routes/payment.routes.js";
import Product from "../model/product.model.js";
import Order from "../model/order.model.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

function request(server, { method = "POST", path = "/api/payments/create-order", headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const port = addr.port;

    const payload = body !== undefined ? JSON.stringify(body) : undefined;
    const reqHeaders = {
      "Content-Type": "application/json",
      ...headers,
      ...(payload !== undefined ? { "Content-Length": Buffer.byteLength(payload) } : {}),
    };

    const req = http.request(
      { host: "127.0.0.1", port, method, path, headers: reqHeaders },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString();
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );
    req.on("error", reject);
    if (payload !== undefined) req.write(payload);
    req.end();
  });
}

function startServer(app) {
  return new Promise((resolve) => {
    const srv = http.createServer(app);
    srv.listen(0, "127.0.0.1", () => resolve(srv));
  });
}

function closeServer(srv) {
  return new Promise((resolve, reject) =>
    srv.close((err) => (err ? reject(err) : resolve()))
  );
}

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/payments", paymentRoutes);
  return app;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/create-order
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/payments/create-order endpoint", () => {
  let server;
  const originalKeyId = process.env.RAZORPAY_KEY_ID;
  const originalKeySecret = process.env.RAZORPAY_KEY_SECRET;
  const originalProductFind = Product.find;
  const originalOrderCreate = Order.create;
  const originalOrderFindByIdAndDelete = Order.findByIdAndDelete;
  const dummyRzp = new Razorpay({ key_id: "init", key_secret: "init" });
  const ApiProto = dummyRzp.api.constructor.prototype;
  const originalApiPost = ApiProto.post;

  const validProductId = new mongoose.Types.ObjectId().toString();

  beforeEach(async () => {
    process.env.RAZORPAY_KEY_ID = "rzp_test_mockKey123";
    process.env.RAZORPAY_KEY_SECRET = "mockSecretKey456";
    server = await startServer(createTestApp());
  });

  afterEach(async () => {
    process.env.RAZORPAY_KEY_ID = originalKeyId;
    process.env.RAZORPAY_KEY_SECRET = originalKeySecret;
    Product.find = originalProductFind;
    Order.create = originalOrderCreate;
    Order.findByIdAndDelete = originalOrderFindByIdAndDelete;
    ApiProto.post = originalApiPost;
    if (server) await closeServer(server);
  });

  test("rejects request missing customerName with 400", async () => {
    const res = await request(server, {
      body: {
        customerPhone: "9876543210",
        deliveryAddress: "123 Connaught Place, New Delhi",
        items: [{ productId: validProductId, quantity: 1 }],
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /customerName/i);
  });

  test("rejects request missing customerPhone with 400", async () => {
    const res = await request(server, {
      body: {
        customerName: "Priyanshu Sharma",
        deliveryAddress: "123 Connaught Place, New Delhi",
        items: [{ productId: validProductId, quantity: 1 }],
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /customerPhone/i);
  });

  test("rejects request missing deliveryAddress with 400", async () => {
    const res = await request(server, {
      body: {
        customerName: "Priyanshu Sharma",
        customerPhone: "9876543210",
        items: [{ productId: validProductId, quantity: 1 }],
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /deliveryAddress/i);
  });

  test("rejects request with empty items array with 400", async () => {
    const res = await request(server, {
      body: {
        customerName: "Priyanshu Sharma",
        customerPhone: "9876543210",
        deliveryAddress: "123 Connaught Place, New Delhi",
        items: [],
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /non-empty array/i);
  });

  test("rejects item with invalid productId format with 400", async () => {
    const res = await request(server, {
      body: {
        customerName: "Priyanshu Sharma",
        customerPhone: "9876543210",
        deliveryAddress: "123 Connaught Place, New Delhi",
        items: [{ productId: "invalid-id-123", quantity: 1 }],
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /missing or invalid/i);
  });

  test("rejects item with non-positive quantity with 400", async () => {
    const res = await request(server, {
      body: {
        customerName: "Priyanshu Sharma",
        customerPhone: "9876543210",
        deliveryAddress: "123 Connaught Place, New Delhi",
        items: [{ productId: validProductId, quantity: 0 }],
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /positive integer/i);
  });

  test("rejects item exceeding MAX_QUANTITY_PER_ITEM with 400", async () => {
    const res = await request(server, {
      body: {
        customerName: "Priyanshu Sharma",
        customerPhone: "9876543210",
        deliveryAddress: "123 Connaught Place, New Delhi",
        items: [{ productId: validProductId, quantity: 51 }],
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /maximum allowed quantity/i);
  });

  test("returns 404 if product does not exist in database", async () => {
    Product.find = async () => []; // No products found

    const res = await request(server, {
      body: {
        customerName: "Priyanshu Sharma",
        customerPhone: "9876543210",
        deliveryAddress: "123 Connaught Place, New Delhi",
        items: [{ productId: validProductId, quantity: 2 }],
      },
    });

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /not found/i);
  });

  test("returns 400 if product is marked unavailable", async () => {
    Product.find = async () => [
      {
        _id: validProductId,
        name: "Chocolate Truffle Cake",
        isAvailable: false,
        pricePaise: 50000,
        variants: [{ label: "500g", pricePaise: 50000 }],
      },
    ];

    const res = await request(server, {
      body: {
        customerName: "Priyanshu Sharma",
        customerPhone: "9876543210",
        deliveryAddress: "123 Connaught Place, New Delhi",
        items: [{ productId: validProductId, quantity: 1, variantLabel: "500g" }],
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /currently unavailable/i);
  });

  test("successfully creates order and Razorpay order, returning 201 with public keyId", async () => {
    const mockOrderId = new mongoose.Types.ObjectId();

    Product.find = async () => [
      {
        _id: validProductId,
        name: "Chocolate Truffle Cake",
        isAvailable: true,
        pricePaise: 50000,
        variants: [{ label: "500g", pricePaise: 50000 }],
      },
    ];

    let savedRazorpayOrderId = null;
    Order.create = async (orderData) => {
      return {
        _id: mockOrderId,
        ...orderData,
        save: async function () {
          savedRazorpayOrderId = this.razorpayOrderId;
          return this;
        },
      };
    };

    const dummyRzp = new Razorpay({ key_id: "init", key_secret: "init" });
    const ApiProto = dummyRzp.api.constructor.prototype;
    const originalApiPost = ApiProto.post;

    ApiProto.post = async function ({ url, data }) {
      if (url === "/orders") {
        assert.equal(data.currency, "INR");
        assert.ok(data.amount > 0);
        return {
          id: "order_mockRzpOrder999",
          amount: data.amount,
          currency: "INR",
          status: "created",
        };
      }
      return originalApiPost.apply(this, arguments);
    };

    const res = await request(server, {
      body: {
        customerName: "Priyanshu Sharma",
        customerPhone: "9876543210",
        deliveryAddress: "124 Heritage Lane, Civil Lines, Jaipur",
        items: [{ productId: validProductId, quantity: 2, variantLabel: "500g" }],
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.orderId, mockOrderId.toString());
    assert.equal(res.body.data.razorpayOrderId, "order_mockRzpOrder999");
    assert.equal(res.body.data.keyId, "rzp_test_mockKey123");
    // Ensure secret is NEVER sent to client
    assert.equal(res.body.data.keySecret, undefined);
    assert.equal(JSON.stringify(res.body).includes("mockSecretKey456"), false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/verify
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/payments/verify endpoint", () => {
  let server;
  const mockSecret = "test_razorpay_secret_key_789";
  const originalKeyId = process.env.RAZORPAY_KEY_ID;
  const originalKeySecret = process.env.RAZORPAY_KEY_SECRET;
  const originalOrderFindById = Order.findById;

  const validOrderId = new mongoose.Types.ObjectId().toString();

  beforeEach(async () => {
    process.env.RAZORPAY_KEY_ID = "rzp_test_mockKey123";
    process.env.RAZORPAY_KEY_SECRET = mockSecret;
    server = await startServer(createTestApp());
  });

  afterEach(async () => {
    process.env.RAZORPAY_KEY_ID = originalKeyId;
    process.env.RAZORPAY_KEY_SECRET = originalKeySecret;
    Order.findById = originalOrderFindById;
    if (server) await closeServer(server);
  });

  test("rejects request missing razorpaySignature with 400", async () => {
    const res = await request(server, {
      path: "/api/payments/verify",
      body: {
        orderId: validOrderId,
        razorpayOrderId: "order_123",
        razorpayPaymentId: "pay_123",
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /razorpaySignature/i);
  });

  test("rejects invalid orderId format with 400", async () => {
    const res = await request(server, {
      path: "/api/payments/verify",
      body: {
        orderId: "invalid-order-id-format",
        razorpayOrderId: "order_123",
        razorpayPaymentId: "pay_123",
        razorpaySignature: "dummy_sig",
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /not a valid format/i);
  });

  test("returns 404 when order is not found in database", async () => {
    Order.findById = async () => null;

    const res = await request(server, {
      path: "/api/payments/verify",
      body: {
        orderId: validOrderId,
        razorpayOrderId: "order_123",
        razorpayPaymentId: "pay_123",
        razorpaySignature: "dummy_sig",
      },
    });

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /order not found/i);
  });

  test("rejects when razorpayOrderId does not match order record with 400", async () => {
    Order.findById = async () => ({
      _id: validOrderId,
      razorpayOrderId: "order_actual_registered_999",
      paymentStatus: "pending",
    });

    const res = await request(server, {
      path: "/api/payments/verify",
      body: {
        orderId: validOrderId,
        razorpayOrderId: "order_wrong_id",
        razorpayPaymentId: "pay_123",
        razorpaySignature: "dummy_sig",
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /does not match/i);
  });

  test("rejects invalid payment signature with 400 and marks paymentStatus failed", async () => {
    let savedStatus = null;
    Order.findById = async () => ({
      _id: validOrderId,
      razorpayOrderId: "order_target_123",
      paymentStatus: "pending",
      save: async function () {
        savedStatus = this.paymentStatus;
        return this;
      },
    });

    const res = await request(server, {
      path: "/api/payments/verify",
      body: {
        orderId: validOrderId,
        razorpayOrderId: "order_target_123",
        razorpayPaymentId: "pay_xyz_456",
        razorpaySignature: "0000000000000000000000000000000000000000000000000000000000000000",
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /signature verification failed/i);
    assert.equal(savedStatus, "failed");
  });

  test("verifies valid HMAC-SHA256 signature, marks order paid & confirmed, and returns 200", async () => {
    const razorpayOrderId = "order_target_123";
    const razorpayPaymentId = "pay_xyz_456";

    // Generate legitimate signature
    const validSignature = crypto
      .createHmac("sha256", mockSecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    let savedPaymentStatus = null;
    let savedOrderStatus = null;
    let savedPaymentId = null;

    Order.findById = async () => ({
      _id: validOrderId,
      razorpayOrderId,
      paymentStatus: "pending",
      orderStatus: "placed",
      save: async function () {
        savedPaymentStatus = this.paymentStatus;
        savedOrderStatus = this.orderStatus;
        savedPaymentId = this.razorpayPaymentId;
        return this;
      },
    });

    const res = await request(server, {
      path: "/api/payments/verify",
      body: {
        orderId: validOrderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: validSignature,
      },
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.orderId, validOrderId);
    assert.equal(res.body.data.paymentStatus, "paid");
    assert.equal(res.body.data.orderStatus, "confirmed");

    assert.equal(savedPaymentStatus, "paid");
    assert.equal(savedOrderStatus, "confirmed");
    assert.equal(savedPaymentId, razorpayPaymentId);
  });

  test("handles idempotent duplicate verification for already paid order", async () => {
    const razorpayOrderId = "order_target_123";
    const razorpayPaymentId = "pay_xyz_456";

    Order.findById = async () => ({
      _id: validOrderId,
      razorpayOrderId,
      razorpayPaymentId,
      paymentStatus: "paid",
      orderStatus: "confirmed",
    });

    const res = await request(server, {
      path: "/api/payments/verify",
      body: {
        orderId: validOrderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: "any_sig_since_already_paid",
      },
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /already verified/i);
    assert.equal(res.body.data.paymentStatus, "paid");
  });
});
