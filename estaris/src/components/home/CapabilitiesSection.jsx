import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, ArrowRight } from 'lucide-react';
import { services } from '../../data/services';

export default function CapabilitiesSection() {
  const [activeSlug, setActiveSlug] = useState(services[0].slug);

  return (
    <section id="services" className="py-24 md:py-36 bg-white border-t border-[#e7e5e0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#e7e5e0]">
          <div>
            <div className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-2">
              Studio Capabilities
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#121316]">
              Services,{' '}
              <span className="font-serif-editorial font-normal text-[#52525b]">
                engineered for growth.
              </span>
            </h2>
          </div>
          <div className="text-sm text-[#52525b] max-w-md">
            We don't sell bloated page builders or commodity themes. We engineer bespoke websites, commerce platforms, and web applications.
          </div>
        </div>

        {/* Interactive Editorial Directory */}
        <div className="divide-y divide-[#e7e5e0] border-y border-[#e7e5e0]">
          {services.map((service) => {
            const isActive = activeSlug === service.slug;

            return (
              <div
                key={service.slug}
                onMouseEnter={() => setActiveSlug(service.slug)}
                onClick={() => setActiveSlug(service.slug)}
                className={`py-8 sm:py-10 transition-colors duration-200 cursor-pointer ${
                  isActive ? 'bg-[#faf9f6]' : 'bg-transparent hover:bg-[#faf9f6]/50'
                }`}
              >
                <div className="px-4 sm:px-8">
                  {/* Top Row: Index, Title, Timeline, Arrow */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-baseline gap-6 sm:gap-10">
                      <span className="text-sm font-semibold text-[#71717a]">
                        {service.number}
                      </span>
                      <h3 className="text-2xl sm:text-4xl font-bold text-[#121316] tracking-tight">
                        {service.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-6 self-end md:self-auto text-xs text-[#71717a] font-medium">
                      <span className="hidden sm:inline-block">Timeline: {service.timeline}</span>
                      <div className={`w-8 h-8 rounded-full border border-[#e7e5e0] flex items-center justify-center transition-transform duration-200 ${isActive ? 'bg-[#121316] text-white border-[#121316] translate-x-1' : 'bg-white text-[#121316]'}`}>
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Narrative & Scope Details */}
                  {isActive && (
                    <div className="mt-8 pt-6 border-t border-[#e7e5e0]/60 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
                      <div className="lg:col-span-5 space-y-4">
                        <p className="font-serif-editorial text-lg sm:text-xl text-[#52525b] leading-relaxed">
                          {service.tagline}
                        </p>
                        <p className="text-sm text-[#71717a] leading-relaxed">
                          {service.description}
                        </p>
                        <div className="pt-2">
                          <Link
                            to={`/services/${service.slug}`}
                            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#121316] hover:text-[#52525b] transition-colors"
                          >
                            <span>Inspect Full Service Specs</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>

                      <div className="lg:col-span-7 bg-white rounded-2xl border border-[#e7e5e0] p-6 sm:p-7 space-y-4 shadow-xs">
                        <div>
                          <div className="text-[11px] uppercase tracking-wider text-[#71717a] font-semibold mb-1">
                            Engineered For:
                          </div>
                          <p className="text-xs sm:text-sm text-[#121316] font-medium">
                            {service.targetAudience}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#f0eee9]">
                          <div className="text-[11px] uppercase tracking-wider text-[#71717a] font-semibold mb-2.5">
                            Included Deliverables:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {service.included.slice(0, 4).map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-[#52525b]">
                                <Check className="w-3.5 h-3.5 text-[#121316] mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#f0eee9] flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="text-[#71717a] mr-2 font-medium">Technologies:</span>
                          {service.technologies.map((t) => (
                            <span key={t} className="px-2.5 py-0.5 rounded-full bg-[#faf9f6] border border-[#e7e5e0] text-[#52525b] font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-xs text-[#71717a]">
          <span>Need a tailored scope or architectural consultation?</span>
          <Link to="/contact" className="font-semibold text-[#121316] uppercase tracking-wider hover:underline flex items-center gap-1">
            <span>Talk to the Founders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
