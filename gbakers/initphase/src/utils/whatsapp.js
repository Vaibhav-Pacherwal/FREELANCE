/**
 * utils/whatsapp.js – WhatsApp order notification message builder for Gupta Bakers
 *
 * Formats a verified order confirmation message for customer dispatch coordination.
 * - Formats line items with actual product name, direct product-page URL, quantity,
 *   selected size/variant, unit price, and item total.
 * - If valid GPS deliveryCoordinates (latitude & longitude) exist on the order, appends
 *   a clickable Google Maps link (https://www.google.com/maps?q=LATITUDE,LONGITUDE).
 * - Preserves all customer, delivery, Google Maps, order ID, and payment details.
 */

export const BAKERY_WHATSAPP_PHONE = '919891123526';
export const DEFAULT_CLIENT_URL = 'https://freelance-ke5z.vercel.app';

const BACKEND_CATEGORY_TO_SLUG = {
  cake: 'cakes',
  snack: 'brownies',
  pastry: 'pastries',
  cookie: 'cookies',
};

const VALID_CATEGORY_SLUGS = new Set(['cakes', 'brownies', 'pastries', 'cookies']);

/**
 * Resolves the configured frontend base URL (without trailing slashes).
 *
 * @param {string} [customBaseUrl]
 * @returns {string}
 */
export function getFrontendBaseUrl(customBaseUrl) {
  if (customBaseUrl && typeof customBaseUrl === 'string') {
    return customBaseUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }
  if (typeof globalThis !== 'undefined' && globalThis.process?.env?.CLIENT_URL) {
    return globalThis.process.env.CLIENT_URL.replace(/\/+$/, '');
  }
  return DEFAULT_CLIENT_URL;
}

/**
 * Builds the direct product-page URL for an ordered item according to React Router.
 * Uses the category catalogue route with product query param (/shop/:category?product=ID)
 * or general catalogue route (/shop?product=ID), avoiding artificial /product/:slug routes.
 *
 * @param {object} item
 * @param {string} [baseUrl]
 * @returns {string}
 */
export function buildProductPageUrl(item, baseUrl = getFrontendBaseUrl()) {
  const base = baseUrl.replace(/\/+$/, '');

  if (item?.productUrl && typeof item.productUrl === 'string') {
    return item.productUrl.startsWith('http')
      ? item.productUrl
      : `${base}${item.productUrl.startsWith('/') ? '' : '/'}${item.productUrl}`;
  }
  if (item?.url && typeof item.url === 'string') {
    return item.url.startsWith('http')
      ? item.url
      : `${base}${item.url.startsWith('/') ? '' : '/'}${item.url}`;
  }

  const rawProd = item?.product || item || {};
  const productId =
    item?.productId ||
    rawProd._id ||
    rawProd.id ||
    item?._id ||
    item?.id ||
    '';

  const rawCategory = String(rawProd.category || item?.category || '')
    .toLowerCase()
    .trim();

  const categorySlug =
    BACKEND_CATEGORY_TO_SLUG[rawCategory] ||
    (VALID_CATEGORY_SLUGS.has(rawCategory) ? rawCategory : '');

  const path = categorySlug ? `/shop/${categorySlug}` : '/shop';
  return productId
    ? `${base}${path}?product=${encodeURIComponent(String(productId))}`
    : `${base}${path}`;
}

/**
 * Helper to format currency numbers to 2 decimal places.
 *
 * @param {number|string} val
 * @returns {string}
 */
export function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return '0.00';
  return Number(val).toFixed(2);
}

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
 * Preserves all customer, delivery, Google Maps, order ID, and payment details.
 * Formats every line item with actual product name, direct product-page URL,
 * quantity, selected size/variant, unit price, and item total.
 *
 * @param {object} order
 * @param {object} [options]
 * @param {string} [options.baseUrl]
 * @returns {string}
 */
export function buildWhatsAppOrderMessage(order, options = {}) {
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

  // Format Items Ordered block
  const baseUrl = getFrontendBaseUrl(options.baseUrl || order.baseUrl);
  const items = Array.isArray(order.items) ? order.items : [];
  let itemsSection = '';

  if (items.length > 0) {
    const itemLines = items.map((it, idx) => {
      const prod = it.product || it;
      const name = prod.name || it.productName || it.name || 'Bakery Item';
      const productUrl = buildProductPageUrl(it, baseUrl);
      const qty = Number(it.quantity) || 1;
      const variant =
        it.variant?.label ||
        it.variantLabel ||
        (typeof it.variant === 'string' ? it.variant : null) ||
        it.size ||
        'Standard';

      const unitPriceVal =
        it.unitPrice != null
          ? Number(it.unitPrice)
          : it.variant?.price != null
            ? Number(it.variant.price)
            : it.unitPricePaise != null
              ? Number(it.unitPricePaise) / 100
              : it.price != null
                ? Number(it.price)
                : 0;

      const lineTotalVal =
        it.lineTotal != null
          ? Number(it.lineTotal)
          : it.lineTotalPaise != null
            ? Number(it.lineTotalPaise) / 100
            : unitPriceVal * qty;

      return (
        `${idx + 1}. ${name}\n` +
        `   Product URL: ${productUrl}\n` +
        `   Quantity: ${qty}\n` +
        `   Size/Variant: ${variant}\n` +
        `   Unit Price: ₹${formatCurrency(unitPriceVal)}\n` +
        `   Item Total: ₹${formatCurrency(lineTotalVal)}`
      );
    });

    itemsSection = `ITEMS ORDERED:\n\n${itemLines.join('\n\n')}\n\n`;
  }

  return (
    `Hello Gupta Bakers! I have placed Order #${orderRef} (₹${totalRupees}).\n\n` +
    itemsSection +
    `CUSTOMER DETAILS:\n` +
    `Customer: ${customerName}\n` +
    `Phone: ${formattedPhone}\n\n` +
    `DELIVERY DETAILS:\n` +
    `Preferred Delivery Date: ${date}\n` +
    `Delivery Address: ${addressPart}\n` +
    mapsLine +
    (notes ? `Special Instructions: ${notes}\n` : '') +
    `\nPAYMENT:\n` +
    `Payment ID: ${paymentId}\n` +
    `Total Paid: ₹${formatCurrency(totalRupees)}\n\n` +
    `Please confirm receipt and dispatch schedule.`
  );
}

/**
 * Builds the full wa.me link with URL-encoded message (standard HTTPS link).
 * Preferred on all platforms because Android handles it via App Links and PC via WhatsApp Web.
 *
 * @param {object} order
 * @param {string} [bakeryPhone]
 * @param {object} [options]
 * @returns {string}
 */
export function buildWhatsAppOrderUrl(
  order,
  bakeryPhone = BAKERY_WHATSAPP_PHONE,
  options = {}
) {
  const message = buildWhatsAppOrderMessage(order, options);
  return `https://wa.me/${bakeryPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds the fallback api.whatsapp.com/send/ URL for devices where wa.me opens in browser.
 *
 * @param {object} order
 * @param {string} [bakeryPhone]
 * @param {object} [options]
 * @returns {string}
 */
export function buildWhatsAppApiUrl(
  order,
  bakeryPhone = BAKERY_WHATSAPP_PHONE,
  options = {}
) {
  const message = buildWhatsAppOrderMessage(order, options);
  return `https://api.whatsapp.com/send/?phone=${bakeryPhone}&text=${encodeURIComponent(message)}`;
}

/**
 * Builds an Android WhatsApp Intent URI for direct application handoff.
 *
 * @param {object} order
 * @param {string} [bakeryPhone]
 * @param {object} [options]
 * @returns {string}
 */
export function buildWhatsAppIntentUrl(
  order,
  bakeryPhone = BAKERY_WHATSAPP_PHONE,
  options = {}
) {
  const message = buildWhatsAppOrderMessage(order, options);
  return `intent://send?phone=${bakeryPhone}&text=${encodeURIComponent(message)}#Intent;package=com.whatsapp;scheme=whatsapp;end`;
}

/**
 * Builds a native whatsapp:// custom scheme deep link URL.
 *
 * @param {object} order
 * @param {string} [bakeryPhone]
 * @param {object} [options]
 * @returns {string}
 */
export function buildWhatsAppAppSchemeUrl(
  order,
  bakeryPhone = BAKERY_WHATSAPP_PHONE,
  options = {}
) {
  const message = buildWhatsAppOrderMessage(order, options);
  return `whatsapp://send?phone=${bakeryPhone}&text=${encodeURIComponent(message)}`;
}

/**
 * Detects whether the current environment or user agent string is Android.
 *
 * @param {string} [userAgent]
 * @returns {boolean}
 */
export function isAndroidPlatform(userAgent) {
  if (typeof userAgent === 'string') {
    return /android/i.test(userAgent);
  }
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    return /android/i.test(navigator.userAgent);
  }
  return false;
}

/**
 * Returns a comprehensive set of WhatsApp URLs for the confirmed order across platforms.
 *
 * @param {object} order
 * @param {object} [options]
 * @param {string} [options.platform] 'android' | 'desktop' | 'auto'
 * @param {string} [options.userAgent] custom user agent for testing/detection
 * @param {string} [options.bakeryPhone]
 * @param {string} [options.baseUrl]
 * @returns {{
 *   preferredUrl: string,
 *   fallbackUrl: string,
 *   waMeUrl: string,
 *   apiUrl: string,
 *   intentUrl: string,
 *   schemeUrl: string,
 *   isAndroid: boolean
 * }}
 */
export function getWhatsAppOrderUrls(order, options = {}) {
  const bakeryPhone = options.bakeryPhone || BAKERY_WHATSAPP_PHONE;
  const waMeUrl = buildWhatsAppOrderUrl(order, bakeryPhone, options);
  const apiUrl = buildWhatsAppApiUrl(order, bakeryPhone, options);
  const intentUrl = buildWhatsAppIntentUrl(order, bakeryPhone, options);
  const schemeUrl = buildWhatsAppAppSchemeUrl(order, bakeryPhone, options);

  const isAndroid =
    options.platform === 'android'
      ? true
      : options.platform === 'desktop'
        ? false
        : isAndroidPlatform(options.userAgent);

  return {
    preferredUrl: waMeUrl,
    fallbackUrl: apiUrl,
    waMeUrl,
    apiUrl,
    intentUrl,
    schemeUrl,
    isAndroid,
  };
}

/**
 * Selects the appropriate WhatsApp order URL based on platform and fallback preferences.
 *
 * @param {object} order
 * @param {string|object} [platformOrOptions]
 * @param {object} [options]
 * @returns {string}
 */
export function selectWhatsAppUrlForPlatform(
  order,
  platformOrOptions = 'auto',
  options = {}
) {
  const mergedOptions =
    typeof platformOrOptions === 'string'
      ? { ...options, platform: platformOrOptions }
      : { ...platformOrOptions, ...options };

  const urls = getWhatsAppOrderUrls(order, mergedOptions);

  if (mergedOptions.fallback || mergedOptions.useFallback) {
    return urls.fallbackUrl;
  }
  if (mergedOptions.useIntent) {
    return urls.intentUrl;
  }
  if (mergedOptions.useScheme) {
    return urls.schemeUrl;
  }
  return urls.preferredUrl;
}

// Aliases for convenience
export const buildWhatsAppMessage = buildWhatsAppOrderMessage;
export const createWhatsAppMessage = buildWhatsAppOrderMessage;
export const getWhatsAppMessage = buildWhatsAppOrderMessage;

