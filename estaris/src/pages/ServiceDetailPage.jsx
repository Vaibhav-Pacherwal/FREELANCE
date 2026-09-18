import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle2, MessageSquare } from 'lucide-react';
import { services } from '../data/services';
import { siteConfig } from '../data/siteConfig';
import Button from '../components/common/Button';
import FinalCTA from '../components/home/FinalCTA';

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const service = services.find(s => s.slug === slug);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  return (
    <div className="pt-32 pb-24 bg-[#faf9f6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          to="/services" 
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#71717a] hover:text-[#18181b] mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Services</span>
        </Link>

        {/* Header */}
        <div className="max-w-3xl mb-16 space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 rounded-full bg-white text-[#18181b] font-semibold border border-[#e7e5e0]">
              Service {service.number}
            </span>
            <span className="text-xs text-[#71717a] font-medium">
              Typical Delivery: {service.timeline}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#121316] tracking-tight leading-tight">
            {service.title}
          </h1>

          <p className="text-lg sm:text-xl text-[#52525b] leading-relaxed font-normal">
            {service.tagline}
          </p>

          <p className="text-base text-[#71717a] leading-relaxed">
            {service.description}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Button to="/contact" variant="primary" size="md" arrow>
              Start {service.shortTitle} Project
            </Button>
            <a
              href={`https://wa.me/${siteConfig.contact.whatsappNumber}?text=Hi%20Estaris,%20I'd%20like%20to%20inquire%20about%20your%20${encodeURIComponent(service.title)}%20service.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-white border border-[#e7e5e0] text-xs font-semibold text-[#18181b] hover:bg-[#f4f3ef] flex items-center gap-2 shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Discuss on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Audience & Scope specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#e7e5e0] shadow-xs space-y-3">
            <div className="text-xs text-[#71717a] uppercase tracking-wider font-semibold">
              Ideal Fit & Audience
            </div>
            <h2 className="text-xl font-bold text-[#121316]">Who this is designed for:</h2>
            <p className="text-sm sm:text-base text-[#52525b] leading-relaxed">
              {service.targetAudience}
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#e7e5e0] shadow-xs space-y-3">
            <div className="text-xs text-[#71717a] uppercase tracking-wider font-semibold">
              Architecture & Complexity
            </div>
            <h2 className="text-xl font-bold text-[#121316]">System Complexity:</h2>
            <p className="text-sm sm:text-base text-[#52525b] leading-relaxed">
              {service.complexity}
            </p>
          </div>
        </div>

        {/* Included Features */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#e7e5e0] shadow-xs mb-16 space-y-6">
          <h2 className="text-2xl font-bold text-[#121316]">
            What is Included in Every Build
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {service.included.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-[#faf9f6] border border-[#e7e5e0]">
                <Check className="w-4 h-4 text-[#18181b] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#52525b]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deliverables & Handover */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#e7e5e0] shadow-xs mb-20 space-y-6">
          <h2 className="text-2xl font-bold text-[#121316]">
            Official Tangible Deliverables
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {service.deliverables.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-[#faf9f6] border border-[#e7e5e0]">
                <CheckCircle2 className="w-4 h-4 text-[#18181b] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#52525b]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <FinalCTA />
    </div>
  );
}
