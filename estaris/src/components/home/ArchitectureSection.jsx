import React from 'react';

export default function ArchitectureSection() {
  const pillars = [
    {
      num: "01",
      title: "Interactive Interfaces",
      tagline: "Speed, ergonomics & accessibility",
      desc: "Sub-second initial paints, zero bloat libraries, and deterministic layouts tested from small mobile viewports up to 4K displays."
    },
    {
      num: "02",
      title: "APIs & Protocols",
      tagline: "Resilient data communication",
      desc: "Predictable RESTful endpoints and strict payload validation in Node.js, ensuring your backend handles traffic spikes gracefully."
    },
    {
      num: "03",
      title: "Authentication & Security",
      tagline: "Frictionless, secure sessions",
      desc: "Signed JWT state tokens in HTTP-only cookies paired with Google OAuth federation for high conversion and rock-solid security."
    },
    {
      num: "04",
      title: "Databases & Schemas",
      tagline: "Sub-50ms indexed queries",
      desc: "Normalized MongoDB data models with compound indexing tailored for multi-attribute catalogs and atomic transactions."
    },
    {
      num: "05",
      title: "Payments & Checkouts",
      tagline: "Frictionless checkout ledgers",
      desc: "Server-orchestrated Razorpay and Stripe pipelines with cryptographic webhook verification preventing client price tampering."
    },
    {
      num: "06",
      title: "Asset Pipelines & Media",
      tagline: "Automated high-fidelity CDN",
      desc: "Cloudinary and edge CDN optimization delivering responsive WebP/AVIF formats with zero layout shifts on mobile devices."
    },
    {
      num: "07",
      title: "Search & Semantic HTML",
      tagline: "Organic discoverability",
      desc: "Clean OpenGraph metadata, structured JSON-LD schemas, and accessible DOM hierarchies that rank effortlessly on search engines."
    },
    {
      num: "08",
      title: "Cloud & Deployment",
      tagline: "Zero-downtime production rollouts",
      desc: "Multi-stage Docker containerization, edge CDN routing, automated SSL provisioning, and complete Git repository handover."
    }
  ];

  return (
    <section className="py-24 md:py-36 bg-[#faf9f6] border-t border-[#e7e5e0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 md:space-y-20">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">
            Technical Disciplines
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#121316] leading-tight">
            We don't just build{' '}
            <span className="font-serif-editorial font-normal text-[#52525b]">
              surface pages.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#52525b] leading-relaxed pt-2">
            A website should feel effortless. The engineering behind a serious digital product must be rigorous. We master the complete technical stack that turns a storefront into an engine of commerce and operations.
          </p>
        </div>

        {/* Editorial Pillars Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar) => (
            <div
              key={pillar.num}
              className="pt-6 border-t border-[#e7e5e0] space-y-3"
            >
              <div className="text-xs font-bold text-[#121316]">
                {pillar.num}
              </div>
              <h3 className="text-xl font-bold text-[#121316] tracking-tight">
                {pillar.title}
              </h3>
              <div className="text-xs text-[#71717a] font-medium">
                {pillar.tagline}
              </div>
              <p className="text-xs text-[#52525b] leading-relaxed pt-1">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Studio Guarantee Banner */}
        <div className="p-8 rounded-3xl bg-white border border-[#e7e5e0] flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#52525b] shadow-xs">
          <div className="space-y-1">
            <div className="text-[#121316] font-bold text-sm">
              Complete Technical Ownership Transferred
            </div>
            <div className="text-[#71717a]">
              Full Git repository handover with clean documentation. Zero vendor lock-in.
            </div>
          </div>
          <div className="flex-shrink-0">
            <span className="px-4 py-2 rounded-full bg-[#faf9f6] border border-[#e7e5e0] text-[#121316] font-semibold uppercase tracking-wider text-[11px]">
              Production Grade
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
