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
// ── Payment & Order endpoints ───────────────────────────────────────────────

/**
 * Create a pending internal order in MongoDB and a linked Razorpay order.
 *
 * @param {{
 *   customerName: string,
 *   customerPhone: string,
 *   deliveryAddress: string,
 *   items: { productId: string, quantity: number, variantLabel?: string }[]
 * }} payload
 * @returns {Promise<{
 *   orderId: string,
 *   razorpayOrderId: string,
 *   totalPaise: number,
 *   totalRupees: string,
 *   currency: string,
 *   keyId: string
 * }>}
 */
export async function createPaymentOrder(payload) {
  const result = await apiFetch('/api/payments/create-order', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!result?.success || !result?.data) {
    throw new Error(result?.message || 'Failed to initiate payment.');
  }

  return result.data;
}

/**
 * Verify Razorpay payment signature server-side and mark order as paid.
 *
 * @param {{
 *   orderId: string,
 *   razorpayOrderId: string,
 *   razorpayPaymentId: string,
 *   razorpaySignature: string
 * }} payload
 * @returns {Promise<{
 *   orderId: string,
 *   paymentStatus: string,
 *   orderStatus: string
 * }>}
 */
export async function verifyPayment(payload) {
  const result = await apiFetch('/api/payments/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!result?.success || !result?.data) {
    throw new Error(result?.message || 'Payment verification failed.');
  }

  return result.data;
}

// ── Geolocation & Address Lookup ───────────────────────────────────────────

/**
 * Reverse-geocode latitude and longitude into a readable address and PIN code.
 *
 * Checks backend API first (which queries OpenStreetMap Nominatim with caching
 * and proper User-Agent attribution); falls back to client-side BigDataCloud
 * reverse geocoding if backend is unreachable or returns 502/timeout.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{
 *   formattedAddress: string,
 *   pincode: string,
 *   city?: string,
 *   state?: string
 * }>}
 */
export async function reverseGeocode(latitude, longitude) {
  // 1. Try our backend proxy route first
  try {
    const result = await apiFetch(
      `/api/location/reverse-geocode?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`
    );
    if (result?.success && result?.data?.formattedAddress) {
      return result.data;
    }
  } catch (err) {
    console.warn('[location] Backend reverse-geocode failed, trying client fallback:', err.message);
  }

  // 2. Client-side fallback via BigDataCloud client API (free, CORS-enabled, no API key)
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
        latitude
      )}&longitude=${encodeURIComponent(longitude)}&localityLanguage=en`
    );
    if (response.ok) {
      const data = await response.json();
      const parts = [
        data.locality,
        data.city,
        data.principalSubdivision,
      ].filter(Boolean);

      const pincode =
        data.postcode && /^\d{6}$/.test(data.postcode.trim()) ? data.postcode.trim() : '';

      return {
        formattedAddress: parts.join(', '),
        pincode,
        city: data.city || data.locality || '',
        state: data.principalSubdivision || '',
      };
    }
  } catch (fallbackErr) {
    console.warn('[location] Client fallback reverse-geocode failed:', fallbackErr.message);
  }

  throw new Error('Unable to retrieve address from your current location. Please enter your address manually.');
}
