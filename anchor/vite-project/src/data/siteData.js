/**
 * SITE DATA — Structured content for Dhruv Chauhan's portfolio.
 *
 * This file is the single source of truth for all editable content.
 * When a headless CMS is connected, replace these exports with API calls.
 *
 * ─── HOW TO UPDATE CONTENT FROM YOUR PHONE ───
 * Option A (current): Edit this file on GitHub mobile app or Netlify's CMS UI.
 * Option B (recommended next step): Connect Netlify CMS or Sanity.io.
 * See /CONTENT_GUIDE.md for full instructions.
 *
 * TODO before launch — confirm with Dhruv:
 * - Real phone number
 * - Social media URLs
 * - Real photographs & video links
 * - Verified testimonials (text, reviewer name, event type, source URL)
 * - Authorized client/brand logos
 * - Verified stats (events hosted, cities, years)
 * - Pricing decision (see pricingStrategy below)
 */

export const siteConfig = {
  name: 'Dhruv Chauhan',
  brandName: 'Anchor Dhruv Chauhan',
  tagline: 'Har Event Ka Apna Rockstar!',
  roles: ['Anchor', 'Comedian', 'Dancer', 'Character Artist', 'Entertainer'],

  // ── TODO: Replace with real contact info confirmed by Dhruv ──
  phone: '+91-9582585258',        // Replace: e.g. '+919876543210'
  email: 'anchordc.dhruvchauhan06@gmail.com',  // Replace with real email
  whatsapp: 'https://wa.me/919582585258', // Replace XXXXXXXXXX with real number
  instagram: 'https://www.instagram.com/anchor.dhruvchauhan?dlrf=MWszZXNlaGR4ZGVr&utm_source=qr', // Replace with real handle
  youtube: 'https://youtube.com/@dhruvchauhan',    // Replace with real channel
  showreelUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_SHOWREEL', // Replace
};

export const navigation = [
  { label: 'Home', href: '/', id: 'home' },
  { label: 'About', href: '/about', id: 'about' },
  { label: 'Experiences', href: '/experiences', id: 'experiences' },
  { label: 'Corporate', href: '/corporate-anchor', id: 'corporate-anchor' },
  { label: 'Gallery', href: '/gallery', id: 'gallery' },
  { label: 'Contact', href: '/contact', id: 'contact' },
];

export const heroSlider = [
  { label: 'Wedding Shows', icon: '💍', color: 'var(--hot-magenta)' },
  { label: 'Corporate Shows', icon: '🎤', color: 'var(--teal)' },
  { label: 'Entertainment', icon: '🎭', color: 'var(--orange)' },
  { label: 'Stand-up Comedy', icon: '😂', color: 'var(--marigold-deep)' },
  { label: 'Character Artist', icon: '🎬', color: 'var(--coral-deep)' },
];

export const aboutContent = {
  headline: 'The Soul Behind the Stage',
  // TODO: Replace with Dhruv's real biography (confirmed by him)
  bio: [
    "Every celebration deserves a storyteller who can turn moments into memories. That's Dhruv Chauhan — an anchor, comedian, dancer, and character artist who has been setting stages on fire with his infectious energy and unmatched versatility.",
    "From the vibrant chaos of Indian weddings to the polished stages of corporate events, Dhruv brings a rare combination of humor, charm, and theatrical brilliance that keeps audiences captivated from the first word to the last dance.",
    "Whether he's hosting a grand sangeet night, delivering a stand-up set that has the crowd in splits, or transforming into one of his legendary characters, Dhruv doesn't just entertain — he creates experiences that people talk about long after the event is over.",
  ],
  // TODO: Replace with verified numbers confirmed by Dhruv before publishing
  highlights: [
    { label: 'Events Hosted', value: '500+', note: 'Confirm count with Dhruv' },
    { label: 'Happy Clients', value: '400+', note: 'Confirm count with Dhruv' },
    { label: 'Cities Covered', value: '20+', note: 'Confirm count with Dhruv' },
    { label: 'Years Experience', value: '8+', note: 'Confirm count with Dhruv' },
  ],
};

export const experiences = [
  {
    id: 'wedding',
    title: 'Wedding',
    emoji: '💍',
    tagline: 'Where every moment becomes a celebration',
    color: 'var(--hot-magenta)',
    bgColor: 'var(--peach)',
    description: 'From the first beat of the dhol to the final bidaai, Dhruv transforms wedding events into unforgettable theatrical experiences.',
    subcategories: [
      {
        id: 'haldi',
        title: 'Haldi',
        description: 'Fun-filled haldi ceremonies with games, laughter, and the perfect mix of tradition and entertainment.',
        images: [], // TODO: Add real images { src, alt }
      },
      {
        id: 'mehndi',
        title: 'Mehndi',
        description: 'Vibrant mehndi nights with dance performances, audience engagement, and high-energy hosting.',
        images: [],
      },
      {
        id: 'sangeet',
        title: 'Sangeet',
        description: 'Spectacular sangeet shows with choreographed performances, comedy acts, and seamless event hosting.',
        images: [],
      },
    ],
  },
  {
    id: 'corporate',
    title: 'Corporate',
    emoji: '🏢',
    tagline: 'Professional entertainment, unforgettable impact',
    color: 'var(--teal)',
    bgColor: 'var(--cream)',
    description: 'Elevating corporate gatherings with the perfect blend of professionalism and entertainment.',
    subcategories: [
      {
        id: 'team-building',
        title: 'Team Building',
        description: 'Interactive team-building sessions that bring colleagues together through fun, games, and shared laughter.',
        images: [],
      },
      {
        id: 'conference',
        title: 'Conference',
        description: 'Professional conference hosting with sharp wit, smooth transitions, and audience engagement.',
        images: [],
      },
      {
        id: 'family-day',
        title: 'Family Day',
        description: 'Corporate family day events with entertainment for all ages — from kids to senior management.',
        images: [],
      },
      {
        id: 'festival-celebration',
        title: 'Festival Celebration',
        description: 'Diwali bashes, Holi events, and festive corporate celebrations hosted with flair.',
        images: [],
      },
    ],
  },
  {
    id: 'character-artist',
    title: 'Character Artist',
    emoji: '🎭',
    tagline: 'One artist, infinite characters',
    color: 'var(--orange)',
    bgColor: 'var(--marigold)',
    description: "Dhruv's signature character performances bring beloved personas to life on stage.",
    // NOTE: These names are working labels provided by Dhruv.
    // Confirm exact spellings, character identities, and media before launch.
    // Do not imply endorsement by or affiliation with any real celebrity.
    subcategories: [
      {
        id: 'jeriwal',
        title: 'Jeriwal',
        description: 'A crowd-favourite character performance that brings the house down every time.',
        images: [],
      },
      {
        id: 'sunil-shetty',
        title: 'Sunil Shetty',
        description: 'A spot-on tribute act with signature dialogues and style. (Confirm character name with Dhruv.)',
        images: [],
      },
      {
        id: 'dream-girl',
        title: 'Dream Girl',
        description: 'An entertaining and comedic character act. (Confirm character identity with Dhruv.)',
        images: [],
      },
      {
        id: 'pooja',
        title: 'Pooja',
        description: 'A hilarious character performance that has audiences in splits.',
        images: [],
      },
      {
        id: 'dubai-ka-sheikh',
        title: 'Dubai ka Sheikh',
        description: 'A grand, theatrical character act featuring the larger-than-life Dubai ka Sheikh persona.',
        images: [],
      },
    ],
  },
  {
    id: 'stand-up-comedy',
    title: 'Stand-up Comedy',
    emoji: '🎙️',
    tagline: 'Laughter guaranteed, tears (of joy) optional',
    color: 'var(--marigold-deep)',
    bgColor: 'var(--cream-warm)',
    description: 'Original stand-up comedy sets that blend observational humour, relatable stories, and high-energy performance.',
    subcategories: [
      {
        id: 'live-shows',
        title: 'Live Shows',
        description: 'Full-length stand-up comedy shows at venues, clubs, and private events.',
        images: [],
      },
      {
        id: 'event-comedy',
        title: 'Event Comedy Sets',
        description: 'Custom comedy sets tailored for weddings, corporate events, and private parties.',
        images: [],
      },
    ],
  },
];

/**
 * TESTIMONIALS
 *
 * Rules:
 * - Only add genuine, verified reviews.
 * - isPlaceholder: true → shown only in development; hidden in production.
 * - source: platform name (e.g. 'Google', 'Instagram DM', 'WeddingWire')
 * - sourceUrl: direct link to the original review if publicly available
 * - category: 'wedding' | 'corporate' | 'character-artist' | 'stand-up-comedy' | 'general'
 *
 * TODO: Replace every placeholder below with real reviews from Dhruv's clients.
 */
export const testimonials = [
  {
    id: 1,
    text: '"[Placeholder] Replace with a genuine review from a verified wedding client. Include what made Dhruv\'s performance special."',
    name: 'Client Name',
    role: 'Bride\'s Family',
    event: 'Wedding — Sangeet',
    category: 'wedding',
    source: 'Google',
    sourceUrl: null, // Add real URL when available
    isPlaceholder: true,
  },
  {
    id: 2,
    text: '"[Placeholder] Replace with a genuine review from a verified corporate client. Include the event type and Dhruv\'s impact."',
    name: 'Client Name',
    role: 'HR Manager',
    event: 'Corporate — Family Day',
    category: 'corporate',
    source: 'LinkedIn',
    sourceUrl: null,
    isPlaceholder: true,
  },
  {
    id: 3,
    text: '"[Placeholder] Replace with a genuine review highlighting Dhruv\'s character performances or comedy act."',
    name: 'Client Name',
    role: 'Event Organiser',
    event: 'Entertainment Show',
    category: 'character-artist',
    source: 'Instagram',
    sourceUrl: null,
    isPlaceholder: true,
  },
  {
    id: 4,
    text: '"[Placeholder] Replace with a genuine review from a corporate booking. Include company type and event format."',
    name: 'Client Name',
    role: 'Corporate Event Manager',
    event: 'Corporate — Conference',
    category: 'corporate',
    source: 'Google',
    sourceUrl: null,
    isPlaceholder: true,
  },
];

/**
 * CLIENT LOGOS
 * Only add logos for clients/brands that have authorized their use on this site.
 * Each entry: { id, src, alt, url }
 */
export const clientLogos = [
  // TODO: Add authorized logos only.
  // Example: { id: 'company-a', src: '/logos/company-a.png', alt: 'Company A', url: 'https://companya.com' }
];

/**
 * GALLERY ITEMS
 * Each item: { id, src, alt, category, subcategory, type: 'image'|'video',
 *              videoUrl?, caption?, isPlaceholder? }
 * categories match experience IDs: 'wedding', 'corporate', 'character-artist', 'stand-up-comedy'
 */
export const galleryItems = [
  // TODO: Add real media provided by Dhruv.
  // Images should be optimized (WebP preferred, max 800px wide for cards).
  // Videos: use YouTube embed URLs (youtube.com/embed/VIDEO_ID).
];

/**
 * SHOWREEL VIDEOS
 * Used in the hero showreel section and corporate page.
 */
export const showreels = {
  general: {
    // TODO: Replace with real YouTube embed URL
    embedUrl: null, // e.g. 'https://www.youtube.com/embed/VIDEO_ID'
    thumbnailUrl: null,
    title: 'Dhruv Chauhan — Performance Showreel',
  },
  corporate: {
    // TODO: Replace with corporate-specific footage embed
    embedUrl: null,
    thumbnailUrl: null,
    title: 'Dhruv Chauhan — Corporate Hosting Showreel',
  },
};

/**
 * PRICING STRATEGY
 *
 * ─── IMPORTANT: READ BEFORE PUBLISHING ───
 * Do not publish prices without Dhruv's written confirmation.
 *
 * Three options:
 *  'inquiry'   → "Request a Quote" (no numbers shown — current default)
 *  'starting'  → Show "Starting from ₹X" (requires Dhruv to confirm a real minimum)
 *  'packages'  → Show defined packages (requires Dhruv to confirm inclusions & prices)
 *
 * Current strategy: 'inquiry' (safe default — no invented prices displayed)
 *
 * To switch to 'starting', set strategy to 'starting' and confirm startingFrom with Dhruv.
 * To switch to 'packages', set strategy to 'packages' and fill the packages array.
 */
export const pricingStrategy = {
  strategy: 'inquiry', // 'inquiry' | 'starting' | 'packages'

  // Only used when strategy === 'starting'
  startingFrom: null, // e.g. '₹15,000' — confirm with Dhruv before setting

  // Only used when strategy === 'packages'
  packages: [
    // Example structure — do NOT publish without Dhruv's written approval:
    // {
    //   id: 'wedding-basic',
    //   name: 'Wedding Starter',
    //   price: '₹XX,XXX',
    //   duration: 'Up to 2 hours',
    //   includes: ['Haldi or Mehndi hosting', 'Games & audience engagement', 'Sound coordination'],
    //   excludes: ['Travel outside [city]', 'Multi-day bookings'],
    //   note: 'Price valid for Delhi NCR. Travel charges apply for other cities.',
    //   cta: 'Enquire About This Package',
    // },
  ],

  quoteFactors: [
    'Event format and number of functions',
    'Duration of hosting required',
    'Event location and travel distance',
    'Date and season',
    'Character artist or specific performance requirements',
    'Audience size',
  ],
};

/**
 * CORPORATE PAGE — additional data
 */
export const corporateContent = {
  heroHeadline: 'Professional Anchoring for Corporate Events',
  heroSubline: 'Conference Host · Team Building Facilitator · Festival Emcee · Family Day Host',
  intro: "Corporate events deserve a host who understands professionalism and audience engagement in equal measure. Dhruv Chauhan brings stage confidence, quick wit, and seamless event coordination to corporate stages — from intimate team sessions to large-scale conferences.",

  formats: [
    {
      id: 'team-building',
      title: 'Team Building',
      emoji: '🤝',
      description: 'High-energy team activities, interactive games, and facilitated sessions that get colleagues laughing, bonding, and collaborating.',
      audienceSize: 'Any size',
      duration: '1–4 hours',
    },
    {
      id: 'conference',
      title: 'Conference & Summits',
      emoji: '🎙️',
      description: 'Professional stage presence for keynotes, panel introductions, segment transitions, and audience Q&A facilitation.',
      audienceSize: '50–5000+',
      duration: 'Half-day to full-day',
    },
    {
      id: 'family-day',
      title: 'Family Day',
      emoji: '🎪',
      description: 'Entertainment for employees and their families — from kids\' games to group activities — hosted with warmth and energy.',
      audienceSize: '50–2000',
      duration: '2–6 hours',
    },
    {
      id: 'festival-celebration',
      title: 'Festival Celebration',
      emoji: '🪔',
      description: 'Diwali galas, Holi events, New Year parties, and annual day celebrations hosted with cultural flair and high energy.',
      audienceSize: '100–5000+',
      duration: '1–3 hours',
    },
  ],

  // TODO: Add verified corporate testimonials only
  testimonials: [
    {
      id: 'corp-1',
      text: '"[Placeholder] Replace with a genuine review from a verified HR manager or corporate event organiser."',
      name: 'HR Manager Name',
      company: 'Company Name',
      event: 'Annual Day / Team Building',
      isPlaceholder: true,
    },
    {
      id: 'corp-2',
      text: '"[Placeholder] Replace with a genuine review from a verified corporate client."',
      name: 'Event Manager Name',
      company: 'Company Name',
      event: 'Conference / Family Day',
      isPlaceholder: true,
    },
  ],

  faqs: [
    {
      q: 'Which cities does Dhruv cover?',
      a: 'TODO: Confirm primary cities and travel policy with Dhruv. Travel charges may apply for events outside the base city.',
    },
    {
      q: 'What languages does Dhruv host in?',
      a: 'TODO: Confirm languages (e.g. Hindi, English, regional languages) with Dhruv.',
    },
    {
      q: 'How far in advance should we book?',
      a: 'We recommend booking at least 4–6 weeks in advance for corporate events, and earlier for peak seasons (Oct–Feb). Contact us to check availability.',
    },
    {
      q: 'Does Dhruv provide his own mic and sound equipment?',
      a: 'TODO: Confirm technical requirements and what Dhruv typically provides vs. venue setup. Clarify with Dhruv before publishing.',
    },
    {
      q: 'Can the programme be customised for our brand or theme?',
      a: 'Yes — Dhruv works with your event team to tailor the programme, script key transitions, and ensure the content aligns with your company culture and event objectives.',
    },
    {
      q: 'What is the fee for a corporate show?',
      a: 'Fees depend on the event format, duration, location, and specific requirements. Contact us for a custom quote.',
    },
    {
      q: 'Do you provide a contract or formal agreement?',
      a: 'TODO: Confirm with Dhruv whether a formal contract/agreement is standard, and what it covers.',
    },
  ],
};

/**
 * BOOKING FORM — General inquiry
 */
export const bookingFormFields = [
  { name: 'name', label: 'Your Name', type: 'text', required: true, placeholder: 'Full name' },
  { name: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '+91 95825 85258' },
  { name: 'email', label: 'Email Address', type: 'email', required: false, placeholder: 'your@email.com' },
  {
    name: 'eventType', label: 'Event Type', type: 'select', required: true, options: [
      'Wedding — Haldi',
      'Wedding — Mehndi',
      'Wedding — Sangeet',
      'Corporate — Team Building',
      'Corporate — Conference',
      'Corporate — Family Day',
      'Corporate — Festival Celebration',
      'Character Performance',
      'Stand-up Comedy Show',
      'Private Party',
      'Other',
    ],
  },
  { name: 'eventDate', label: 'Event Date', type: 'date', required: true, placeholder: '' },
  { name: 'eventLocation', label: 'Event Location', type: 'text', required: true, placeholder: 'City / Venue' },
  { name: 'message', label: 'Tell us more (optional)', type: 'textarea', required: false, placeholder: 'Any specific requirements, theme, or ideas...' },
];

/**
 * BOOKING FORM — Corporate inquiry (extended fields)
 */
export const corporateFormFields = [
  { name: 'contactName', label: 'Contact Person Name', type: 'text', required: true, placeholder: 'Your full name' },
  { name: 'company', label: 'Company / Organisation', type: 'text', required: true, placeholder: 'Company name' },
  { name: 'workEmail', label: 'Work Email', type: 'email', required: true, placeholder: 'you@company.com' },
  { name: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '+91 95825 85258' },
  {
    name: 'eventType', label: 'Event Format', type: 'select', required: true, options: [
      'Team Building',
      'Conference / Summit',
      'Family Day',
      'Festival Celebration (Diwali / Holi / etc.)',
      'Annual Day / Award Night',
      'Product Launch',
      'Other Corporate Event',
    ],
  },
  { name: 'eventDate', label: 'Event Date (or tentative)', type: 'date', required: false, placeholder: '' },
  { name: 'eventLocation', label: 'City / Venue', type: 'text', required: true, placeholder: 'Delhi NCR / Mumbai / etc.' },
  {
    name: 'audienceSize', label: 'Approximate Audience Size', type: 'select', required: false, options: [
      'Up to 50 people',
      '50–200 people',
      '200–500 people',
      '500–1000 people',
      '1000+ people',
    ],
  },
  { name: 'duration', label: 'Hosting Duration Required', type: 'text', required: false, placeholder: 'e.g. 2 hours, half-day, full-day' },
  { name: 'message', label: 'Additional Requirements (optional)', type: 'textarea', required: false, placeholder: 'Theme, language preference, special requirements...' },
];
