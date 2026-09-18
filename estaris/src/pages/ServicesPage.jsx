import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Code, Globe, ShoppingCart, Cpu, Wrench } from 'lucide-react';
import { services } from '../data/services';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import FinalCTA from '../components/home/FinalCTA';

export default function ServicesPage() {
  const iconMap = {
    'business-websites': Globe,
    'ecommerce': ShoppingCart,
    'web-applications': Code,
    'custom-software': Wrench,
    'ai-integration': Cpu,
  };

  return (
    <div className="pt-32 pb-24 bg-[#faf9f6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl mb-16">
          <Badge variant="neutral" dot size="sm" className="mb-4">
            Capabilities & Specializations
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#121316] leading-tight">
            Engineered services,{' '}
            <span className="font-editorial italic font-normal text-[#52525b]">
              zero boilerplate.
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#52525b] leading-relaxed">
            We operate at the intersection of refined aesthetics and production-grade full-stack architecture.
          </p>
        </div>

        {/* Services In-Depth Cards */}
        <div className="space-y-12 mb-24">
          {services.map((service) => {
            const Icon = iconMap[service.slug] || Code;

            return (
              <div
                key={service.slug}
                className="rounded-3xl bg-white border border-[#e7e5e0] hover:border-[#d5d2cb] p-8 sm:p-10 lg:p-12 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center gap-3 text-xs text-[#71717a] font-medium">
                      <span className="text-[#18181b] font-bold text-sm">{service.number}</span>
                      <span>·</span>
                      <span>Delivery: {service.timeline}</span>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-[#f4f3ef] border border-[#e7e5e0] flex items-center justify-center text-[#18181b]">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-[#121316]">
                      {service.title}
                    </h2>

                    <p className="text-sm text-[#71717a]">
                      {service.tagline}
                    </p>

                    <p className="text-sm text-[#52525b] leading-relaxed pt-1">
                      {service.description}
                    </p>

                    <div className="pt-4 flex items-center gap-4">
                      <Button to={`/services/${service.slug}`} variant="primary" size="sm" arrow>
                        Detailed Specs
                      </Button>
                      <Link
                        to="/contact"
                        className="text-xs font-semibold text-[#18181b] hover:text-[#52525b] transition-colors"
                      >
                        Inquire About Scope →
                      </Link>
                    </div>
                  </div>

                  {/* Scope Details & Deliverables */}
                  <div className="lg:col-span-7 bg-[#faf9f6] rounded-2xl border border-[#e7e5e0] p-6 sm:p-8 space-y-6">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-[#71717a] font-semibold mb-1.5">
                        Target Audience:
                      </div>
                      <p className="text-xs sm:text-sm text-[#18181b] font-medium leading-relaxed">
                        {service.targetAudience}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#e7e5e0]">
                      <div className="text-[11px] uppercase tracking-wider text-[#71717a] font-semibold mb-3">
                        Included Features & Capabilities:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {service.included.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-[#52525b]">
                            <Check className="w-3.5 h-3.5 text-[#18181b] mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#e7e5e0] flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-[#71717a] uppercase tracking-wider font-semibold mr-2">
                        Core Tech:
                      </span>
                      {service.technologies.map((tech, idx) => (
                        <span key={idx} className="text-xs px-2.5 py-1 rounded-full bg-white text-[#18181b] border border-[#e7e5e0] font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <FinalCTA />
    </div>
  );
}
