/**
 * auth.test.mjs – Gupta Bakers auth routes & MSG91 OTP token verification tests
 *
 * Runs with Node.js test runner:
 *   node --test tests/auth.test.mjs
 *
 * Tests are self-contained and mock external fetch calls.
 */

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import authRoutes, { isMsg91Success } from "../routes/auth.routes.js";

// ── helpers ──────────────────────────────────────────────────────────────────

function request(server, { method = "POST", path = "/api/auth/verify-token", headers = {}, body } = {}) {
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
  app.use("/api/auth", authRoutes);
  return app;
}

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 1 – Unit tests for isMsg91Success logic
// ─────────────────────────────────────────────────────────────────────────────
describe("isMsg91Success helper", () => {
  test("returns true for status 200 with type 'success'", () => {
    assert.equal(
      isMsg91Success(200, { type: "success", message: "Token verified" }),
      true
    );
  });

  test("returns true for status 200 with status 'success'", () => {
    assert.equal(
      isMsg91Success(200, { status: "success", mobile: "919876543210" }),
      true
    );
  });

  test("returns true for status 200 with mobile data and no error type", () => {
    assert.equal(
      isMsg91Success(200, { data: { mobile: "919876543210" } }),
      true
    );
  });

  test("returns false for status 200 with type 'error' (e.g. AuthenticationFailure)", () => {
    assert.equal(
      isMsg91Success(200, { message: "AuthenticationFailure", type: "error", code: "201" }),
      false
    );
  });

  test("returns false for status 200 with code 418 error", () => {
    assert.equal(
      isMsg91Success(200, { message: "AuthenticationFailure", type: "error", code: "418" }),
      false
    );
  });

  test("returns false for status 200 with status 'error'", () => {
    assert.equal(
      isMsg91Success(200, { status: "error", message: "Invalid access token" }),
      false
    );
  });

  test("returns false for status 200 with status 'failure'", () => {
    assert.equal(
      isMsg91Success(200, { status: "failure", message: "Verification failed" }),
      false
    );
  });

  test("returns false for non-200 HTTP statuses", () => {
    assert.equal(isMsg91Success(400, { type: "success" }), false);
    assert.equal(isMsg91Success(401, { type: "success" }), false);
    assert.equal(isMsg91Success(500, { type: "success" }), false);
    assert.equal(isMsg91Success(502, {}), false);
  });

  test("returns false for non-object bodies", () => {
    assert.equal(isMsg91Success(200, null), false);
    assert.equal(isMsg91Success(200, "OK"), false);
    assert.equal(isMsg91Success(200, undefined), false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 2 – Route integration tests (mocking external fetch)
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/auth/verify-token endpoint", () => {
  const originalFetch = globalThis.fetch;
  const originalAuthKey = process.env.MSG91_AUTHKEY;
  let server;

  beforeEach(async () => {
    process.env.MSG91_AUTHKEY = "test_mock_authkey_12345";
    server = await startServer(createTestApp());
  });

  afterEach(async () => {
    globalThis.fetch = originalFetch;
    process.env.MSG91_AUTHKEY = originalAuthKey;
    if (server) await closeServer(server);
  });

  test("successfully verifies valid token and returns minimal result", async () => {
    let capturedUrl;
    let capturedHeaders;
    let capturedBody;

    globalThis.fetch = async (url, options) => {
      capturedUrl = url;
      capturedHeaders = options.headers;
      capturedBody = JSON.parse(options.body);

      return {
        status: 200,
        ok: true,
        json: async () => ({
          type: "success",
          message: "Token verified successfully",
          data: { mobile: "919876543210" },
        }),
      };
    };

    const res = await request(server, {
      body: { accessToken: "mock_valid_jwt_token_abc" },
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.verified, true);
    assert.equal(res.body.data.mobile, "919876543210");
    // Verify no customer profile or address is returned
    assert.equal(res.body.data.addresses, undefined);
    assert.equal(res.body.data.user, undefined);

    // Verify external request shape
    assert.equal(capturedUrl, "https://control.msg91.com/api/v5/widget/verifyAccessToken");
    assert.equal(capturedHeaders.authkey, "test_mock_authkey_12345");
    assert.equal(capturedHeaders["Content-Type"], "application/json");
    assert.equal(capturedHeaders.Accept, "application/json");
    assert.equal(capturedBody.authkey, "test_mock_authkey_12345");
    assert.equal(capturedBody["access-token"], "mock_valid_jwt_token_abc");
  });

  test("accepts hyphenated 'access-token' field in request body", async () => {
    let capturedUrl;
    let capturedHeaders;
    let capturedBody;

    globalThis.fetch = async (url, options) => {
      capturedUrl = url;
      capturedHeaders = options.headers;
      capturedBody = JSON.parse(options.body);
      return {
        status: 200,
        ok: true,
        json: async () => ({
          type: "success",
          mobile: "919876543210",
        }),
      };
    };

    const res = await request(server, {
      body: { "access-token": "hyphenated_token_value" },
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.verified, true);
    assert.equal(res.body.data.mobile, "919876543210");
    assert.equal(capturedUrl, "https://control.msg91.com/api/v5/widget/verifyAccessToken");
    assert.equal(capturedHeaders.Accept, "application/json");
    assert.equal(capturedBody.authkey, "test_mock_authkey_12345");
    assert.equal(capturedBody["access-token"], "hyphenated_token_value");
  });

  test("rejects token when MSG91 returns HTTP 200 with AuthenticationFailure error body", async () => {
    globalThis.fetch = async () => ({
      status: 200,
      ok: true,
      json: async () => ({
        message: "AuthenticationFailure",
        type: "error",
        code: "201",
      }),
    });

    const res = await request(server, {
      body: { accessToken: "expired_or_invalid_token" },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /invalid or expired/i);
    // Ensure no secrets leaked
    assert.equal(JSON.stringify(res.body).includes("test_mock_authkey"), false);
  });

  test("rejects malformed requests with missing accessToken", async () => {
    const res = await request(server, {
      body: {},
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /accessToken is required/i);
  });

  test("rejects malformed requests with whitespace-only accessToken", async () => {
    const res = await request(server, {
      body: { accessToken: "    " },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /accessToken is required/i);
  });

  test("rejects malformed requests with non-string accessToken", async () => {
    const res = await request(server, {
      body: { accessToken: 12345 },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /non-empty string/i);
  });

  test("handles provider network failure (fetch throws) by returning 502", async () => {
    globalThis.fetch = async () => {
      throw new Error("Connection refused (ECONNREFUSED)");
    };

    const res = await request(server, {
      body: { accessToken: "valid_token" },
    });

    assert.equal(res.status, 502);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /unable to reach/i);
  });

  test("handles provider returning non-JSON response by returning 502", async () => {
    globalThis.fetch = async () => ({
      status: 502,
      ok: false,
      json: async () => {
        throw new Error("Unexpected token < in JSON at position 0");
      },
    });

    const res = await request(server, {
      body: { accessToken: "valid_token" },
    });

    assert.equal(res.status, 502);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /invalid response/i);
  });

  test("handles provider HTTP 500 error by returning 502", async () => {
    globalThis.fetch = async () => ({
      status: 500,
      ok: false,
      json: async () => ({
        type: "error",
        message: "Internal server error at provider",
      }),
    });

    const res = await request(server, {
      body: { accessToken: "valid_token" },
    });

    assert.equal(res.status, 502);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /provider encountered an error/i);
  });

  test("returns 503 when MSG91_AUTHKEY is not configured", async () => {
    delete process.env.MSG91_AUTHKEY;

    const res = await request(server, {
      body: { accessToken: "valid_token" },
    });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /not configured/i);
  });
});
