import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { projects } from '../data/projects';
import FinalCTA from '../components/home/FinalCTA';

export default function WorkPage() {
  return (
    <div className="pt-32 pb-24 bg-[#faf9f6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Page Header */}
        <div className="space-y-4 pb-8 border-b border-[#e7e5e0]">
          <div className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">
            Client Work & Portfolio
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#121316]">
            Selected{' '}
            <span className="font-serif-editorial font-normal text-[#52525b]">
              client work.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#52525b] max-w-2xl leading-relaxed">
            Every client project represents deliberate system architecture, production performance, and bespoke design authored by Estaris.
          </p>
        </div>

        {/* Editorial Project List */}
        <div className="space-y-16">
          {projects.map((project) => (
            <article 
              key={project.slug} 
              className="space-y-6 pt-8 border-t border-[#e7e5e0] first:border-t-0 first:pt-0"
            >
              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 text-xs text-[#71717a]">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-[#121316] text-white font-medium text-[10px] uppercase tracking-wider">
                    {project.projectType}
                  </span>
                  <span className="font-medium text-[#52525b]">{project.category}</span>
                </div>
                <div className="font-medium">
                  {project.year} · {project.status}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                {/* Details */}
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <h2 className="text-3xl sm:text-5xl font-bold text-[#121316] tracking-tight">
                      {project.title}
                    </h2>
                    <p className="font-serif-editorial text-xl sm:text-2xl text-[#52525b] mt-1">
                      {project.tagline}
                    </p>
                  </div>

                  <p className="text-sm sm:text-base text-[#52525b] leading-relaxed">
                    {project.overview}
                  </p>

                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#71717a]">
                      Key Deliverables:
                    </div>
                    {project.technicalHighlights.slice(0, 4).map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#52525b]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#121316] mt-1.5 flex-shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/work/${project.slug}`}
                      className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#121316] hover:text-[#52525b]"
                    >
                      <span>Read Full Case Study</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>

                {/* Visual Preview */}
                <div className="lg:col-span-7">
                  <Link to={`/work/${project.slug}`} className="block group">
                    <div className="rounded-2xl bg-white border border-[#e7e5e0] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:border-[#d5d2cb] transition-all">
                      <div className="flex items-center justify-between pb-3 border-b border-[#e7e5e0] text-xs text-[#71717a] mb-5">
                        <span className="font-medium text-[#121316]">guptawears.com</span>
                        <span className="text-emerald-700 font-medium">Production Storefront</span>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[#faf9f6] rounded-xl border border-[#e7e5e0]">
                          <div className="flex items-center gap-3">
                            <ShoppingBag className="w-6 h-6 text-[#121316]" />
                            <div>
                              <div className="text-sm font-bold text-[#121316]">Men's Apparel Capsule</div>
                              <div className="text-xs text-[#71717a] mt-0.5">10 Categories • Dynamic Matrix</div>
                            </div>
                          </div>
                          <span className="text-xs text-[#18181b] font-semibold">Live Store</span>
                        </div>

                        <div className="p-3.5 bg-[#faf9f6] rounded-xl border border-[#e7e5e0] text-xs text-[#52525b]">
                          <span className="font-semibold text-[#121316]">Stack:</span> React 19 · Node.js · Express REST · MongoDB · Cloudinary · JWT
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>

      <FinalCTA />
    </div>
  );
}
