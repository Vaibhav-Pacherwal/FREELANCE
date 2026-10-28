/**
 * Auth Routes – Gupta Bakers
 *
 * Integrates MSG91 OTP Widget access-token verification.
 *
 * POST /api/auth/verify-token
 * Validates the JWT access token received from the MSG91 OTP widget.
 *
 * Security rules:
 *  - MSG91_AUTHKEY is never exposed to the frontend or logged.
 *  - Access tokens are never logged.
 *  - HTTP 200 alone does not prove verification; the response body is explicitly inspected.
 *  - Returns minimal verified status without retrieving or exposing customer profile/address data.
 */

import { Router } from "express";

const router = Router();

const MSG91_VERIFY_URL =
  process.env.MSG91_VERIFY_URL ||
  "https://control.msg91.com/api/v5/widget/verifyAccessToken";

/**
 * Determine if the MSG91 verifyAccessToken response indicates a genuine success.
 *
 * MSG91 may return HTTP 200 with an error payload (e.g. { message: "AuthenticationFailure", type: "error", code: "201" }),
 * so we must strictly inspect status and body fields.
 *
 * @param {number} httpStatus
 * @param {any} body
 * @returns {boolean}
 */
export function isMsg91Success(httpStatus, body) {
  if (httpStatus !== 200 || !body || typeof body !== "object") {
    return false;
  }

  // Explicit failure markers in MSG91 responses
  if (
    body.type === "error" ||
    body.status === "error" ||
    body.type === "failure" ||
    body.status === "failure" ||
    body.message === "AuthenticationFailure"
  ) {
    return false;
  }

  // Explicit success markers
  if (body.type === "success" || body.status === "success") {
    return true;
  }

  // If identifier (mobile/contact) is returned and no error type is present
  if (body.mobile || body.data?.mobile || body.contact) {
    return true;
  }

  return false;
}

/**
 * Route handler for verifying MSG91 OTP widget access token.
 */
async function handleVerifyToken(req, res) {
  // ── 1. Validate request payload ──────────────────────────────────────────
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      success: false,
      message: "Invalid request payload. Expected JSON body.",
    });
  }

  const rawToken =
    req.body.accessToken ??
    req.body["access-token"] ??
    req.body.token;

  if (!rawToken || typeof rawToken !== "string" || !rawToken.trim()) {
    return res.status(400).json({
      success: false,
      message: "accessToken is required and must be a non-empty string.",
    });
  }

  const token = rawToken.trim();

  // ── 2. Check MSG91 Authkey configuration ─────────────────────────────────
  const authkey = process.env.MSG91_AUTHKEY?.trim();
  if (!authkey) {
    console.error("[auth] MSG91_AUTHKEY is not configured in the environment.");
    return res.status(503).json({
      success: false,
      message: "OTP verification service is not configured.",
    });
  }

  // ── 3. Call MSG91 verifyAccessToken API ──────────────────────────────────
  let msg91Response;
  try {
    msg91Response = await fetch(MSG91_VERIFY_URL, {
      method: "POST",
      headers: {
        authkey: authkey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        authkey: authkey,
        "access-token": token,
      }),
    });
  } catch (err) {
    // Log safe error without secrets or tokens
    console.error("[auth] Network error communicating with MSG91:", err.message);
    return res.status(502).json({
      success: false,
      message: "Unable to reach OTP verification service. Please try again later.",
    });
  }

  // ── 4. Parse response body ───────────────────────────────────────────────
  let responseBody;
  try {
    responseBody = await msg91Response.json();
  } catch {
    console.error(
      `[auth] MSG91 returned non-JSON response. HTTP status: ${msg91Response.status}`
    );
    return res.status(502).json({
      success: false,
      message: "Invalid response received from OTP verification provider.",
    });
  }

  // ── 5. Evaluate verification outcome ─────────────────────────────────────
  const verified = isMsg91Success(msg91Response.status, responseBody);

  if (!verified) {
    // Check for provider configuration/permission notices without leaking keys
    if (typeof responseBody?.message === "string") {
      const msgLower = responseBody.message.toLowerCase();
      if (
        msgLower.includes("ip") ||
        msgLower.includes("whitelist") ||
        msgLower.includes("permission") ||
        msgLower.includes("authkey")
      ) {
        console.warn(`[auth] MSG91 provider notice: ${responseBody.message}`);
      }
    }

    if (msg91Response.status >= 500) {
      return res.status(502).json({
        success: false,
        message: "OTP verification provider encountered an error. Please try again.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "OTP verification failed. Token is invalid or expired.",
    });
  }

  // ── 6. Return minimal verified response ──────────────────────────────────
  // Extract verified mobile if present; do not expose or fetch user profile or addresses.
  const verifiedMobile =
    responseBody.mobile ??
    responseBody.data?.mobile ??
    responseBody.contact ??
    null;

  return res.status(200).json({
    success: true,
    message: "Token verified successfully.",
    data: {
      verified: true,
      ...(verifiedMobile ? { mobile: String(verifiedMobile) } : {}),
    },
  });
}

router.post("/verify-token", handleVerifyToken);
router.post("/verify-otp", handleVerifyToken);

export default router;
