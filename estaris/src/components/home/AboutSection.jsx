import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { GithubIcon, LinkedinIcon } from '../common/SocialIcons';

export default function AboutSection() {
  return (
    <section id="about" className="py-24 md:py-36 bg-white border-t border-[#e7e5e0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 md:space-y-24">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#e7e5e0]">
          <div>
            <div className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-2">
              The People Behind Estaris
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#121316] leading-tight max-w-3xl">
              "Estaris started with two friends who{' '}
              <span className="font-serif-editorial font-normal text-[#52525b]">
                like building things."
              </span>
            </h2>
          </div>
          <div className="flex-shrink-0">
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#121316] hover:text-[#52525b] transition-colors"
            >
              <span>Our Full Story</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Narrative & Two Founders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left: Studio Story */}
          <div className="lg:col-span-5 space-y-6 text-sm sm:text-base text-[#52525b] leading-relaxed">
            <p className="font-medium text-[#121316] text-lg sm:text-xl font-serif-editorial">
              We aren't an impersonal 50-person agency. And that is your greatest advantage.
            </p>
            <p>
              We are Vaibhav Pacherwal and Karan Jangra—batchmates, friends, and fourth-year engineering students at Netaji Subhas University of Technology (NSUT) in New Delhi. We founded Estaris together in 2026 to build bespoke websites, commerce platforms, and software for businesses that care about craft and technical rigor.
            </p>
            <p>
              When you work with Estaris, there are no account managers or sales intermediaries playing telephone. You collaborate directly with the two of us. Vaibhav architects the backend systems, APIs, and data infrastructure, while Karan crafts the interactive frontend interfaces and design systems.
            </p>
            <div className="pt-2 text-xs text-[#71717a] font-medium">
              Founded in 2026 · Based in New Delhi, India · Available worldwide
            </div>
          </div>

          {/* Right: The Two Co-Founders */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {siteConfig.founders.map((founder, idx) => (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-[#faf9f6] border border-[#e7e5e0] space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#71717a] font-semibold uppercase tracking-wider">
                    <span>Co-Founder</span>
                    <span>{founder.college}</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#121316]">
                    {founder.name}
                  </h3>

                  <div className="text-xs font-semibold text-[#52525b]">
                    {founder.shortRole}
                  </div>

                  <p className="text-xs text-[#71717a] leading-relaxed pt-2">
                    {founder.focus}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#e7e5e0] flex items-center gap-3">
                  <a
                    href={founder.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#e7e5e0] text-xs font-medium text-[#18181b] hover:bg-[#f0eee9] transition-colors"
                  >
                    <GithubIcon className="w-3 h-3" />
                    <span>GitHub</span>
                  </a>
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#e7e5e0] text-xs font-medium text-[#18181b] hover:bg-[#f0eee9] transition-colors"
                  >
                    <LinkedinIcon className="w-3 h-3" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
