/**
 * Shared delivery-fee constants – Gupta Bakers
 *
 * SINGLE SOURCE OF TRUTH for delivery fee logic.
 * Imported by both order.routes.js and payment.routes.js so that
 * POST /api/orders and POST /api/payments/create-order always compute
 * identical totals for the same basket.
 *
 * CURRENCY: all values are integer INR paise (1 rupee = 100 paise).
 *
 * To change the fee threshold or amount, edit only this file.
 */

export const DELIVERY_FEE_THRESHOLD_PAISE = 50_000; // ₹500 — orders at or above this get free delivery
export const DELIVERY_FEE_PAISE           = 4_000;  // ₹40  — flat fee applied below threshold
export const FREE_DELIVERY_FEE_PAISE      = 0;

/**
 * Returns the delivery fee in paise for a given subtotal.
 * @param {number} subtotalPaise  – integer INR paise
 * @returns {number}              – integer INR paise
 */
export function calculateDeliveryFee(subtotalPaise) {
  return subtotalPaise >= DELIVERY_FEE_THRESHOLD_PAISE
    ? FREE_DELIVERY_FEE_PAISE
    : DELIVERY_FEE_PAISE;
}
