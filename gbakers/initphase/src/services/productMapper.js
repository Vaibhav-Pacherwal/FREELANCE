/**
 * Gupta Bakers — Backend → UI Product Mapper
 *
 * Translates raw backend product documents (MongoDB paise-based)
 * into the shape expected by CataloguePage, CartContext, and SignatureProducts.
 *
 * Backend field        UI field          Notes
 * ──────────────────── ───────────────── ─────────────────────────────────────
 * _id                  id                ObjectId string — used as cart key prefix
 * name                 name              unchanged
 * description          description       unchanged (defaults to '' per schema)
 * category             category          backend uses singular ("cake" → UI shows "cake")
 * images[0]            image             first image URL; fallback to local category image
 * pricePaise           —                 not exposed; variants always used for price
 * variants[].label     variants[].label  unchanged
 * variants[].pricePaise variants[].price divided by 100 (paise → rupees for formatPrice())
 * —                    tags              derived: [] — backend has no tags field
 * isAvailable          —                 already filtered out on the backend (GET returns only available)
 *
 * CATEGORY IMAGE FALLBACKS
 * When a product has no images the catalogue still looks good by using one of the
 * local editorial photos that ship with the frontend.  These are the same images
 * used by the old mock data file.
 */

/** @type {Record<string, string>} */
const CATEGORY_FALLBACK_IMAGE = {
  cake:    '/images/cat-cakes.jpg',
  bread:   '/images/cat-pastries.jpg',
  pastry:  '/images/cat-pastries.jpg',
  cookie:  '/images/cat-cookies.jpg',
  snack:   '/images/cat-brownies.jpg',
  other:   '/images/hero-cake.jpg',
};

const DEFAULT_IMAGE = '/images/hero-cake.jpg';

/**
 * Map one backend product document to the UI product shape.
 *
 * @param {object} raw  – Raw document from the backend API
 * @returns {UiProduct}
 */
export function mapProduct(raw) {
  // ── Image ───────────────────────────────────────────────────────────────
  const image =
    Array.isArray(raw.images) && raw.images.length > 0
      ? raw.images[0]
      : (CATEGORY_FALLBACK_IMAGE[raw.category] ?? DEFAULT_IMAGE);

  // ── Variants ─────────────────────────────────────────────────────────────
  // Backend stores prices in paise; UI calls formatPrice(rupees), so divide by 100.
  // If the backend sends no variants but has a base pricePaise, synthesise one variant
  // so the cart (which always expects variants[]) never receives an empty array.
  let variants;
  if (Array.isArray(raw.variants) && raw.variants.length > 0) {
    variants = raw.variants.map((v) => ({
      label: v.label,
      price: v.pricePaise / 100,   // paise → rupees
    }));
  } else if (raw.pricePaise) {
    variants = [{ label: 'Standard', price: raw.pricePaise / 100 }];
  } else {
    // Should never happen (backend schema enforces at least one), but be defensive
    variants = [{ label: 'Standard', price: 0 }];
  }

  return {
    id:          raw._id,
    name:        raw.name,
    description: raw.description ?? '',
    category:    raw.category,
    image,
    variants,
    // Backend has no tags field; the UI uses tags only for the 'bestseller' badge.
    // Leave as empty array — badges can be added when the backend gains a tags field.
    tags:        [],
  };
}

/**
 * Map an array of raw backend products.
 * @param {object[]} rawList
 * @returns {UiProduct[]}
 */
export function mapProducts(rawList) {
  return rawList.map(mapProduct);
}

/**
 * @typedef {object} UiProduct
 * @property {string}   id
 * @property {string}   name
 * @property {string}   description
 * @property {string}   category
 * @property {string}   image
 * @property {{ label: string, price: number }[]} variants
 * @property {string[]} tags
 */
