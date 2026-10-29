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
  buildWhatsAppApiUrl,
  buildWhatsAppIntentUrl,
  buildWhatsAppAppSchemeUrl,
  isAndroidPlatform,
  getWhatsAppOrderUrls,
  selectWhatsAppUrlForPlatform,
  getDeliveryCoordinates,
  buildGoogleMapsUrl,
  buildProductPageUrl,
  getFrontendBaseUrl,
  formatCurrency,
  DEFAULT_CLIENT_URL,
  BAKERY_WHATSAPP_PHONE,
} from "../../initphase/src/utils/whatsapp.js";

describe("WhatsApp Order Message Builder & Coordinates Link", () => {
  const baseOrder = {
    orderId: "671df3a958e8b31a2938a123",
    totalRupees: 950,
    name: "Aarav Gupta",
    phone: "9891123526",
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
    assert.ok(message.includes("Phone: +91 9891123526"));
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

describe("WhatsApp Order Items Formatting, Product URLs & Variants", () => {
  test("buildProductPageUrl maps category slugs correctly without inventing /product/:slug", () => {
    const base = "https://freelance-ke5z.vercel.app";

    // Backend category 'cake' -> /shop/cakes?product=ID
    assert.equal(
      buildProductPageUrl({ product: { id: "cake-1", category: "cake" } }, base),
      "https://freelance-ke5z.vercel.app/shop/cakes?product=cake-1"
    );

    // Backend category 'snack' -> /shop/brownies?product=ID
    assert.equal(
      buildProductPageUrl({ product: { id: "brownie-2", category: "snack" } }, base),
      "https://freelance-ke5z.vercel.app/shop/brownies?product=brownie-2"
    );

    // Backend category 'pastry' -> /shop/pastries?product=ID
    assert.equal(
      buildProductPageUrl({ product: { id: "pastry-3", category: "pastry" } }, base),
      "https://freelance-ke5z.vercel.app/shop/pastries?product=pastry-3"
    );

    // Backend category 'cookie' -> /shop/cookies?product=ID
    assert.equal(
      buildProductPageUrl({ product: { id: "cookie-4", category: "cookie" } }, base),
      "https://freelance-ke5z.vercel.app/shop/cookies?product=cookie-4"
    );

    // Direct plural category slug 'cakes'
    assert.equal(
      buildProductPageUrl({ product: { id: "cake-5", category: "cakes" } }, base),
      "https://freelance-ke5z.vercel.app/shop/cakes?product=cake-5"
    );

    // Missing category falls back cleanly to general catalogue /shop?product=ID
    assert.equal(
      buildProductPageUrl({ product: { id: "item-6" } }, base),
      "https://freelance-ke5z.vercel.app/shop?product=item-6"
    );

    // Preserves explicit productUrl if provided on the item
    assert.equal(
      buildProductPageUrl({ productUrl: "/shop/cakes?product=explicit-1" }, base),
      "https://freelance-ke5z.vercel.app/shop/cakes?product=explicit-1"
    );
  });

  test("formats order with ITEMS ORDERED matching prompt template exactly", () => {
    const sampleOrder = {
      orderId: "B65C2F",
      totalRupees: 100,
      name: "Vaibhav Pacherwal",
      phone: "+91 8851412125",
      date: "2026-10-29",
      address: "Hari Nagar, Delhi",
      pincode: "110064",
      deliveryCoordinates: {
        latitude: 28.620806850051004,
        longitude: 77.11207747517851,
      },
      paymentId: "pay_TtQq1kyM1Oms3N",
      items: [
        {
          product: {
            id: "product-slug-1",
            name: "Belgian Chocolate Truffle",
            category: "cake",
          },
          variant: {
            label: "500g Regular",
            price: 100,
          },
          quantity: 1,
          unitPrice: 100,
        },
      ],
    };

    const message = buildWhatsAppOrderMessage(sampleOrder, {
      baseUrl: "https://freelance-ke5z.vercel.app",
    });

    // Opening greeting with Order ID and total
    assert.ok(message.includes("Hello Gupta Bakers! I have placed Order #B65C2F (₹100)."));

    // ITEMS ORDERED header
    assert.ok(message.includes("ITEMS ORDERED:\n\n1. Belgian Chocolate Truffle"));
    assert.ok(
      message.includes(
        "   Product URL: https://freelance-ke5z.vercel.app/shop/cakes?product=product-slug-1"
      )
    );
    assert.ok(message.includes("   Quantity: 1"));
    assert.ok(message.includes("   Size/Variant: 500g Regular"));
    assert.ok(message.includes("   Unit Price: ₹100.00"));
    assert.ok(message.includes("   Item Total: ₹100.00"));

    // Customer details
    assert.ok(message.includes("CUSTOMER DETAILS:"));
    assert.ok(message.includes("Customer: Vaibhav Pacherwal"));
    assert.ok(message.includes("Phone: +91 8851412125"));

    // Delivery details
    assert.ok(message.includes("DELIVERY DETAILS:"));
    assert.ok(message.includes("Preferred Delivery Date: 2026-10-29"));
    assert.ok(message.includes("Delivery Address: Hari Nagar, Delhi, PIN: 110064"));
    assert.ok(
      message.includes(
        "Location Map: https://www.google.com/maps?q=28.620806850051004,77.11207747517851"
      )
    );

    // Payment details
    assert.ok(message.includes("PAYMENT:"));
    assert.ok(message.includes("Payment ID: pay_TtQq1kyM1Oms3N"));
    assert.ok(message.includes("Total Paid: ₹100.00"));

    // Closing statement
    assert.ok(message.includes("Please confirm receipt and dispatch schedule."));
  });

  test("handles multiple products with 1-based indexing, different quantities, and line totals", () => {
    const multiItemOrder = {
      orderId: "ORDER789",
      totalRupees: 1350,
      name: "Priya Sharma",
      phone: "9876543210",
      date: "2026-11-01",
      address: "Sector 14, Gurgaon",
      pincode: "122001",
      paymentId: "pay_MultiItem12345",
      items: [
        {
          product: {
            id: "truffle-cake",
            name: "Belgian Chocolate Cake",
            category: "cake",
          },
          variant: {
            label: "1kg",
            price: 450,
          },
          quantity: 2,
          unitPrice: 450,
        },
        {
          product: {
            id: "fudge-brownie",
            name: "Walnut Fudge Brownie",
            category: "snack",
          },
          variant: {
            label: "Box of 4",
            price: 150,
          },
          quantity: 3,
          unitPrice: 150,
        },
      ],
    };

    const message = buildWhatsAppOrderMessage(multiItemOrder, {
      baseUrl: "https://freelance-ke5z.vercel.app",
    });

    // Item 1
    assert.ok(message.includes("1. Belgian Chocolate Cake"));
    assert.ok(
      message.includes(
        "   Product URL: https://freelance-ke5z.vercel.app/shop/cakes?product=truffle-cake"
      )
    );
    assert.ok(message.includes("   Quantity: 2"));
    assert.ok(message.includes("   Size/Variant: 1kg"));
    assert.ok(message.includes("   Unit Price: ₹450.00"));
    assert.ok(message.includes("   Item Total: ₹900.00")); // 450 * 2

    // Item 2
    assert.ok(message.includes("2. Walnut Fudge Brownie"));
    assert.ok(
      message.includes(
        "   Product URL: https://freelance-ke5z.vercel.app/shop/brownies?product=fudge-brownie"
      )
    );
    assert.ok(message.includes("   Quantity: 3"));
    assert.ok(message.includes("   Size/Variant: Box of 4"));
    assert.ok(message.includes("   Unit Price: ₹150.00"));
    assert.ok(message.includes("   Item Total: ₹450.00")); // 150 * 3
  });

  test("handles missing optional variants and missing prices gracefully", () => {
    const orderWithMissingVariantAndPrice = {
      orderId: "SAFE123",
      totalRupees: 50,
      name: "Rohit Verma",
      phone: "9123456780",
      date: "2026-11-05",
      address: "Karol Bagh, Delhi",
      pincode: "110005",
      paymentId: "pay_Safe123",
      items: [
        {
          product: {
            id: "classic-biscuit",
            name: "Classic Butter Biscuit",
            // no category
          },
          // variant is missing
          quantity: 1,
          // unitPrice is missing
        },
      ],
    };

    const message = buildWhatsAppOrderMessage(orderWithMissingVariantAndPrice);

    // Safely defaults variant to Standard
    assert.ok(message.includes("1. Classic Butter Biscuit"));
    assert.ok(message.includes("   Size/Variant: Standard"));
    // Falls back to /shop?product=ID without throwing
    assert.ok(message.includes("/shop?product=classic-biscuit"));
    // Safely formats missing prices to ₹0.00
    assert.ok(message.includes("   Unit Price: ₹0.00"));
    assert.ok(message.includes("   Item Total: ₹0.00"));
  });

  test("verifies full URL encoding of items and product URLs in buildWhatsAppOrderUrl", () => {
    const order = {
      orderId: "ENC999",
      totalRupees: 300,
      name: "Sneha Patel",
      phone: "+91 9998887776",
      date: "2026-11-02",
      address: "Rohini Sec 7, Delhi",
      pincode: "110085",
      paymentId: "pay_EncTest123",
      items: [
        {
          product: {
            id: "red-velvet-jar",
            name: "Red Velvet Jar Cake & Cream",
            category: "pastry",
          },
          variant: {
            label: "Single (200ml)",
            price: 150,
          },
          quantity: 2,
          unitPrice: 150,
        },
      ],
    };

    const waUrl = buildWhatsAppOrderUrl(order);
    assert.ok(waUrl.startsWith(`https://wa.me/${BAKERY_WHATSAPP_PHONE}?text=`));

    const encodedText = waUrl.slice(`https://wa.me/${BAKERY_WHATSAPP_PHONE}?text=`.length);

    // Verify critical characters are safely encoded in URL
    assert.ok(encodedText.includes("%20")); // spaces
    assert.ok(encodedText.includes("%0A")); // newlines
    assert.ok(encodedText.includes("%2Fshop%2Fpastries%3Fproduct%3Dred-velvet-jar")); // product url

    // Full roundtrip lossless decoding
    const decodedText = decodeURIComponent(encodedText);
    const rawMessage = buildWhatsAppOrderMessage(order);
    assert.equal(decodedText, rawMessage);
    assert.ok(decodedText.includes("Red Velvet Jar Cake & Cream"));
    assert.ok(decodedText.includes("Size/Variant: Single (200ml)"));
  });

  test("generates valid HTTPS wa.me URL compatible with window.location.assign for mobile Chrome", () => {
    const order = {
      orderId: "8E9BD4",
      totalRupees: 120,
      name: "Vaibhav Pacherwal",
      phone: "+91 8851412125",
      date: "2026-10-29",
      address: "Hari Nagar, Delhi",
      pincode: "110064",
      paymentId: "pay_TtcodyfLl8gxVo",
      items: [
        {
          product: { id: "pastry-1", name: "Red Velvet Jar", category: "pastry" },
          variant: { label: "200ml" },
          quantity: 1,
          unitPrice: 120,
        },
      ],
    };

    const url = buildWhatsAppOrderUrl(order);

    // Verifies protocol and domain suitable for window.location.assign() same-tab navigation
    const parsed = new URL(url);
    assert.equal(parsed.protocol, "https:");
    assert.equal(parsed.hostname, "wa.me");
    assert.equal(parsed.pathname, `/${BAKERY_WHATSAPP_PHONE}`);
    assert.ok(parsed.searchParams.has("text"));

    // Verifies redirect key session format
    const sessionKey = `gb_wa_redirect_${order.orderId}`;
    assert.equal(sessionKey, "gb_wa_redirect_8E9BD4");
  });
});

describe("WhatsApp Platform-Specific URL Selection & Android App Handoff", () => {
  const sampleOrder = {
    orderId: "ANDR123",
    totalRupees: 550,
    name: "Karan Johar",
    phone: "+91 9811122233",
    date: "2026-11-03",
    address: "DLF Phase 2, Gurgaon",
    pincode: "122002",
    paymentId: "pay_AndroidHandoff99",
    items: [
      {
        product: { id: "pastry-truffle", name: "Dark Chocolate Truffle", category: "cake" },
        variant: { label: "500g", price: 550 },
        quantity: 1,
        unitPrice: 550,
      },
    ],
  };

  test("buildWhatsAppApiUrl generates the reliable api.whatsapp.com/send/ fallback URL", () => {
    const apiUrl = buildWhatsAppApiUrl(sampleOrder);
    assert.ok(
      apiUrl.startsWith(`https://api.whatsapp.com/send/?phone=${BAKERY_WHATSAPP_PHONE}&text=`),
      `Expected api.whatsapp.com URL, got: ${apiUrl}`
    );

    const parsed = new URL(apiUrl);
    assert.equal(parsed.protocol, "https:");
    assert.equal(parsed.hostname, "api.whatsapp.com");
    assert.equal(parsed.pathname, "/send/");
    assert.equal(parsed.searchParams.get("phone"), BAKERY_WHATSAPP_PHONE);
    assert.ok(parsed.searchParams.has("text"));

    // Lossless decoding verification
    const decodedMessage = decodeURIComponent(parsed.searchParams.get("text"));
    const expectedMessage = buildWhatsAppOrderMessage(sampleOrder);
    assert.equal(decodedMessage, expectedMessage);
  });

  test("buildWhatsAppIntentUrl generates a valid Android intent URI for native WhatsApp handoff", () => {
    const intentUrl = buildWhatsAppIntentUrl(sampleOrder);
    assert.ok(
      intentUrl.startsWith(`intent://send?phone=${BAKERY_WHATSAPP_PHONE}&text=`),
      `Expected intent URI, got: ${intentUrl}`
    );
    assert.ok(intentUrl.includes("#Intent;package=com.whatsapp;scheme=whatsapp;end"));

    // Raw message decode test from intent query
    const queryString = intentUrl.slice("intent://send?".length, intentUrl.indexOf("#Intent;"));
    const params = new URLSearchParams(queryString);
    assert.equal(params.get("phone"), BAKERY_WHATSAPP_PHONE);
    assert.equal(decodeURIComponent(params.get("text")), buildWhatsAppOrderMessage(sampleOrder));
  });

  test("buildWhatsAppAppSchemeUrl generates valid whatsapp:// deep link URL", () => {
    const schemeUrl = buildWhatsAppAppSchemeUrl(sampleOrder);
    assert.ok(
      schemeUrl.startsWith(`whatsapp://send?phone=${BAKERY_WHATSAPP_PHONE}&text=`),
      `Expected scheme URL, got: ${schemeUrl}`
    );
    const parsed = new URL(schemeUrl);
    assert.equal(parsed.protocol, "whatsapp:");
    assert.equal(parsed.searchParams.get("phone"), BAKERY_WHATSAPP_PHONE);
    assert.equal(decodeURIComponent(parsed.searchParams.get("text")), buildWhatsAppOrderMessage(sampleOrder));
  });

  test("isAndroidPlatform detects Android User-Agents and excludes Desktop/iOS User-Agents", () => {
    const androidUA1 = "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
    const androidUA2 = "Mozilla/5.0 (Linux; U; Android 13; en-us; Pixel 7 Build/TQ3A.230805.001) AppleWebKit/537.36";
    const desktopChromeUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
    const macOSSafariUA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";
    const iPhoneUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

    assert.equal(isAndroidPlatform(androidUA1), true);
    assert.equal(isAndroidPlatform(androidUA2), true);
    assert.equal(isAndroidPlatform(desktopChromeUA), false);
    assert.equal(isAndroidPlatform(macOSSafariUA), false);
    assert.equal(isAndroidPlatform(iPhoneUA), false);
    assert.equal(isAndroidPlatform(null), false);
    assert.equal(isAndroidPlatform(undefined), false);
  });

  test("getWhatsAppOrderUrls provides both preferred wa.me URL and reliable api.whatsapp.com fallback", () => {
    const urls = getWhatsAppOrderUrls(sampleOrder, { platform: "android" });

    // Standard HTTPS wa.me URL is always preferred first (handles App Links and WhatsApp Web)
    assert.equal(urls.preferredUrl, buildWhatsAppOrderUrl(sampleOrder));
    assert.ok(urls.preferredUrl.startsWith(`https://wa.me/${BAKERY_WHATSAPP_PHONE}?text=`));

    // Fallback URL is the official api.whatsapp.com/send/ endpoint
    assert.equal(urls.fallbackUrl, buildWhatsAppApiUrl(sampleOrder));
    assert.ok(urls.fallbackUrl.startsWith(`https://api.whatsapp.com/send/?phone=${BAKERY_WHATSAPP_PHONE}&text=`));

    // Deep link variants are also provided
    assert.ok(urls.intentUrl.startsWith("intent://send?"));
    assert.ok(urls.schemeUrl.startsWith("whatsapp://send?"));
    assert.equal(urls.isAndroid, true);
  });

  test("selectWhatsAppUrlForPlatform selects preferred wa.me URL by default on both desktop and Android", () => {
    // Desktop default
    const desktopUrl = selectWhatsAppUrlForPlatform(sampleOrder, "desktop");
    assert.equal(desktopUrl, buildWhatsAppOrderUrl(sampleOrder));
    assert.ok(desktopUrl.startsWith("https://wa.me/"));

    // Android default (prefers wa.me link first as per Requirement 4)
    const androidDefaultUrl = selectWhatsAppUrlForPlatform(sampleOrder, "android");
    assert.equal(androidDefaultUrl, buildWhatsAppOrderUrl(sampleOrder));
    assert.ok(androidDefaultUrl.startsWith("https://wa.me/"));

    // Android with fallback requested (api.whatsapp.com)
    const androidFallbackUrl = selectWhatsAppUrlForPlatform(sampleOrder, "android", { fallback: true });
    assert.equal(androidFallbackUrl, buildWhatsAppApiUrl(sampleOrder));
    assert.ok(androidFallbackUrl.startsWith("https://api.whatsapp.com/send/"));

    // Android with native intent requested
    const androidIntentUrl = selectWhatsAppUrlForPlatform(sampleOrder, "android", { useIntent: true });
    assert.equal(androidIntentUrl, buildWhatsAppIntentUrl(sampleOrder));
    assert.ok(androidIntentUrl.startsWith("intent://send?"));

    // Android with custom scheme requested
    const androidSchemeUrl = selectWhatsAppUrlForPlatform(sampleOrder, "android", { useScheme: true });
    assert.equal(androidSchemeUrl, buildWhatsAppAppSchemeUrl(sampleOrder));
    assert.ok(androidSchemeUrl.startsWith("whatsapp://send?"));
  });

  test("preserves exact message encoding and recipient across wa.me, api, intent, and scheme URLs", () => {
    const expectedMessage = buildWhatsAppOrderMessage(sampleOrder);
    const urls = getWhatsAppOrderUrls(sampleOrder);

    // 1. wa.me text matches
    const waMeText = new URL(urls.waMeUrl).searchParams.get("text");
    assert.equal(decodeURIComponent(waMeText), expectedMessage);

    // 2. api.whatsapp.com text matches
    const apiText = new URL(urls.apiUrl).searchParams.get("text");
    assert.equal(decodeURIComponent(apiText), expectedMessage);

    // 3. scheme text matches
    const schemeText = new URL(urls.schemeUrl).searchParams.get("text");
    assert.equal(decodeURIComponent(schemeText), expectedMessage);

    // 4. intent text matches
    const intentQuery = urls.intentUrl.slice("intent://send?".length, urls.intentUrl.indexOf("#Intent;"));
    const intentText = new URLSearchParams(intentQuery).get("text");
    assert.equal(decodeURIComponent(intentText), expectedMessage);
  });
});


