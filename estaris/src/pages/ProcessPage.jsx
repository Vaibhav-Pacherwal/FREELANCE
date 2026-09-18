import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { processSteps } from '../data/process';
import Badge from '../components/common/Badge';
import FinalCTA from '../components/home/FinalCTA';

export default function ProcessPage() {
  return (
    <div className="pt-32 pb-24 bg-[#faf9f6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl mb-16">
          <Badge variant="neutral" dot size="sm" className="mb-4">
            Delivery Methodology
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#121316] leading-tight">
            Our 8-stage{' '}
            <span className="font-editorial italic font-normal text-[#52525b]">
              engineering methodology.
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#52525b] leading-relaxed">
            We follow a structured, transparent delivery pipeline designed to eliminate guesswork and ensure predictable, high-quality production handovers.
          </p>
        </div>

        {/* Vertical Stepper Timeline */}
        <div className="space-y-8 mb-24 relative">
          {processSteps.map((step) => (
            <div
              key={step.step}
              className="rounded-3xl bg-white border border-[#e7e5e0] hover:border-[#d5d2cb] p-7 sm:p-9 lg:p-11 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#18181b] px-3 py-1 rounded-full bg-[#faf9f6] border border-[#e7e5e0]">
                      Phase {step.step}
                    </span>
                    <span className="text-xs text-[#71717a] flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {step.duration}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-[#121316]">
                    {step.title}
                  </h2>

                  <p className="text-xs text-[#71717a]">
                    {step.tagline}
                  </p>
                </div>

                <div className="lg:col-span-8 space-y-6">
                  <p className="text-sm sm:text-base text-[#52525b] leading-relaxed">
                    {step.description}
                  </p>

                  <div className="p-6 rounded-2xl bg-[#faf9f6] border border-[#e7e5e0] space-y-3">
                    <div className="text-[11px] uppercase tracking-wider text-[#71717a] font-semibold">
                      Deliverables & Checkpoints for Phase {step.step}:
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {step.deliverables.map((item, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-2.5 text-xs text-[#52525b]">
                          <CheckCircle2 className="w-4 h-4 text-[#18181b] mt-0.5 flex-shrink-0" />
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FinalCTA />
    </div>
  );
}
