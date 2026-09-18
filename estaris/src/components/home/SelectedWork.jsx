import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ShoppingBag, ArrowRight } from 'lucide-react';
import { projects } from '../../data/projects';
import Button from '../common/Button';

export default function SelectedWork() {
  const guptaWears = projects.find(p => p.slug === 'gupta-wears') || projects[0];

  return (
    <section id="work" className="py-24 md:py-36 bg-[#faf9f6] border-t border-[#e7e5e0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#e7e5e0]">
          <div>
            <div className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-2">
              Selected Work
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#121316]">
              Real client work,{' '}
              <span className="font-serif-editorial font-normal text-[#52525b]">
                engineered with intent.
              </span>
            </h2>
          </div>
          <div className="flex-shrink-0">
            <Button to="/work" variant="outline" size="md" arrow>
              View Work
            </Button>
          </div>
        </div>

        {/* Featured Showcase: Gupta Wears (Client Project) */}
        <article className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 pb-4 border-b border-[#e7e5e0]">
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="px-3 py-1 rounded-full bg-[#121316] text-white font-medium uppercase text-[10px] tracking-wider">
                Client Project
              </span>
              <span className="text-[#71717a]">E-Commerce & Digital Storefront</span>
            </div>
            <div className="text-xs text-[#71717a]">
              Delivered & Maintained
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left: Project Narrative */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h3 className="text-3xl sm:text-5xl font-bold text-[#121316] tracking-tight">
                  Gupta Wears
                </h3>
                <p className="mt-2 font-serif-editorial text-xl sm:text-2xl text-[#52525b]">
                  Men's Fashion E-Commerce Storefront
                </p>
              </div>

              <p className="text-sm sm:text-base text-[#52525b] leading-relaxed">
                Gupta Wears is a bespoke men's fashion commerce platform engineered to deliver a fluid shopping experience across 10+ apparel categories. We built it from scratch to handle complex size and color combinations, customer authentication, and fast media delivery without relying on off-the-shelf templates.
              </p>

              {/* Scope Checklist */}
              <div className="space-y-2.5 pt-2">
                {[
                  "Dynamic multi-attribute variant matrix (size, color, SKU stock levels)",
                  "Dual authentication with Google OAuth 2.0 and JWT state tokens",
                  "Cloudinary asset transformation pipeline for fast responsive images",
                  "Persistent cart & wishlist across anonymous and authenticated sessions",
                  "Production-oriented REST API design with strict payload validation"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#52525b]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#121316] mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Metrics Bar */}
              <div className="pt-4 grid grid-cols-2 gap-4 border-t border-[#e7e5e0] text-xs">
                <div>
                  <span className="text-[#71717a] text-[11px] font-medium uppercase tracking-wider block">Catalog Scope</span>
                  <span className="text-[#121316] font-semibold text-sm">10 Apparel Categories</span>
                </div>
                <div>
                  <span className="text-[#71717a] text-[11px] font-medium uppercase tracking-wider block">Architecture</span>
                  <span className="text-[#121316] font-semibold text-sm">React · Node · Mongo · JWT</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/work/gupta-wears"
                  className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#121316] hover:text-[#52525b] transition-colors"
                >
                  <span>Read Detailed Case Study</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right: UI Showcase Composition */}
            <div className="lg:col-span-7">
              <Link to="/work/gupta-wears" className="block group">
                <div className="rounded-2xl bg-white border border-[#e7e5e0] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.07)] hover:border-[#d5d2cb] transition-all duration-300 p-6 sm:p-9 space-y-6">
                  
                  {/* Browser Bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#e7e5e0] text-xs text-[#71717a]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d5d2cb]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d5d2cb]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d5d2cb]" />
                      <span className="ml-2 text-[#121316] font-medium">guptawears.com</span>
                    </div>
                    <span className="text-amber-800 font-medium text-[11px] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Client Storefront
                    </span>
                  </div>

                  {/* Visual Product Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#e7e5e0] space-y-3">
                      <div className="aspect-[4/3] rounded-lg bg-stone-200/80 flex items-center justify-center text-[#71717a]">
                        <ShoppingBag className="w-10 h-10 opacity-70" />
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-[#71717a] uppercase">Category 01</div>
                        <div className="text-sm font-bold text-[#121316]">Heavyweight Hoodies</div>
                        <div className="text-xs text-[#52525b] mt-1 font-medium">₹2,499 · Multi-Variant</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#e7e5e0] space-y-3">
                      <div className="aspect-[4/3] rounded-lg bg-stone-200/80 flex items-center justify-center text-[#71717a]">
                        <ShoppingBag className="w-10 h-10 opacity-70" />
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-[#71717a] uppercase">Category 02</div>
                        <div className="text-sm font-bold text-[#121316]">Tailored Tracksuits</div>
                        <div className="text-xs text-[#52525b] mt-1 font-medium">₹3,199 · S to XXL</div>
                      </div>
                    </div>
                  </div>

                  {/* Variant Logic Bar */}
                  <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#e7e5e0] text-xs space-y-2">
                    <div className="flex justify-between items-center text-[11px] text-[#71717a] font-medium uppercase">
                      <span>Catalog Variant Support</span>
                      <span className="text-emerald-700">Stock Deductions</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['Shoes', 'Hoodies', 'Shirts', 'Jeans', 'Jackets', 'Pants'].map((c) => (
                        <span key={c} className="px-2.5 py-1 rounded-md bg-white border border-[#e7e5e0] text-[11px] text-[#52525b] font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </article>

      </div>
    </section>
  );
}
