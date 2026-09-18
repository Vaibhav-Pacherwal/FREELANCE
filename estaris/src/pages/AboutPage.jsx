import React from 'react';
import { GithubIcon, LinkedinIcon } from '../components/common/SocialIcons';
import { siteConfig } from '../data/siteConfig';
import FinalCTA from '../components/home/FinalCTA';

export default function AboutPage() {
  const principles = [
    {
      num: "01",
      title: "Bespoke Design Over Commodity Templates",
      desc: "We don't assemble bloated site templates with fragile plugins. We write clean, componentized code in modern React and Node that performs with sub-second speed and scales effortlessly."
    },
    {
      num: "02",
      title: "Founders Author Every Line of Code",
      desc: "When you work with Estaris, you collaborate directly with Vaibhav and Karan. There are no account managers, sales intermediaries, or junior handoffs."
    },
    {
      num: "03",
      title: "Design & Engineering in Direct Harmony",
      desc: "We don't separate aesthetics from architecture. By handling visual design and full-stack engineering simultaneously, our interfaces look refined and perform with production rigor."
    },
    {
      num: "04",
      title: "Clear Scopes & Radical Accountability",
      desc: "No vague hourly billing or hidden surcharges. Our scopes, architectures, and delivery timelines are mapped out before development begins."
    }
  ];

  return (
    <div className="pt-32 pb-24 bg-[#faf9f6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 md:space-y-28">
        
        {/* Page Header */}
        <div className="space-y-4 max-w-3xl pb-8 border-b border-[#e7e5e0]">
          <div className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">
            About The Studio
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#121316]">
            Built by two friends who{' '}
            <span className="font-serif-editorial font-normal text-[#52525b]">
              like building things.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#52525b] leading-relaxed">
            Estaris is an independent digital studio founded in 2026 by Vaibhav Pacherwal and Karan Jangra—batchmates, longtime friends, and fourth-year engineering students at Netaji Subhas University of Technology (NSUT) in New Delhi.
          </p>
        </div>

        {/* Narrative Manifesto */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-6 space-y-6 text-[#52525b] text-base leading-relaxed">
            <h2 className="text-2xl sm:text-4xl font-bold text-[#121316] tracking-tight">
              Two NSUT engineers building digital products that matter.
            </h2>
            <p>
              Estaris started simply: two friends at NSUT in New Delhi who love designing systems, writing clean code, and building digital products that actually work.
            </p>
            <p>
              We don't assemble commodity templates or hide behind layers of corporate bureaucracy. Vaibhav focuses on system and backend engineering—architecting APIs, database schemas, and cloud deployments. Karan leads frontend engineering—crafting responsive geometry, design systems, and fluid interactive ergonomics.
            </p>
            <p className="text-[#71717a]">
              We aren't an impersonal 50-person agency. We are young, ambitious, and technically serious. Being an independent studio means zero overhead, direct communication with the engineers actually authoring your software, and complete personal accountability on every project we deliver.
            </p>
          </div>

          {/* Quick Studio Snapshot */}
          <div className="lg:col-span-6 rounded-3xl bg-white border border-[#e7e5e0] p-8 sm:p-10 space-y-6 shadow-xs">
            <div className="text-xs text-[#121316] font-semibold uppercase tracking-wider">
              Studio Snapshot
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#e7e5e0]">
                <div className="text-[11px] text-[#71717a] font-medium uppercase tracking-wider">Co-Founders</div>
                <div className="text-base font-bold text-[#121316] mt-1">Vaibhav & Karan</div>
              </div>

              <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#e7e5e0]">
                <div className="text-[11px] text-[#71717a] font-medium uppercase tracking-wider">Background</div>
                <div className="text-base font-bold text-[#121316] mt-1">4th Year, NSUT</div>
              </div>

              <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#e7e5e0]">
                <div className="text-[11px] text-[#71717a] font-medium uppercase tracking-wider">Founded</div>
                <div className="text-base font-bold text-[#121316] mt-1">2026 · New Delhi</div>
              </div>

              <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#e7e5e0]">
                <div className="text-[11px] text-[#71717a] font-medium uppercase tracking-wider">Studio Focus</div>
                <div className="text-base font-bold text-[#18181b] mt-1">Design & Engineering</div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#e7e5e0] text-xs text-[#52525b] leading-relaxed">
              "We take pride in writing clean, maintainable software and building thoughtful digital products for businesses that care about quality."
            </div>
          </div>
        </div>

        {/* The Founders */}
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">
              The People Behind Estaris
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#121316]">
              Meet The Co-Founders
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {siteConfig.founders.map((founder, idx) => (
              <div
                key={idx}
                className="p-8 sm:p-10 rounded-3xl bg-white border border-[#e7e5e0] space-y-6 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#71717a] font-medium">
                    <span>Co-Founder</span>
                    <span>{founder.college}</span>
                  </div>

                  <h3 className="text-2xl font-bold text-[#121316] tracking-tight">
                    {founder.name}
                  </h3>

                  <div className="text-xs font-semibold text-[#52525b]">
                    {founder.shortRole}
                  </div>

                  <p className="text-sm text-[#71717a] leading-relaxed pt-2">
                    {founder.focus}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#e7e5e0] flex items-center gap-3 text-xs">
                  <a
                    href={founder.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#faf9f6] border border-[#e7e5e0] text-[#121316] hover:bg-[#f0eee9] font-medium transition-colors"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#faf9f6] border border-[#e7e5e0] text-[#121316] hover:bg-[#f0eee9] font-medium transition-colors"
                  >
                    <LinkedinIcon className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Studio Principles */}
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">
              Studio Values
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#121316]">
              How We Build & Collaborate
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {principles.map((p) => (
              <div key={p.num} className="p-8 rounded-3xl bg-white border border-[#e7e5e0] space-y-2.5 shadow-xs">
                <div className="text-xs text-[#71717a] font-semibold">{p.num}</div>
                <h3 className="text-xl font-bold text-[#121316]">{p.title}</h3>
                <p className="text-sm text-[#52525b] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <FinalCTA />
    </div>
  );
}
