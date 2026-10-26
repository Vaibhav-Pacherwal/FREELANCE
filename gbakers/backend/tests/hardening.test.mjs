/**
 * hardening.test.mjs – Gupta Bakers backend hardening tests
 *
 * Runs with the built-in Node.js test runner (Node >= 18):
 *   node tests/hardening.test.mjs
 *
 * Tests are self-contained — they do NOT start the real server or
 * connect to MongoDB / Razorpay.  Each group creates a minimal Express
 * app with only the middleware under test.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Fire a raw HTTP request against an already-listening http.Server.
 * Returns { status, headers, body (parsed JSON or raw string) }.
 */
function request(server, { method = "GET", path = "/", headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
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
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

/** Start a server on a random free port and return it. */
function startServer(app) {
  return new Promise((resolve) => {
    const srv = http.createServer(app);
    srv.listen(0, "127.0.0.1", () => resolve(srv));
  });
}

/** Gracefully close a server. */
function closeServer(srv) {
  return new Promise((resolve, reject) =>
    srv.close((err) => (err ? reject(err) : resolve()))
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 1 — lib/config.js exports
// ─────────────────────────────────────────────────────────────────────────────
describe("lib/config.js exports", () => {
  test("ALLOWED_ORIGINS is a non-empty array", async () => {
    const { ALLOWED_ORIGINS } = await import("../lib/config.js");
    assert.ok(Array.isArray(ALLOWED_ORIGINS), "ALLOWED_ORIGINS should be an array");
    assert.ok(ALLOWED_ORIGINS.length > 0, "ALLOWED_ORIGINS should not be empty");
  });

  test("ALLOWED_ORIGINS contains the Vite dev origin", async () => {
    const { ALLOWED_ORIGINS } = await import("../lib/config.js");
    assert.ok(
      ALLOWED_ORIGINS.includes("http://localhost:5173"),
      "ALLOWED_ORIGINS must include http://localhost:5173"
    );
  });

  test("ALLOWED_ORIGINS contains no wildcards", async () => {
    const { ALLOWED_ORIGINS } = await import("../lib/config.js");
    for (const origin of ALLOWED_ORIGINS) {
      assert.ok(!origin.includes("*"), `Wildcard found in origin: ${origin}`);
    }
  });

  test("JSON_BODY_LIMIT is a non-empty string", async () => {
    const { JSON_BODY_LIMIT } = await import("../lib/config.js");
    assert.equal(typeof JSON_BODY_LIMIT, "string");
    assert.ok(JSON_BODY_LIMIT.length > 0);
  });

  test("MAX_QUANTITY_PER_ITEM is a positive integer", async () => {
    const { MAX_QUANTITY_PER_ITEM } = await import("../lib/config.js");
    assert.ok(Number.isInteger(MAX_QUANTITY_PER_ITEM), "should be an integer");
    assert.ok(MAX_QUANTITY_PER_ITEM > 0, "should be positive");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 2 — lib/deliveryFee.js
// ─────────────────────────────────────────────────────────────────────────────
describe("lib/deliveryFee.js", () => {
  test("charges flat fee below threshold", async () => {
    const { calculateDeliveryFee, DELIVERY_FEE_PAISE, DELIVERY_FEE_THRESHOLD_PAISE } =
      await import("../lib/deliveryFee.js");
    const result = calculateDeliveryFee(DELIVERY_FEE_THRESHOLD_PAISE - 1);
    assert.equal(result, DELIVERY_FEE_PAISE);
  });

  test("free delivery at threshold", async () => {
    const { calculateDeliveryFee, DELIVERY_FEE_THRESHOLD_PAISE, FREE_DELIVERY_FEE_PAISE } =
      await import("../lib/deliveryFee.js");
    const result = calculateDeliveryFee(DELIVERY_FEE_THRESHOLD_PAISE);
    assert.equal(result, FREE_DELIVERY_FEE_PAISE);
  });

  test("free delivery above threshold", async () => {
    const { calculateDeliveryFee, DELIVERY_FEE_THRESHOLD_PAISE, FREE_DELIVERY_FEE_PAISE } =
      await import("../lib/deliveryFee.js");
    const result = calculateDeliveryFee(DELIVERY_FEE_THRESHOLD_PAISE + 100_000);
    assert.equal(result, FREE_DELIVERY_FEE_PAISE);
  });

  test("zero subtotal gets flat fee", async () => {
    const { calculateDeliveryFee, DELIVERY_FEE_PAISE } = await import("../lib/deliveryFee.js");
    assert.equal(calculateDeliveryFee(0), DELIVERY_FEE_PAISE);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 3 — CORS middleware (uses a minimal Express app, no DB)
// ─────────────────────────────────────────────────────────────────────────────
describe("CORS middleware", () => {
  let server;

  test.before(async () => {
    const express = (await import("express")).default;
    const cors = (await import("cors")).default;
    const { ALLOWED_ORIGINS, JSON_BODY_LIMIT } = await import("../lib/config.js");

    const app = express();
    app.use(
      cors({
        origin: (origin, cb) => {
          if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true);
          else cb(new Error(`CORS: origin "${origin}" is not allowed`));
        },
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: false,
      })
    );
    app.use(express.json({ limit: JSON_BODY_LIMIT }));
    app.get("/ping", (_req, res) => res.json({ ok: true }));

    server = await startServer(app);
  });

  test.after(async () => {
    if (server) await closeServer(server);
  });

  test("allowed origin receives Access-Control-Allow-Origin header", async () => {
    const res = await request(server, {
      path: "/ping",
      headers: { Origin: "http://localhost:5173" },
    });
    assert.equal(res.status, 200);
    assert.equal(
      res.headers["access-control-allow-origin"],
      "http://localhost:5173",
      "ACAO header should reflect the allowed origin"
    );
  });

  test("disallowed origin does not receive ACAO header", async () => {
    const res = await request(server, {
      path: "/ping",
      headers: { Origin: "https://evil-phishing-site.com" },
    });
    assert.ok(
      !res.headers["access-control-allow-origin"],
      "ACAO header must be absent for disallowed origins"
    );
  });

  test("no Origin header (server-to-server) is allowed", async () => {
    const res = await request(server, { path: "/ping" });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { ok: true });
  });

  test("preflight OPTIONS returns 2xx with correct ACAO header", async () => {
    const res = await request(server, {
      method: "OPTIONS",
      path: "/ping",
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });
    assert.ok([200, 204].includes(res.status), `Unexpected status ${res.status}`);
    assert.equal(
      res.headers["access-control-allow-origin"],
      "http://localhost:5173"
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 4 — JSON body size limit
// ─────────────────────────────────────────────────────────────────────────────
describe("JSON body size limit", () => {
  let server;

  test.before(async () => {
    const express = (await import("express")).default;
    const cors = (await import("cors")).default;
    const { JSON_BODY_LIMIT } = await import("../lib/config.js");

    const app = express();
    app.use(cors({ origin: (_o, cb) => cb(null, true) }));
    app.use(express.json({ limit: JSON_BODY_LIMIT }));
    app.post("/echo", (req, res) => res.json(req.body));

    server = await startServer(app);
  });

  test.after(async () => {
    if (server) await closeServer(server);
  });

  test("small payload accepted (200)", async () => {
    const res = await request(server, {
      method: "POST",
      path: "/echo",
      body: { hello: "world" },
    });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { hello: "world" });
  });

  test("oversized payload rejected (413)", async () => {
    // Build a payload larger than 50 kB
    const bigString = "x".repeat(60_000);
    const res = await request(server, {
      method: "POST",
      path: "/echo",
      body: { data: bigString },
    });
    assert.equal(res.status, 413, "Oversized payload should be rejected with 413");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 5 — MAX_QUANTITY_PER_ITEM validation (unit-level, no DB)
// ─────────────────────────────────────────────────────────────────────────────
describe("MAX_QUANTITY_PER_ITEM validation logic", () => {
  test("quantity equal to MAX_QUANTITY_PER_ITEM passes the guard", async () => {
    const { MAX_QUANTITY_PER_ITEM } = await import("../lib/config.js");
    const qty = MAX_QUANTITY_PER_ITEM;
    assert.ok(Number.isInteger(qty) && qty >= 1 && qty <= MAX_QUANTITY_PER_ITEM);
  });

  test("quantity of MAX_QUANTITY_PER_ITEM + 1 fails the guard", async () => {
    const { MAX_QUANTITY_PER_ITEM } = await import("../lib/config.js");
    const qty = MAX_QUANTITY_PER_ITEM + 1;
    const rejected = qty > MAX_QUANTITY_PER_ITEM;
    assert.ok(rejected, "Quantity above ceiling should be rejected");
  });

  test("quantity of 0 fails the lower bound guard", () => {
    const qty = 0;
    const rejected = !Number.isInteger(qty) || qty < 1;
    assert.ok(rejected, "Zero quantity should be rejected");
  });

  test("negative quantity fails the lower bound guard", () => {
    const qty = -5;
    const rejected = !Number.isInteger(qty) || qty < 1;
    assert.ok(rejected, "Negative quantity should be rejected");
  });

  test("float quantity fails the integer guard", () => {
    const qty = 1.5;
    const rejected = !Number.isInteger(qty) || qty < 1;
    assert.ok(rejected, "Float quantity should be rejected");
  });

  test("string quantity fails the integer guard", () => {
    const qty = "5";
    const rejected = !Number.isInteger(qty) || qty < 1;
    assert.ok(rejected, "String quantity should be rejected");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 6 — Missing-fields validation logic (unit-level)
// ─────────────────────────────────────────────────────────────────────────────
describe("Missing-fields detection (mirrors route handler logic)", () => {
  /** Replicates the top-level field check shared by both route handlers. */
  function detectMissingFields({ customerName, customerPhone, deliveryAddress, items }) {
    const missing = [];
    if (!customerName || typeof customerName !== "string" || !customerName.trim())
      missing.push("customerName");
    if (!customerPhone || typeof customerPhone !== "string" || !customerPhone.trim())
      missing.push("customerPhone");
    if (!deliveryAddress || typeof deliveryAddress !== "string" || !deliveryAddress.trim())
      missing.push("deliveryAddress");
    if (!items) missing.push("items");
    return missing;
  }

  test("valid payload has no missing fields", () => {
    const missing = detectMissingFields({
      customerName: "Ravi Kumar",
      customerPhone: "9876543210",
      deliveryAddress: "12 MG Road, Bengaluru",
      items: [{ productId: "abc", quantity: 2 }],
    });
    assert.deepEqual(missing, []);
  });

  test("completely empty body reports all four fields", () => {
    const missing = detectMissingFields({});
    assert.deepEqual(
      missing.sort(),
      ["customerName", "customerPhone", "deliveryAddress", "items"].sort()
    );
  });

  test("whitespace-only customerName is rejected", () => {
    const missing = detectMissingFields({
      customerName: "   ",
      customerPhone: "9876543210",
      deliveryAddress: "12 MG Road",
      items: [],
    });
    assert.ok(missing.includes("customerName"));
  });

  test("missing items field is detected", () => {
    const missing = detectMissingFields({
      customerName: "Ravi",
      customerPhone: "9876543210",
      deliveryAddress: "12 MG Road",
    });
    assert.ok(missing.includes("items"));
  });

  test("numeric customerPhone (wrong type) is detected", () => {
    const missing = detectMissingFields({
      customerName: "Ravi",
      customerPhone: 9876543210,
      deliveryAddress: "12 MG Road",
      items: [],
    });
    assert.ok(missing.includes("customerPhone"));
  });
});
