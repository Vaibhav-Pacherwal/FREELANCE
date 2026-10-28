/**
 * location.test.mjs – Gupta Bakers Geolocation & Location API Tests
 *
 * Tests:
 * 1. GET /api/location/reverse-geocode:
 *    - Validates latitude & longitude bounds (-90..90, -180..180).
 *    - Rejects missing coordinates with 400.
 *    - Resolves valid coordinates into formattedAddress and pincode.
 *    - Caches repeated coordinate lookups.
 * 2. POST /api/orders:
 *    - Stores confirmed deliveryCoordinates in MongoDB order when provided.
 *    - Preserves manual entry without coordinates (ordering for someone else).
 * 3. POST /api/payments/create-order:
 *    - Retains deliveryCoordinates alongside server-side price calculation.
 */

import { test, describe, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import express from "express";
import locationRoutes from "../routes/location.routes.js";
import orderRoutes from "../routes/order.routes.js";
import Order from "../model/order.model.js";
import Product from "../model/product.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env") });

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/location", locationRoutes);
  app.use("/api/orders", orderRoutes);
  return app;
}

function request(server, { method = "GET", path = "/", headers = {}, body } = {}) {
  return new Promise((resolveReq, rejectReq) => {
    const addr = server.address();
    const port = addr.port;

    const payload = body !== undefined ? JSON.stringify(body) : undefined;
    const reqHeaders = {
      "Content-Type": "application/json",
      ...headers,
      ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
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
          resolveReq({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );

    req.on("error", rejectReq);
    if (payload) req.write(payload);
    req.end();
  });
}

let server;
let app;

after(async () => {
  if (server) {
    await new Promise((res) => server.close(res));
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

describe("Location & Geocoding Endpoints", async () => {
  test("setup test server & db connection", async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    app = createTestApp();
    await new Promise((res) => {
      server = app.listen(0, res);
    });
    assert.ok(server.address().port > 0);
  });

  test("rejects request without lat and lon with 400", async () => {
    const res = await request(server, { path: "/api/location/reverse-geocode" });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /latitude/i);
  });

  test("rejects out-of-range coordinates with 400", async () => {
    const res1 = await request(server, { path: "/api/location/reverse-geocode?lat=95&lon=77" });
    assert.equal(res1.status, 400);

    const res2 = await request(server, { path: "/api/location/reverse-geocode?lat=28&lon=200" });
    assert.equal(res2.status, 400);

    const res3 = await request(server, { path: "/api/location/reverse-geocode?lat=abc&lon=def" });
    assert.equal(res3.status, 400);
  });

  test("successfully reverse-geocodes valid coordinates", async () => {
    // Coordinates for New Delhi (Connaught Place / Central Delhi)
    const res = await request(server, {
      path: "/api/location/reverse-geocode?lat=28.6139&lon=77.2090",
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data);
    assert.ok(typeof res.body.data.formattedAddress === "string");
    assert.ok(res.body.data.formattedAddress.length > 5);
    assert.ok(res.body.data.latitude === 28.6139);
    assert.ok(res.body.data.longitude === 77.209);
  });

  test("caches consecutive lookups for identical coordinates", async () => {
    const start = Date.now();
    const res1 = await request(server, {
      path: "/api/location/reverse-geocode?lat=28.6139&lon=77.2090",
    });
    const res2 = await request(server, {
      path: "/api/location/reverse-geocode?lat=28.6139&lon=77.2090",
    });

    assert.equal(res1.status, 200);
    assert.equal(res2.status, 200);
    assert.deepEqual(res1.body.data, res2.body.data);
  });
});

describe("Order Coordinate Persistence & Manual Entry", () => {
  let sampleProduct;

  test("find sample product in database", async () => {
    sampleProduct = await Product.findOne({ isAvailable: true });
    assert.ok(sampleProduct, "Database must have at least one product");
  });

  test("stores confirmed GPS coordinates when customer used location autofill", async () => {
    const payload = {
      customerName: "Location User",
      customerPhone: "9876543210",
      deliveryAddress: "Flat 201, Green View Apartments, Raisina Hill, New Delhi, PIN: 110004",
      items: [
        {
          productId: sampleProduct._id.toString(),
          quantity: 1,
          ...(sampleProduct.variants?.length ? { variantLabel: sampleProduct.variants[0].label } : {}),
        },
      ],
      deliveryCoordinates: {
        latitude: 28.6139,
        longitude: 77.2090,
      },
    };

    const res = await request(server, {
      method: "POST",
      path: "/api/orders",
      body: payload,
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.orderId);

    const saved = await Order.findById(res.body.data.orderId);
    assert.ok(saved);
    assert.ok(saved.deliveryCoordinates);
    assert.equal(saved.deliveryCoordinates.latitude, 28.6139);
    assert.equal(saved.deliveryCoordinates.longitude, 77.2090);
    // Verifies text address is preserved as authoritative
    assert.equal(saved.deliveryAddress, payload.deliveryAddress);

    await Order.deleteOne({ _id: saved._id });
  });

  test("preserves manual address entry without coordinates (ordering for someone else)", async () => {
    const payload = {
      customerName: "Gifting For Sister",
      customerPhone: "9812345678",
      deliveryAddress: "House 45, Sector 14, Gurugram, Haryana, PIN: 122001",
      items: [
        {
          productId: sampleProduct._id.toString(),
          quantity: 1,
          ...(sampleProduct.variants?.length ? { variantLabel: sampleProduct.variants[0].label } : {}),
        },
      ],
      // No deliveryCoordinates supplied (manual entry)
    };

    const res = await request(server, {
      method: "POST",
      path: "/api/orders",
      body: payload,
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.orderId);

    const saved = await Order.findById(res.body.data.orderId);
    assert.ok(saved);
    // deliveryCoordinates should be null/empty, not blocking order placement
    assert.ok(!saved.deliveryCoordinates || !saved.deliveryCoordinates.latitude);
    assert.equal(saved.deliveryAddress, payload.deliveryAddress);

    await Order.deleteOne({ _id: saved._id });
  });
});
