import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { processSteps } from '../../data/process';

export default function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0);

  const current = processSteps[activeStep];

  return (
    <section id="process" className="py-24 md:py-36 bg-white border-t border-[#e7e5e0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#e7e5e0]">
          <div>
            <div className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-2">
              Delivery Methodology
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#121316]">
              Disciplined delivery,{' '}
              <span className="font-serif-editorial font-normal text-[#52525b]">
                zero ambiguity.
              </span>
            </h2>
          </div>
          <div className="text-sm text-[#52525b] max-w-md">
            We follow a structured 8-stage process that turns digital concepts into predictable, production-ready deliverables.
          </div>
        </div>

        {/* Milestone Pipeline Flow */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 border-b border-[#e7e5e0] pb-8">
          {processSteps.map((step, idx) => {
            const isActive = activeStep === idx;

            return (
              <button
                key={step.step}
                onClick={() => setActiveStep(idx)}
                className={`text-left p-3 rounded-xl transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#121316] text-white shadow-xs' 
                    : 'bg-transparent text-[#71717a] hover:text-[#121316] hover:bg-[#faf9f6]'
                }`}
              >
                <div className="text-[11px] font-medium uppercase opacity-75">
                  Phase {step.step}
                </div>
                <div className="font-bold text-xs truncate mt-1">
                  {step.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center gap-3 text-xs text-[#71717a]">
              <span className="px-3 py-1 rounded-full bg-[#f4f3ef] text-[#121316] font-semibold border border-[#e7e5e0]">
                Stage {current.step} of 08
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#71717a]" />
                {current.duration}
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-bold text-[#121316] tracking-tight">
              {current.title}
            </h3>

            <p className="font-serif-editorial text-xl sm:text-2xl text-[#52525b]">
              {current.tagline}
            </p>

            <p className="text-sm sm:text-base text-[#52525b] leading-relaxed">
              {current.description}
            </p>
          </div>

          <div className="lg:col-span-6 p-7 sm:p-9 rounded-2xl bg-[#faf9f6] border border-[#e7e5e0] space-y-4">
            <div className="text-xs uppercase tracking-wider text-[#71717a] font-semibold border-b border-[#e7e5e0] pb-3">
              Phase Checkpoints & Deliverables:
            </div>

            <div className="space-y-3">
              {current.deliverables.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-[#52525b]">
                  <CheckCircle2 className="w-4 h-4 text-[#121316] mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#e7e5e0] flex items-center justify-between text-xs text-[#71717a]">
              <span>Next Phase: {processSteps[(activeStep + 1) % processSteps.length].title}</span>
              <button
                type="button"
                onClick={() => setActiveStep((activeStep + 1) % processSteps.length)}
                className="text-[#121316] font-semibold uppercase hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Advance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
