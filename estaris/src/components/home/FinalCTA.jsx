import React from 'react';
import { MessageCircle } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import Button from '../common/Button';

export default function FinalCTA() {
  return (
    <section className="py-24 md:py-36 bg-[#faf9f6] border-t border-[#e7e5e0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        <div className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">
          Start a Project
        </div>

        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#121316] max-w-4xl mx-auto leading-[1.08]">
          Have something{' '}
          <span className="font-serif-editorial font-normal text-[#52525b]">
            worth building?
          </span>{' '}
          Let's make it real.
        </h2>

        <p className="text-base sm:text-lg text-[#52525b] max-w-xl mx-auto leading-relaxed">
          Whether you need a bespoke website, an e-commerce platform, or a custom web application, let's talk through your goals.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Button to="/contact" variant="primary" size="lg" arrow>
            Start a Project
          </Button>
          <a
            href={`https://wa.me/${siteConfig.contact.whatsappNumber}?text=Hi%20Estaris,%20I'd%20like%20to%20discuss%20a%20project.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-full bg-white text-[#18181b] hover:bg-[#f4f3ef] border border-[#e7e5e0] transition-all shadow-xs"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        <div className="pt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#71717a]">
          <span>Direct Founder Response within 24h</span>
          <span className="hidden sm:inline">·</span>
          <span>Transparent Scopes & Architecture</span>
          <span className="hidden sm:inline">·</span>
          <span>Zero Obligation Consultation</span>
        </div>

      </div>
    </section>
  );
}
