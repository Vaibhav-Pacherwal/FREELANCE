/**
 * SITE DATA — Structured content for Dhruv Chauhan's portfolio.
 * 
 * This file is the single source of truth for all editable content.
 * When a headless CMS is connected, replace these exports with API calls.
 * 
 * TODO: Replace placeholders with real client data:
 * - Phone number
 * - Social media URLs
 * - Real photographs
 * - Verified testimonials
 * - Client logos (with authorization)
 */

export const siteConfig = {
  name: 'Dhruv Chauhan',
  brandName: 'Anchor Dhruv Chauhan',
  tagline: 'Har Event Ka Apna Rockstar!',
  roles: ['Anchor', 'Comedian', 'Dancer', 'Character Artist', 'Entertainer'],
  // TODO: Replace with real contact info
  phone: '+91-XXXXX-XXXXX',
  email: 'contact@dhruvcharcomedian.com',
  whatsapp: 'https://wa.me/91XXXXXXXXXX',
  instagram: 'https://instagram.com/dhruvchauhan',
  youtube: 'https://youtube.com/@dhruvchauhan',
  showreelUrl: '#showreel',
};

export const navigation = [
  { label: 'Home', href: '/', id: 'home' },
  { label: 'About', href: '/about', id: 'about' },
  { label: 'Experiences', href: '/experiences', id: 'experiences' },
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
  // TODO: Replace with Dhruv's real biography
  bio: [
    "Every celebration deserves a storyteller who can turn moments into memories. That's Dhruv Chauhan — an anchor, comedian, dancer, and character artist who has been setting stages on fire with his infectious energy and unmatched versatility.",
    "From the vibrant chaos of Indian weddings to the polished stages of corporate events, Dhruv brings a rare combination of humor, charm, and theatrical brilliance that keeps audiences captivated from the first word to the last dance.",
    "Whether he's hosting a grand sangeet night, delivering a stand-up set that has the crowd in splits, or transforming into one of his legendary characters, Dhruv doesn't just entertain — he creates experiences that people talk about long after the event is over.",
  ],
  // TODO: Add verified stats only
  highlights: [
    { label: 'Events Hosted', value: '___+', note: 'Add verified count' },
    { label: 'Happy Clients', value: '___+', note: 'Add verified count' },
    { label: 'Cities Covered', value: '___+', note: 'Add verified count' },
    { label: 'Years Experience', value: '___+', note: 'Add verified count' },
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
        // TODO: Add real images
        images: [],
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
    description: 'Dhruv\'s signature character performances bring beloved personas to life on stage.',
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
        description: 'A spot-on tribute to the Bollywood legend with signature dialogues and style.',
        images: [],
      },
      {
        id: 'dream-girl',
        title: 'Dream Girl',
        description: 'An entertaining and comedic character act inspired by the iconic Dream Girl.',
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
    description: 'Original stand-up comedy sets that blend observational humor, relatable stories, and high-energy performance.',
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

export const testimonials = [
  // TODO: Replace with real, verified testimonials
  {
    id: 1,
    text: '"Placeholder testimonial — Replace with a genuine review from a verified client. Include specific details about the event type and Dhruv\'s performance."',
    name: 'Client Name',
    event: 'Wedding Event',
    isPlaceholder: true,
  },
  {
    id: 2,
    text: '"Placeholder testimonial — Replace with a genuine review from a verified corporate client."',
    name: 'Client Name',
    event: 'Corporate Event',
    isPlaceholder: true,
  },
  {
    id: 3,
    text: '"Placeholder testimonial — Replace with a genuine review from a private event client."',
    name: 'Client Name',
    event: 'Private Party',
    isPlaceholder: true,
  },
  {
    id: 4,
    text: '"Placeholder testimonial — Replace with a genuine review highlighting Dhruv\'s character performances."',
    name: 'Client Name',
    event: 'Entertainment Show',
    isPlaceholder: true,
  },
];

// TODO: Add authorized client/brand logos only
export const clientLogos = [];

export const galleryItems = [
  // TODO: Replace with real media from Dhruv
  // Each item: { id, src, alt, category, type: 'image'|'video', videoUrl?, caption? }
];

export const bookingFormFields = [
  { name: 'name', label: 'Your Name', type: 'text', required: true, placeholder: 'Full name' },
  { name: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '+91 XXXXX XXXXX' },
  { name: 'email', label: 'Email Address', type: 'email', required: false, placeholder: 'your@email.com' },
  { name: 'eventType', label: 'Event Type', type: 'select', required: true, options: [
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
  ]},
  { name: 'eventDate', label: 'Event Date', type: 'date', required: true, placeholder: '' },
  { name: 'eventLocation', label: 'Event Location', type: 'text', required: true, placeholder: 'City / Venue' },
  { name: 'message', label: 'Tell us more (optional)', type: 'textarea', required: false, placeholder: 'Any specific requirements, theme, or ideas...' },
];
