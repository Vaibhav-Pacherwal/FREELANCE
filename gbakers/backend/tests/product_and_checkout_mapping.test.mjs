/**
 * product_and_checkout_mapping.test.mjs
 *
 * Automated verification suite for:
 * 1. Seeded MongoDB products and GET /api/products response envelope.
 * 2. Real MongoDB ObjectIds on all product records.
 * 3. Frontend productMapper conversion (paise -> rupees, _id preservation, image fallbacks, tags).
 * 4. Cart item construction retaining MongoDB _id.
 * 5. Cart-to-checkout payload mapping: { items: [{ productId: '<MongoDB _id>', quantity: 1 }] }.
 * 6. Server-side price and order validation with real seeded MongoDB IDs.
 */

import { test, describe, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import Product from "../model/product.model.js";
import Order from "../model/order.model.js";
import { mapProduct, mapProducts } from "../../initphase/src/services/productMapper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env") });

const OID_REGEX = /^[0-9a-fA-F]{24}$/;

function request(url, { method = "GET", headers = {}, body } = {}) {
  return new Promise((resolveReq, rejectReq) => {
    const parsedUrl = new URL(url);
    const payload = body !== undefined ? JSON.stringify(body) : undefined;
    const reqHeaders = {
      "Content-Type": "application/json",
      ...headers,
      ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
    };

    const req = http.request(
      {
        host: parsedUrl.hostname,
        port: parsedUrl.port || 80,
        path: parsedUrl.pathname + parsedUrl.search,
        method,
        headers: reqHeaders,
      },
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
          resolveReq({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );

    req.on("error", rejectReq);
    if (payload) req.write(payload);
    req.end();
  });
}

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

describe("1. Seeded Products & MongoDB Verification", async () => {
  test("MongoDB contains at least 13 seeded products adhering to Product schema", async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    const products = await Product.find({ isAvailable: true });
    assert.ok(products.length >= 13, `Expected at least 13 products, found ${products.length}`);

    const supportedCategories = ["cake", "bread", "pastry", "cookie", "snack", "other"];

    for (const p of products) {
      assert.ok(OID_REGEX.test(p._id.toString()), `Product ${p.name} must have valid ObjectId`);
      assert.ok(p.name && typeof p.name === "string", "Product name must be non-empty string");
      assert.ok(supportedCategories.includes(p.category), `Invalid category ${p.category} on ${p.name}`);
      assert.ok(Number.isInteger(p.pricePaise) && p.pricePaise >= 1, `Invalid pricePaise on ${p.name}`);
      assert.ok(Array.isArray(p.variants) && p.variants.length > 0, `Variants missing on ${p.name}`);

      for (const v of p.variants) {
        assert.ok(v.label && typeof v.label === "string", `Variant label required on ${p.name}`);
        assert.ok(Number.isInteger(v.pricePaise) && v.pricePaise >= 1, `Variant price must be paise on ${p.name}`);
      }
    }
  });

  test("GET /api/products returns all products with real MongoDB _id strings", async () => {
    const res = await request("http://localhost:8080/api/products");
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.count >= 13);
    assert.ok(Array.isArray(res.body.data));

    for (const item of res.body.data) {
      assert.ok(OID_REGEX.test(item._id), `_id "${item._id}" must be a 24-character hexadecimal ObjectId`);
    }
  });

  test("GET /api/products/:id retrieves a single product by MongoDB ObjectId", async () => {
    const listRes = await request("http://localhost:8080/api/products");
    const firstProduct = listRes.body.data[0];

    const detailRes = await request(`http://localhost:8080/api/products/${firstProduct._id}`);
    assert.equal(detailRes.status, 200);
    assert.equal(detailRes.body.success, true);
    assert.equal(detailRes.body.data._id, firstProduct._id);
    assert.equal(detailRes.body.data.name, firstProduct.name);
  });
});

describe("2. Frontend Product Mapper & Cart Behavior", () => {
  const sampleRawDoc = {
    _id: "6ae0a1f2361ea5fbfec3cd54",
    name: "Chocolate Truffle Cake",
    description: "Layers of rich chocolate sponge enrobed in silky dark truffle ganache.",
    category: "cake",
    images: [],
    pricePaise: 65000,
    variants: [
      { label: "500 g", pricePaise: 65000, sku: "choc-truffle-cake-500g" },
      { label: "1 kg", pricePaise: 120000, sku: "choc-truffle-cake-1kg" },
    ],
    isAvailable: true,
  };

  test("mapProduct preserves MongoDB _id in both id and _id fields", () => {
    const mapped = mapProduct(sampleRawDoc);
    assert.equal(mapped.id, "6ae0a1f2361ea5fbfec3cd54");
    assert.equal(mapped._id, "6ae0a1f2361ea5fbfec3cd54");
    assert.ok(OID_REGEX.test(mapped.id));
  });

  test("mapProduct converts paise to INR rupees for formatPrice", () => {
    const mapped = mapProduct(sampleRawDoc);
    assert.equal(mapped.variants[0].price, 650);
    assert.equal(mapped.variants[1].price, 1200);
  });

  test("mapProduct identifies bestseller items and assigns tags", () => {
    const mapped = mapProduct(sampleRawDoc);
    assert.ok(mapped.tags.includes("bestseller"), "Chocolate Truffle Cake should have bestseller tag");
  });

  test("mapProduct assigns photography fallback when images array is empty", () => {
    const mapped = mapProduct(sampleRawDoc);
    assert.equal(mapped.image, "/images/cat-brownies.jpg");
  });
});

describe("3. Cart-to-Checkout Payload Mapping & Order Validation", () => {
  test("cart items retain real MongoDB _id and checkout maps { items: [{ productId, quantity }] }", async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    // 1. Fetch live products from backend
    const listRes = await request("http://localhost:8080/api/products");
    const rawProducts = listRes.body.data;
    const mappedProducts = mapProducts(rawProducts);

    // 2. Select two products from different categories
    const cake = mappedProducts.find((p) => p.name === "Chocolate Truffle Cake");
    const cookie = mappedProducts.find((p) => p.name === "Chocolate Chip Cookie");

    assert.ok(cake, "Chocolate Truffle Cake must exist");
    assert.ok(cookie, "Chocolate Chip Cookie must exist");

    // 3. Simulate adding to cart in frontend CartContext
    const cartItems = [
      {
        key: `${cake.id}-${cake.variants[0].label}`,
        product: cake,
        variant: cake.variants[0],
        quantity: 1,
      },
      {
        key: `${cookie.id}-${cookie.variants[0].label}`,
        product: cookie,
        variant: cookie.variants[0],
        quantity: 2,
      },
    ];

    // Assert cart items retain real MongoDB _id
    assert.ok(OID_REGEX.test(cartItems[0].product.id));
    assert.ok(OID_REGEX.test(cartItems[0].product._id));
    assert.ok(OID_REGEX.test(cartItems[1].product.id));
    assert.ok(OID_REGEX.test(cartItems[1].product._id));

    // 4. Map cart items to checkout order payload (as done in CheckoutPage.jsx)
    const orderPayloadItems = cartItems.map((item) => {
      const prodId = item.product._id || item.product.id;
      const payloadItem = {
        productId: String(prodId),
        quantity: Number(item.quantity),
      };
      if (item.variant?.label && item.variant.label !== "Standard") {
        payloadItem.variantLabel = item.variant.label;
      }
      return payloadItem;
    });

    assert.deepEqual(orderPayloadItems, [
      {
        productId: cake.id,
        quantity: 1,
        variantLabel: cake.variants[0].label,
      },
      {
        productId: cookie.id,
        quantity: 2,
        variantLabel: cookie.variants[0].label,
      },
    ]);

    // 5. Test checkout submission against live backend API: POST /api/orders
    const orderPayload = {
      customerName: "Test Customer",
      customerPhone: "9876543210",
      deliveryAddress: "123 Baker Street, New Delhi, PIN: 110001 | Delivery Date: 2026-10-30",
      items: orderPayloadItems,
    };

    const orderRes = await request("http://localhost:8080/api/orders", {
      method: "POST",
      body: orderPayload,
    });

    assert.equal(orderRes.status, 201, `Order creation should return 201: ${JSON.stringify(orderRes.body)}`);
    assert.equal(orderRes.body.success, true);
    assert.ok(orderRes.body.data.orderId, "Order must return an orderId");

    // Server-side calculated totals:
    // cake: 1 * 65000 = 65000 paise
    // cookie: 2 * 8000 = 16000 paise
    // subtotal = 81000 paise (₹810)
    // delivery fee = 0 paise (since subtotal ₹810 >= ₹500 free threshold)
    // total = 81000 paise
    assert.equal(orderRes.body.data.subtotalPaise, 81000);
    assert.equal(orderRes.body.data.totalPaise, 81000);

    // Verify persisted DB order contains real MongoDB product IDs and server-resolved pricing
    const savedOrder = await Order.findById(orderRes.body.data.orderId);
    assert.ok(savedOrder);
    assert.equal(savedOrder.items.length, 2);
    assert.equal(savedOrder.items[0].productId.toString(), cake.id);
    assert.equal(savedOrder.items[0].unitPricePaise, 65000);
    assert.equal(savedOrder.items[1].productId.toString(), cookie.id);
    assert.equal(savedOrder.items[1].unitPricePaise, 8000);

    // Clean up test order
    await Order.deleteOne({ _id: savedOrder._id });
  });

  test("server-side price validation rejects altered or client-fabricated prices", async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    const listRes = await request("http://localhost:8080/api/products");
    const cake = listRes.body.data.find((p) => p.name === "Chocolate Truffle Cake");

    // Client attempts to pass a fake low unitPricePaise (e.g. 1 rupee)
    const maliciousPayload = {
      customerName: "Sneaky Buyer",
      customerPhone: "9876543210",
      deliveryAddress: "456 Market Road, PIN: 110001",
      items: [
        {
          productId: cake._id,
          quantity: 1,
          variantLabel: "500 g",
          unitPricePaise: 100, // Attacker claims ₹1.00 instead of ₹650.00
        },
      ],
    };

    const res = await request("http://localhost:8080/api/orders", {
      method: "POST",
      body: maliciousPayload,
    });

    assert.equal(res.status, 201);
    // Server ignores client-supplied unitPricePaise and enforces server-stored price of 65000
    assert.equal(res.body.data.subtotalPaise, 65000);
    assert.notEqual(res.body.data.subtotalPaise, 100);

    // Clean up test order
    await Order.deleteOne({ _id: res.body.data.orderId });
  });
});
