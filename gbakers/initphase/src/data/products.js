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

/*
 * Placeholder products — prices in INR (₹).
 * Set `isPlaceholder: true` to flag items that need replacement.
 */
export const products = [
  // ── Cakes ──
  {
    id: 'choc-truffle-cake',
    name: 'Chocolate Truffle Cake',
    category: 'cakes',
    price: 650,
    description: 'Layers of rich chocolate sponge enrobed in silky dark truffle ganache.',
    image: '/images/cat-brownies.jpg',
    variants: [
      { label: '500 g', price: 650 },
      { label: '1 kg', price: 1200 },
    ],
    tags: ['bestseller'],
    isPlaceholder: true,
  },
  {
    id: 'vanilla-berry-cake',
    name: 'Vanilla Berry Cake',
    category: 'cakes',
    price: 750,
    description: 'Light vanilla sponge with fresh seasonal berries and cream cheese frosting.',
    image: '/images/cat-cakes.jpg',
    variants: [
      { label: '500 g', price: 750 },
      { label: '1 kg', price: 1400 },
    ],
    tags: ['birthday'],
    isPlaceholder: true,
  },
  {
    id: 'butterscotch-cake',
    name: 'Butterscotch Crunch Cake',
    category: 'cakes',
    price: 600,
    description: 'Caramel-laced sponge with toasted praline and butterscotch drizzle.',
    image: '/images/cat-cakes.jpg',
    variants: [
      { label: '500 g', price: 600 },
      { label: '1 kg', price: 1100 },
    ],
    tags: [],
    isPlaceholder: true,
  },
  {
    id: 'red-velvet-cake',
    name: 'Red Velvet Cake',
    category: 'cakes',
    price: 700,
    description: 'Classic crimson layers with tangy cream cheese frosting and white chocolate shavings.',
    image: '/images/cat-brownies.jpg',
    variants: [
      { label: '500 g', price: 700 },
      { label: '1 kg', price: 1300 },
    ],
    tags: ['bestseller', 'anniversary'],
    isPlaceholder: true,
  },

  // ── Brownies ──
  {
    id: 'classic-fudge-brownie',
    name: 'Classic Fudge Brownie',
    category: 'brownies',
    price: 120,
    description: 'Dense, intensely chocolatey, with a crackly top and molten centre.',
    image: '/images/cat-brownies.jpg',
    variants: [
      { label: 'Single', price: 120 },
      { label: 'Box of 4', price: 450 },
    ],
    tags: ['bestseller'],
    isPlaceholder: true,
  },
  {
    id: 'walnut-brownie',
    name: 'Walnut Brownie',
    category: 'brownies',
    price: 140,
    description: 'Rich chocolate brownie studded with toasted walnuts.',
    image: '/images/cat-brownies.jpg',
    variants: [
      { label: 'Single', price: 140 },
      { label: 'Box of 4', price: 520 },
    ],
    tags: [],
    isPlaceholder: true,
  },
  {
    id: 'salted-caramel-brownie',
    name: 'Salted Caramel Brownie',
    category: 'brownies',
    price: 150,
    description: 'Dark chocolate brownie swirled with house-made salted caramel.',
    image: '/images/cat-brownies.jpg',
    variants: [
      { label: 'Single', price: 150 },
      { label: 'Box of 4', price: 560 },
    ],
    tags: ['bestseller'],
    isPlaceholder: true,
  },

  // ── Pastries ──
  {
    id: 'butter-croissant',
    name: 'Butter Croissant',
    category: 'pastries',
    price: 120,
    description: 'Hand-laminated, golden, and impossibly flaky.',
    image: '/images/cat-pastries.jpg',
    variants: [
      { label: 'Single', price: 120 },
      { label: 'Box of 3', price: 340 },
    ],
    tags: [],
    isPlaceholder: true,
  },
  {
    id: 'almond-croissant',
    name: 'Almond Croissant',
    category: 'pastries',
    price: 150,
    description: 'Twice-baked croissant filled with almond frangipane and topped with sliced almonds.',
    image: '/images/cat-pastries.jpg',
    variants: [
      { label: 'Single', price: 150 },
      { label: 'Box of 3', price: 420 },
    ],
    tags: ['bestseller'],
    isPlaceholder: true,
  },
  {
    id: 'danish-pastry',
    name: 'Fruit Danish',
    category: 'pastries',
    price: 130,
    description: 'Buttery puff pastry cradling custard cream and seasonal fruit.',
    image: '/images/cat-pastries.jpg',
    variants: [
      { label: 'Single', price: 130 },
    ],
    tags: [],
    isPlaceholder: true,
  },

  // ── Cookies ──
  {
    id: 'choc-chip-cookie',
    name: 'Chocolate Chip Cookie',
    category: 'cookies',
    price: 80,
    description: 'Crisp-edged, chewy-centred, loaded with dark and milk chocolate chips.',
    image: '/images/cat-cookies.jpg',
    variants: [
      { label: 'Single', price: 80 },
      { label: 'Box of 6', price: 450 },
    ],
    tags: ['bestseller'],
    isPlaceholder: true,
  },
  {
    id: 'butter-cookie',
    name: 'Shortbread Butter Cookie',
    category: 'cookies',
    price: 60,
    description: 'Melt-in-the-mouth buttery shortbread, stamped with a heritage pattern.',
    image: '/images/cat-cookies.jpg',
    variants: [
      { label: 'Single', price: 60 },
      { label: 'Box of 8', price: 450 },
    ],
    tags: [],
    isPlaceholder: true,
  },
  {
    id: 'oatmeal-raisin-cookie',
    name: 'Oatmeal Raisin Cookie',
    category: 'cookies',
    price: 80,
    description: 'Hearty oats, juicy raisins, and warm cinnamon in every bite.',
    image: '/images/cat-cookies.jpg',
    variants: [
      { label: 'Single', price: 80 },
      { label: 'Box of 6', price: 450 },
    ],
    tags: [],
    isPlaceholder: true,
  },
];

/** Helper: get bestseller products */
export const getBestsellers = () => products.filter(p => p.tags.includes('bestseller'));

/** Helper: get products by category */
export const getByCategory = (categoryId) => products.filter(p => p.category === categoryId);

/** Helper: format price in INR */
export const formatPrice = (amount) => `₹${amount.toLocaleString('en-IN')}`;
