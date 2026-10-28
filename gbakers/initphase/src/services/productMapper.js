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

/** Specific editorial fallback photos matching the prototype sample catalog */
const PRODUCT_FALLBACK_IMAGES = {
  'Chocolate Truffle Cake':    '/images/cat-brownies.jpg',
  'Vanilla Berry Cake':        '/images/cat-cakes.jpg',
  'Butterscotch Crunch Cake':  '/images/cat-cakes.jpg',
  'Red Velvet Cake':           '/images/cat-brownies.jpg',
  'Classic Fudge Brownie':     '/images/cat-brownies.jpg',
  'Walnut Brownie':            '/images/cat-brownies.jpg',
  'Salted Caramel Brownie':    '/images/cat-brownies.jpg',
  'Butter Croissant':          '/images/cat-pastries.jpg',
  'Almond Croissant':          '/images/cat-pastries.jpg',
  'Fruit Danish':              '/images/cat-pastries.jpg',
  'Chocolate Chip Cookie':     '/images/cat-cookies.jpg',
  'Shortbread Butter Cookie':  '/images/cat-cookies.jpg',
  'Oatmeal Raisin Cookie':     '/images/cat-cookies.jpg',
};

const DEFAULT_IMAGE = '/images/hero-cake.jpg';

/** Curated signature/bestseller products to display in the Signature Selection section */
const BESTSELLER_NAMES = new Set([
  'Chocolate Truffle Cake',
  'Red Velvet Cake',
  'Classic Fudge Brownie',
  'Salted Caramel Brownie',
  'Almond Croissant',
  'Chocolate Chip Cookie',
]);

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
      : (PRODUCT_FALLBACK_IMAGES[raw.name] ?? CATEGORY_FALLBACK_IMAGE[raw.category] ?? DEFAULT_IMAGE);

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

  const tags =
    Array.isArray(raw.tags) && raw.tags.length > 0
      ? raw.tags
      : BESTSELLER_NAMES.has(raw.name)
        ? ['bestseller']
        : [];

  const mongoId = String(raw._id || raw.id);

  return {
    id:          mongoId,
    _id:         mongoId,
    name:        raw.name,
    description: raw.description ?? '',
    category:    raw.category,
    image,
    variants,
    tags,
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
