/**
 * GUPTA BAKERS — Product Catalogue Data
 * ──────────────────────────────────────
 * PLACEHOLDER DATA for UI prototype.
 * All product names, descriptions, and prices are representative samples
 * and should be replaced with Gupta Bakers' actual catalogue.
 *
 * Images currently use locally generated editorial photography.
 * Replace with actual product photography when available.
 */

export const categories = [
  {
    id: 'cakes',
    name: 'Cakes',
    description: 'Layered, frosted, and crafted for every celebration',
    image: '/images/cat-cakes.jpg',
  },
  {
    id: 'brownies',
    name: 'Brownies',
    description: 'Dense, fudgy, and unapologetically rich',
    image: '/images/cat-brownies.jpg',
  },
  {
    id: 'pastries',
    name: 'Pastries',
    description: 'Flaky, buttery, and fresh from the oven',
    image: '/images/cat-pastries.jpg',
  },
  {
    id: 'cookies',
    name: 'Cookies',
    description: 'Crisp edges, chewy centres, irresistible flavours',
    image: '/images/cat-cookies.jpg',
  },
];

export const occasions = [
  {
    id: 'birthdays',
    name: 'Birthdays',
    tagline: 'Make their day unforgettable',
    icon: '🎂',
  },
  {
    id: 'anniversaries',
    name: 'Anniversaries',
    tagline: 'Sweeten every milestone',
    icon: '💐',
  },
  {
    id: 'kids',
    name: 'Kids\' Celebrations',
    tagline: 'Delightful treats for little ones',
    icon: '🧁',
  },
  {
    id: 'parties',
    name: 'Party Platters',
    tagline: 'Impress every guest',
    icon: '🥂',
  },
  {
    id: 'gifting',
    name: 'Gifting',
    tagline: 'Thoughtful indulgence, beautifully boxed',
    icon: '🎁',
  },
];

/**
 * NOTE: The product catalogue is now dynamically managed and served via the
 * MongoDB backend API (GET /api/products). Hardcoded product prototypes have
 * been seeded into MongoDB and removed from the client bundle.
 */

/** Helper: format price in INR */
export const formatPrice = (amount) => `₹${amount.toLocaleString('en-IN')}`;

