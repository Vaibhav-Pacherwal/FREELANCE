/**
 * whatsapp_order_message.test.mjs – WhatsApp Order Message Builder Tests
 *
 * Verifies:
 * 1. Appends clickable Google Maps link (https://www.google.com/maps?q=LATITUDE,LONGITUDE)
 *    using actual saved coordinates when valid order.deliveryCoordinates exist.
 * 2. Gracefully omits the Google Maps link and retains manual delivery address when coordinates are missing.
 * 3. Gracefully omits the link when coordinates are null, non-numeric, or out of geographical bounds.
 * 4. Correctly URL-encodes the message string for wa.me links.
 * 5. Preserves all existing order, payment, customer, delivery, and item details.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  buildWhatsAppOrderMessage,
  buildWhatsAppOrderUrl,
  getDeliveryCoordinates,
  buildGoogleMapsUrl,
  BAKERY_WHATSAPP_PHONE,
} from "../../initphase/src/utils/whatsapp.js";

describe("WhatsApp Order Message Builder & Coordinates Link", () => {
  const baseOrder = {
    orderId: "671df3a958e8b31a2938a123",
    totalRupees: 950,
    name: "Aarav Gupta",
    phone: "9810945356",
    date: "2026-10-30",
    address: "Flat 304, Palm Grove Heights, Civil Lines, Delhi",
    pincode: "110054",
    notes: "Please deliver in the afternoon, handle with care.",
    paymentId: "pay_Q1w2E3r4T5y6U7",
    itemCount: 2,
    items: [
      { product: { name: "Belgian Chocolate Truffle Cake" }, variant: { label: "1kg" }, quantity: 1 },
      { product: { name: "Artisan Sourdough Loaf" }, variant: { label: "Standard" }, quantity: 1 },
    ],
  };

  test("appends clickable Google Maps link with exact coordinates when deliveryCoordinates are present", () => {
    const orderWithCoords = {
      ...baseOrder,
      deliveryCoordinates: {
        latitude: 28.6139,
        longitude: 77.2090,
      },
    };

    const message = buildWhatsAppOrderMessage(orderWithCoords);

    // Clickable Google Maps link present in required format
    assert.ok(
      message.includes("https://www.google.com/maps?q=28.6139,77.209"),
      `Expected message to contain Google Maps link, but got:\n${message}`
    );

    // Uses actual saved coordinates, never hardcoded
    const expectedUrl = buildGoogleMapsUrl(28.6139, 77.2090);
    assert.equal(expectedUrl, "https://www.google.com/maps?q=28.6139,77.209");
    assert.ok(message.includes(expectedUrl));

    // Manual address is retained alongside the coordinates link
    assert.ok(message.includes("Delivery Address: Flat 304, Palm Grove Heights, Civil Lines, Delhi, PIN: 110054"));

    // Follows Location Map line format
    assert.ok(message.includes(`Location Map: ${expectedUrl}`));
  });

  test("uses dynamic coordinates from different orders (never hardcoded)", () => {
    const mumbaiOrder = {
      ...baseOrder,
      orderId: "671df3a958e8b31a2938b456",
      deliveryCoordinates: {
        latitude: 19.076,
        longitude: 72.8777,
      },
    };

    const bangaloreOrder = {
      ...baseOrder,
      orderId: "671df3a958e8b31a2938c789",
      deliveryCoordinates: {
        latitude: 12.9716,
        longitude: 77.5946,
      },
    };

    const msgMumbai = buildWhatsAppOrderMessage(mumbaiOrder);
    const msgBangalore = buildWhatsAppOrderMessage(bangaloreOrder);

    assert.ok(msgMumbai.includes("https://www.google.com/maps?q=19.076,72.8777"));
    assert.ok(!msgMumbai.includes("28.6139")); // Proves no hardcoding

    assert.ok(msgBangalore.includes("https://www.google.com/maps?q=12.9716,77.5946"));
    assert.ok(!msgBangalore.includes("19.076")); // Proves dynamic per-order coordinates
  });

  test("gracefully omits the Google Maps link when coordinates are missing (manual address entry)", () => {
    const manualOrder = {
      ...baseOrder,
      // No deliveryCoordinates or coordinates provided
    };

    const message = buildWhatsAppOrderMessage(manualOrder);

    // Google Maps link must NOT be present
    assert.ok(!message.includes("google.com/maps"));
    assert.ok(!message.includes("Location Map:"));

    // Manual address is fully retained
    assert.ok(message.includes("Delivery Address: Flat 304, Palm Grove Heights, Civil Lines, Delhi, PIN: 110054"));
  });

  test("gracefully omits the Google Maps link when coordinates are null or empty", () => {
    const nullCoordsOrder = {
      ...baseOrder,
      deliveryCoordinates: null,
    };

    const emptyCoordsOrder = {
      ...baseOrder,
      deliveryCoordinates: {
        latitude: null,
        longitude: null,
      },
    };

    const msgNull = buildWhatsAppOrderMessage(nullCoordsOrder);
    const msgEmpty = buildWhatsAppOrderMessage(emptyCoordsOrder);

    assert.ok(!msgNull.includes("google.com/maps"));
    assert.ok(!msgEmpty.includes("google.com/maps"));
    assert.ok(msgNull.includes("Delivery Address:"));
    assert.ok(msgEmpty.includes("Delivery Address:"));
  });

  test("gracefully rejects invalid or out-of-range coordinates", () => {
    const outOfBoundsOrder = {
      ...baseOrder,
      deliveryCoordinates: {
        latitude: 95.0, // Invalid: latitude must be between -90 and 90
        longitude: 77.209,
      },
    };

    const nonNumericOrder = {
      ...baseOrder,
      deliveryCoordinates: {
        latitude: "not-a-number",
        longitude: "invalid",
      },
    };

    const msgOob = buildWhatsAppOrderMessage(outOfBoundsOrder);
    const msgNan = buildWhatsAppOrderMessage(nonNumericOrder);

    assert.ok(!msgOob.includes("google.com/maps"));
    assert.ok(!msgNan.includes("google.com/maps"));
  });

  test("supports coordinates passed via order.coordinates as well", () => {
    const orderWithCoordsField = {
      ...baseOrder,
      coordinates: {
        latitude: 28.5355,
        longitude: 77.3910,
      },
    };

    const message = buildWhatsAppOrderMessage(orderWithCoordsField);
    assert.ok(message.includes("https://www.google.com/maps?q=28.5355,77.391"));
  });

  test("preserves all existing order, payment, customer, delivery, and instructions details", () => {
    const orderWithCoords = {
      ...baseOrder,
      deliveryCoordinates: {
        latitude: 28.6139,
        longitude: 77.2090,
      },
    };

    const message = buildWhatsAppOrderMessage(orderWithCoords);

    // Order reference (last 6 hex characters uppercase)
    assert.ok(message.includes("Order #38A123"));
    // Amount paid
    assert.ok(message.includes("(₹950)"));
    // Customer name
    assert.ok(message.includes("Customer: Aarav Gupta"));
    // Customer phone with +91 format
    assert.ok(message.includes("Phone: +91 9810945356"));
    // Preferred delivery date
    assert.ok(message.includes("Preferred Delivery Date: 2026-10-30"));
    // Delivery address & PIN
    assert.ok(message.includes("Delivery Address: Flat 304, Palm Grove Heights, Civil Lines, Delhi, PIN: 110054"));
    // Location map link
    assert.ok(message.includes("Location Map: https://www.google.com/maps?q=28.6139,77.209"));
    // Special instructions
    assert.ok(message.includes("Special Instructions: Please deliver in the afternoon, handle with care."));
    // Payment reference ID
    assert.ok(message.includes("Payment ID: pay_Q1w2E3r4T5y6U7"));
    // Closing dispatch statement
    assert.ok(message.includes("Please confirm receipt and dispatch schedule."));
  });

  test("handles orders without special instructions gracefully", () => {
    const orderNoNotes = {
      ...baseOrder,
      notes: "",
      deliveryCoordinates: {
        latitude: 28.6139,
        longitude: 77.2090,
      },
    };

    const message = buildWhatsAppOrderMessage(orderNoNotes);
    assert.ok(!message.includes("Special Instructions:"));
    assert.ok(message.includes("Payment ID: pay_Q1w2E3r4T5y6U7"));
  });

  test("ensures proper URL encoding for the wa.me message link", () => {
    const orderWithCoords = {
      ...baseOrder,
      deliveryCoordinates: {
        latitude: 28.6139,
        longitude: 77.2090,
      },
    };

    const rawMessage = buildWhatsAppOrderMessage(orderWithCoords);
    const encodedUrl = buildWhatsAppOrderUrl(orderWithCoords);

    // wa.me phone target matches official bakery support line
    assert.ok(encodedUrl.startsWith(`https://wa.me/${BAKERY_WHATSAPP_PHONE}?text=`));

    // URL contains properly percent-encoded characters
    const queryText = encodedUrl.split("?text=")[1];
    assert.ok(queryText.includes("%20")); // Spaces encoded
    assert.ok(queryText.includes("%0A")); // Newlines encoded

    // Decodes back losslessly to the exact raw message
    const decodedMessage = decodeURIComponent(queryText);
    assert.equal(decodedMessage, rawMessage);

    // Decoded string contains the exact Google Maps URL
    assert.ok(decodedMessage.includes("https://www.google.com/maps?q=28.6139,77.209"));
  });

  test("helper getDeliveryCoordinates extracts valid numbers and filters out invalid ones", () => {
    assert.deepEqual(
      getDeliveryCoordinates({ deliveryCoordinates: { latitude: 28.6, longitude: 77.2 } }),
      { latitude: 28.6, longitude: 77.2 }
    );
    assert.deepEqual(
      getDeliveryCoordinates({ deliveryCoordinates: { latitude: "28.6", longitude: "77.2" } }),
      { latitude: 28.6, longitude: 77.2 }
    );
    assert.equal(getDeliveryCoordinates(null), null);
    assert.equal(getDeliveryCoordinates({}), null);
    assert.equal(getDeliveryCoordinates({ deliveryCoordinates: null }), null);
    assert.equal(getDeliveryCoordinates({ deliveryCoordinates: { latitude: 95, longitude: 77 } }), null);
    assert.equal(getDeliveryCoordinates({ deliveryCoordinates: { latitude: 28, longitude: 185 } }), null);
  });
});
