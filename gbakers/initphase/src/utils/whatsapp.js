/**
 * utils/whatsapp.js – WhatsApp order notification message builder for Gupta Bakers
 *
 * Formats a verified order confirmation message for customer dispatch coordination.
 * If valid GPS deliveryCoordinates (latitude & longitude) exist on the order, appends
 * a clickable Google Maps link (https://www.google.com/maps?q=LATITUDE,LONGITUDE).
 * If coordinates are missing, omits the link gracefully and retains the manual address.
 */

export const BAKERY_WHATSAPP_PHONE = '919810945356';

/**
 * Validates whether a coordinate value is a finite number within geographical bounds.
 *
 * @param {number|string} val
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
export function isValidCoordinate(val, min, max) {
  if (val === null || val === undefined || val === '') return false;
  const num = Number(val);
  return Number.isFinite(num) && num >= min && num <= max;
}

/**
 * Extracts validated delivery coordinates from an order object, checking both
 * order.deliveryCoordinates and fallback order.coordinates.
 *
 * @param {object} order
 * @returns {{ latitude: number, longitude: number } | null}
 */
export function getDeliveryCoordinates(order) {
  if (!order || typeof order !== 'object') return null;
  const coords = order.deliveryCoordinates || order.coordinates;
  if (!coords || typeof coords !== 'object') return null;

  if (
    isValidCoordinate(coords.latitude, -90, 90) &&
    isValidCoordinate(coords.longitude, -180, 180)
  ) {
    return {
      latitude: Number(coords.latitude),
      longitude: Number(coords.longitude),
    };
  }
  return null;
}

/**
 * Generates a clickable Google Maps link in the format:
 * https://www.google.com/maps?q=LATITUDE,LONGITUDE
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {string}
 */
export function buildGoogleMapsUrl(latitude, longitude) {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

/**
 * Builds the plain-text prefilled WhatsApp message for a confirmed order.
 *
 * Appends the Google Maps coordinate link if valid deliveryCoordinates exist;
 * otherwise omits it gracefully while retaining the manual delivery address.
 * Preserves all customer, payment, delivery, and order details.
 *
 * @param {object} order
 * @returns {string}
 */
export function buildWhatsAppOrderMessage(order) {
  if (!order) return '';

  const orderId = order.orderId || order._id || '';
  const orderRef = String(orderId).slice(-6).toUpperCase() || 'GB';
  const totalRupees =
    order.totalRupees != null
      ? order.totalRupees
      : order.totalPaise
      ? order.totalPaise / 100
      : order.totalAmount || 0;

  const rawPhone = String(order.phone || order.customerPhone || '');
  const formattedPhone = rawPhone.startsWith('+')
    ? rawPhone
    : rawPhone
    ? `+91 ${rawPhone}`
    : '+91';

  const customerName = order.name || order.customerName || '';
  const date = order.date || order.preferredDeliveryDate || '';

  let addressPart = order.address || order.deliveryAddress || '';
  const pincode = order.pincode || order.deliveryPincode || '';
  if (pincode && !addressPart.includes(String(pincode))) {
    addressPart = `${addressPart}, PIN: ${pincode}`;
  }

  const notes = order.notes || order.specialInstructions || '';
  const paymentId = order.paymentId || order.razorpayPaymentId || '';

  // Check for valid saved GPS coordinates
  const coords = getDeliveryCoordinates(order);
  const mapsLine = coords
    ? `Location Map: ${buildGoogleMapsUrl(coords.latitude, coords.longitude)}\n`
    : '';

  return (
    `Hello Gupta Bakers! I have placed Order #${orderRef} (₹${totalRupees}).\n\n` +
    `Customer: ${customerName}\n` +
    `Phone: ${formattedPhone}\n` +
    `Preferred Delivery Date: ${date}\n` +
    `Delivery Address: ${addressPart}\n` +
    mapsLine +
    (notes ? `Special Instructions: ${notes}\n` : '') +
    `Payment ID: ${paymentId}\n\n` +
    `Please confirm receipt and dispatch schedule.`
  );
}

/**
 * Builds the full wa.me link with URL-encoded message.
 *
 * @param {object} order
 * @param {string} bakeryPhone
 * @returns {string}
 */
export function buildWhatsAppOrderUrl(order, bakeryPhone = BAKERY_WHATSAPP_PHONE) {
  const message = buildWhatsAppOrderMessage(order);
  return `https://wa.me/${bakeryPhone}?text=${encodeURIComponent(message)}`;
}

// Aliases for convenience
export const buildWhatsAppMessage = buildWhatsAppOrderMessage;
export const createWhatsAppMessage = buildWhatsAppOrderMessage;
export const getWhatsAppMessage = buildWhatsAppOrderMessage;
