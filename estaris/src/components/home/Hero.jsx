import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ShoppingBag } from 'lucide-react';
import Button from '../common/Button';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#faf9f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Editorial Statement & CTAs */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#71717a] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#121316]" />
                <span>Digital Studio · Founded in 2026</span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#121316] leading-[1.05]">
                We craft{' '}
                <span className="font-serif-editorial font-normal text-[#52525b] block sm:inline">
                  digital experiences
                </span>{' '}
                with intent & rigor.
              </h1>
            </div>

            <p className="text-base sm:text-lg text-[#52525b] leading-relaxed max-w-xl font-normal">
              Estaris is an independent digital studio founded by Vaibhav Pacherwal and Karan Jangra—two fourth-year NSUT engineers building bespoke websites, commerce platforms, and web applications for businesses that value design and precision engineering.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button to="/contact" variant="primary" size="lg" arrow>
                Start a Project
              </Button>
              <Button to="/work" variant="outline" size="lg">
                View Selected Work
              </Button>
            </div>

            {/* Studio Index Ticker */}
            <div className="pt-8 border-t border-[#e7e5e0] grid grid-cols-3 gap-4 text-xs text-[#71717a]">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-[#a1a1aa] mb-1">01 / Client Work</div>
                <div className="font-semibold text-[#121316]">Gupta Wears</div>
                <div className="text-[12px] text-[#71717a] mt-0.5">E-Commerce Storefront</div>
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-[#a1a1aa] mb-1">02 / Studio Focus</div>
                <div className="font-semibold text-[#121316]">Design & Engineering</div>
                <div className="text-[12px] text-[#71717a] mt-0.5">Bespoke Digital Products</div>
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-[#a1a1aa] mb-1">03 / Studio Base</div>
                <div className="font-semibold text-[#121316]">Founded in 2026</div>
                <div className="text-[12px] text-[#71717a] mt-0.5">New Delhi · Remote</div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Craft Browser Showcase of Gupta Wears (Client Project) */}
          <div className="lg:col-span-6">
            <Link to="/work/gupta-wears" className="block group">
              <div className="rounded-2xl bg-white border border-[#e7e5e0] shadow-[0_4px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-[#d5d2cb] transition-all duration-300 overflow-hidden">
                
                {/* Browser Top Navigation Bar */}
                <div className="px-5 py-3.5 bg-[#f4f3ef] border-b border-[#e7e5e0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d5d2cb] inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d5d2cb] inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d5d2cb] inline-block" />
                    <span className="ml-2 text-xs font-medium text-[#71717a]">
                      guptawears.com
                    </span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300/70 font-medium">
                    Client Project
                  </span>
                </div>

                {/* Simulated Storefront Interface */}
                <div className="p-6 sm:p-8 space-y-6 bg-white">
                  {/* Store Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#f0eee9]">
                    <div>
                      <span className="text-[11px] font-semibold tracking-wider text-[#71717a] uppercase block">
                        Featured Client Project
                      </span>
                      <h2 className="text-xl font-bold tracking-tight text-[#121316] mt-0.5">
                        Gupta Wears Apparel
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#52525b] font-medium">
                      <span>10 Categories</span>
                      <span>•</span>
                      <span>Custom Variant Engine</span>
                    </div>
                  </div>

                  {/* Featured Item Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center p-4 rounded-xl bg-[#faf9f6] border border-[#e7e5e0]">
                    <div className="sm:col-span-4 aspect-square rounded-lg bg-stone-200/70 flex flex-col justify-between p-3 relative overflow-hidden">
                      <div className="flex justify-between items-center text-[10px] text-[#71717a] font-medium">
                        <span>DROP 01</span>
                        <span className="text-amber-800 font-semibold">IN STOCK</span>
                      </div>
                      <div className="text-center py-4">
                        <ShoppingBag className="w-8 h-8 mx-auto text-[#71717a] opacity-80" />
                        <div className="text-xs font-medium text-[#52525b] mt-2">Knit Hoodie</div>
                      </div>
                      <div className="text-[10px] text-[#71717a] text-center">
                        SKU: GW-HD-09
                      </div>
                    </div>

                    <div className="sm:col-span-8 space-y-3">
                      <div>
                        <div className="text-sm font-bold text-[#121316]">Men's Heavyweight Knit Hoodie</div>
                        <div className="text-xs text-[#71717a] mt-0.5">Onyx Black / Slate Grey / Camel Tan</div>
                      </div>

                      {/* Variant selector */}
                      <div className="space-y-1.5 text-xs">
                        <div className="text-[11px] font-medium text-[#71717a] uppercase">Size Selection:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {['S', 'M', 'L (Selected)', 'XL', 'XXL'].map((size, idx) => (
                            <span
                              key={size}
                              className={`px-2.5 py-0.5 rounded text-[11px] border ${
                                idx === 2
                                  ? 'bg-[#121316] text-white border-[#121316] font-medium'
                                  : 'bg-white border-[#e7e5e0] text-[#52525b]'
                              }`}
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-emerald-700 font-medium">Cart & Wishlist Persistence</span>
                        <span className="text-[#121316] font-bold">₹2,499</span>
                      </div>
                    </div>
                  </div>

                  {/* Architecture Badges */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="p-2 rounded-lg bg-[#f4f3ef] border border-[#e7e5e0] text-[#52525b] font-medium">
                      Google OAuth
                    </div>
                    <div className="p-2 rounded-lg bg-[#f4f3ef] border border-[#e7e5e0] text-[#52525b] font-medium">
                      Cloudinary CDN
                    </div>
                    <div className="p-2 rounded-lg bg-[#f4f3ef] border border-[#e7e5e0] text-[#52525b] font-medium">
                      MongoDB Schema
                    </div>
                  </div>

                  {/* Deep Dive Action */}
                  <div className="pt-2 flex items-center justify-between text-xs font-medium text-[#52525b] group-hover:text-[#121316] transition-colors">
                    <span>Explore Gupta Wears Case Study</span>
                    <span className="flex items-center gap-1 font-semibold text-[#121316]">
                      <span>View Project</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
