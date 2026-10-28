/**
 * Location Routes – Gupta Bakers
 *
 * GET /api/location/reverse-geocode
 *
 * Reverse-geocodes latitude and longitude coordinates into a human-readable
 * address and PIN code.
 *
 * Free-tier limits & Usage policies respected:
 *  - OpenStreetMap Nominatim:
 *      * Maximum 1 request per second.
 *      * Descriptive User-Agent header identifying the application.
 *      * Triggered exclusively by explicit user action ("Use My Current Location").
 *      * In-memory LRU caching to prevent duplicate lookups for identical coordinates.
 *  - BigDataCloud (Client fallback):
 *      * Free non-commercial/client-tier reverse-geocoding endpoint.
 *      * Used only when Nominatim is unavailable or times out.
 *
 * Security & Validation:
 *  - Latitude must be between -90 and 90.
 *  - Longitude must be between -180 and 180.
 *  - Never exposes private keys (uses public, free-tier endpoints).
 */

import { Router } from "express";

const router = Router();

// In-memory cache for recent lookups: "lat,lon" -> addressData
// Max 100 entries to prevent memory growth while caching repeated coordinate requests
const geocodeCache = new Map();
const MAX_CACHE_SIZE = 100;

router.get("/reverse-geocode", async (req, res) => {
  const { lat, lon } = req.query;

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid latitude (-90 to 90) and longitude (-180 to 180) query parameters are required.",
    });
  }

  // Cache key rounded to 4 decimals (~11m resolution)
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return res.status(200).json({
      success: true,
      data: geocodeCache.get(cacheKey),
    });
  }

  let addressData = null;

  // ── 1. Primary: OpenStreetMap Nominatim ──────────────────────────────────
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      latitude
    )}&lon=${encodeURIComponent(longitude)}&addressdetails=1`;

    const osmRes = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "GuptaBakers-ECommerce/1.0 (contact: info@guptabakers.local)",
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (osmRes.ok) {
      const data = await osmRes.json();
      if (data && data.address) {
        const addr = data.address;
        const streetPart =
          addr.road || addr.street || addr.pedestrian || addr.suburb || addr.neighbourhood;
        const areaPart = addr.suburb && addr.suburb !== streetPart ? addr.suburb : null;
        const cityPart =
          addr.city || addr.town || addr.village || addr.city_district || addr.state_district;
        const statePart = addr.state;

        const parts = [streetPart, areaPart, cityPart, statePart].filter(Boolean);
        const uniqueParts = [...new Set(parts)];

        const rawPostcode = String(addr.postcode || "").trim();
        const pincode = /^\d{6}$/.test(rawPostcode) ? rawPostcode : "";

        addressData = {
          formattedAddress: uniqueParts.join(", ") || data.display_name || "",
          pincode,
          city: cityPart || "",
          state: statePart || "",
          latitude,
          longitude,
          provider: "OpenStreetMap",
        };
      }
    }
  } catch (err) {
    console.warn("[reverse-geocode] Nominatim request failed, falling back:", err.message);
  }

  // ── 2. Fallback: BigDataCloud Reverse Geocode Client API ─────────────────
  if (!addressData) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
        latitude
      )}&longitude=${encodeURIComponent(longitude)}&localityLanguage=en`;

      const bdcRes = await fetch(bdcUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (bdcRes.ok) {
        const bdcData = await bdcRes.json();
        const parts = [
          bdcData.locality,
          bdcData.city,
          bdcData.principalSubdivision,
        ].filter(Boolean);

        const uniqueParts = [...new Set(parts)];
        const rawPostcode = String(bdcData.postcode || "").trim();
        const pincode = /^\d{6}$/.test(rawPostcode) ? rawPostcode : "";

        addressData = {
          formattedAddress: uniqueParts.join(", "),
          pincode,
          city: bdcData.city || bdcData.locality || "",
          state: bdcData.principalSubdivision || "",
          latitude,
          longitude,
          provider: "BigDataCloud",
        };
      }
    } catch (fallbackErr) {
      console.warn("[reverse-geocode] BigDataCloud fallback failed:", fallbackErr.message);
    }
  }

  if (!addressData || !addressData.formattedAddress) {
    return res.status(502).json({
      success: false,
      message: "Could not retrieve address from coordinates. Please enter your address manually.",
    });
  }

  // Add to cache
  if (geocodeCache.size >= MAX_CACHE_SIZE) {
    const firstKey = geocodeCache.keys().next().value;
    geocodeCache.delete(firstKey);
  }
  geocodeCache.set(cacheKey, addressData);

  return res.status(200).json({
    success: true,
    data: addressData,
  });
});

export default router;
