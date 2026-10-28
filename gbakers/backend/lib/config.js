/**
 * Shared server configuration – Gupta Bakers
 *
 * Single source of truth for constants that are referenced by more than one
 * module (middleware, route handlers, etc.).  Change values here; do not
 * duplicate them in individual files.
 */

// ── CORS ──────────────────────────────────────────────────────────────────
// List of browser origins that are permitted to call this API.
//
// Development:
//   http://localhost:5173  — Vite default dev server
//
// Production:
//   Deployed frontend URL:
//   "https://freelance-ke5z.vercel.app"
//
// NEVER add a wildcard ("*") here — this API handles payment data.
export const ALLOWED_ORIGINS = [
  "http://localhost:5173", // Vite dev server (React frontend)
  "https://freelance-ke5z.vercel.app", // Production Vercel frontend
  ...(process.env.CLIENT_URL && !["http://localhost:5173", "https://freelance-ke5z.vercel.app"].includes(process.env.CLIENT_URL.replace(/\/+$/, ""))
    ? [process.env.CLIENT_URL.replace(/\/+$/, "")]
    : []),
];

// ── Request body ──────────────────────────────────────────────────────────
// Maximum JSON body size accepted by express.json().
// 50 kB is generous for any legitimate bakery order payload.
// Adjust upward only if you add file-upload endpoints (use multipart for those).
export const JSON_BODY_LIMIT = "50kb";

// ── Order quantities ──────────────────────────────────────────────────────
// Maximum units of a single product a customer may order in one request.
// Prevents both accidental large orders and resource-exhaustion attacks
// (a huge quantity multiplied server-side still costs CPU and DB writes).
export const MAX_QUANTITY_PER_ITEM = 50;
