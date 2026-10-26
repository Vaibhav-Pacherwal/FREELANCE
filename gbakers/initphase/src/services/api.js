/**
 * Gupta Bakers — API Client
 *
 * Thin wrapper around fetch that:
 *  - Reads VITE_API_URL from env (falls back to http://localhost:8080 in dev)
 *  - Checks response.ok before parsing JSON
 *  - Handles non-JSON error bodies (e.g. HTML 502 gateway pages) gracefully
 *  - Propagates meaningful error messages so callers can show them to the user
 *
 * Do NOT add silent mock-data fallbacks here — errors must be visible.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

/**
 * Core fetch helper.  Throws an Error on any non-2xx status or network failure.
 * @param {string} path  – e.g. "/api/products"
 * @param {RequestInit} [options]
 * @returns {Promise<unknown>} Parsed JSON body of a successful response
 */
async function apiFetch(path, options) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (err) {
    throw new Error(
      'Unable to reach the server. Please check your internet connection.',
      { cause: err }
    );
  }

  if (!response.ok) {
    // Try to read a JSON { message } from the backend error body
    let serverMessage = `Request failed (${response.status} ${response.statusText})`;
    try {
      const json = await response.json();
      if (json?.message) serverMessage = json.message;
    } catch {
      // Non-JSON body (e.g. HTML 502) — keep the generic status message
    }
    throw new Error(serverMessage);
  }

  return response.json();
}

// ── Product endpoints ────────────────────────────────────────────────────────

/**
 * Fetch all available products from GET /api/products.
 *
 * Backend response envelope:
 *   { success: true, count: number, data: Product[] }
 *
 * Each Product (backend shape):
 *   _id          string          — MongoDB ObjectId
 *   name         string
 *   description  string
 *   category     string          — singular: "cake" | "bread" | "pastry" | "cookie" | "snack" | "other"
 *   images       string[]        — absolute URLs; may be empty []
 *   pricePaise   number?         — base price in paise; optional when variants exist
 *   variants     { label, pricePaise, sku? }[]
 *   isAvailable  boolean
 *   createdAt    string (ISO)
 *   updatedAt    string (ISO)
 *
 * @returns {Promise<import('./productMapper').UiProduct[]>} Mapped UI products
 */
export async function fetchProducts() {
  const { data } = await apiFetch('/api/products');
  return data;
}
