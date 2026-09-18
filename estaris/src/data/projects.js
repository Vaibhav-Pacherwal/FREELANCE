export const projects = [
  {
    slug: "gupta-wears",
    title: "Gupta Wears",
    client: "Gupta Wears Apparel",
    projectType: "Client Project",
    category: "E-Commerce & Digital Storefront",
    year: "2026",
    status: "Delivered & Maintained",
    tagline: "End-to-end men's fashion e-commerce platform with custom variant engine and payment pipeline.",
    overview: "Gupta Wears is a bespoke men's fashion commerce platform engineered to provide a frictionless shopping experience across multiple apparel and footwear categories. Built from scratch with a decoupled architecture, it handles complex catalog variants, dual authentication methods, cloud asset pipelines, and an administrative inventory control center.",
    problem: "The client needed a digital storefront that wasn't constrained by standard templates, capable of handling multi-variant items (different sizes, colors, and dynamic stock levels per combination) while maintaining sub-second catalog navigation and reliable order processing.",
    solution: "We engineered a full-stack React and Node/Express architecture backed by MongoDB. We implemented custom variant matrix logic for stock calculations, integrated Google OAuth alongside standard JWT-secured email auth, built a media pipeline with Cloudinary for fast WebP delivery, and architected an extensible payment gateway adapter.",
    categoriesCovered: [
      "Shoes", "T-Shirts", "Hoodies", "Caps", "Shirts", 
      "Jeans", "Jackets", "Tracksuits", "Pants", "Slippers"
    ],
    technicalHighlights: [
      "Dynamic multi-attribute variant matrix (size, color, SKU stock levels)",
      "Dual authentication with Google OAuth 2.0 and JWT state tokens",
      "Cloudinary asset transformation pipeline for fast responsive image delivery",
      "Persistent cart & wishlist synchronizing seamlessly between anonymous and authenticated sessions",
      "Full administrative inventory management with real-time stock deductions",
      "Production-oriented REST API design with strict payload validation"
    ],
    architecture: {
      frontend: "React (Vite), Modular CSS, Custom State Store",
      backend: "Node.js, Express REST API, JWT Middleware",
      database: "MongoDB, Mongoose ODM with indexed variant schemas",
      storage: "Cloudinary CDN for multi-resolution apparel assets",
      auth: "JWT with HTTP-only cookies & Google OAuth 2.0",
      payments: "Production-ready payment integration architecture"
    },
    metrics: [
      { label: "Apparel Categories", value: "10+" },
      { label: "Variant Dimensions", value: "Size & Color Matrix" },
      { label: "Media Optimization", value: "Cloudinary CDN" },
      { label: "Auth Flow", value: "JWT + Google OAuth" }
    ],
    featured: true,
    visualTheme: {
      accent: "#b45309",
      badgeColor: "bg-amber-100/80 text-amber-900 border-amber-300/60",
      accentBg: "bg-amber-500"
    }
  }
];

