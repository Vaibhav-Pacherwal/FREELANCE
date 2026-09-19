import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail } from 'lucide-react';
import { GithubIcon, LinkedinIcon, WhatsAppIcon, InstagramIcon } from '../common/SocialIcons';
import { siteConfig } from '../../data/siteConfig';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#121316] border-t border-[#27272a] text-[#a1a1aa] pt-12 sm:pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-10 md:gap-12 pb-12 md:pb-14 border-b border-[#27272a]">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center md:items-baseline gap-2.5">
              <span className="text-xl font-bold tracking-tight text-white">
                {siteConfig.name}
              </span>
              <span className="text-xs text-[#71717a] font-medium pl-2.5 border-l border-[#2e3038] md:border-none md:pl-0">
                Digital Studio
              </span>
            </Link>

            <p className="text-sm text-[#a1a1aa] max-w-sm leading-relaxed">
              Bespoke websites, commerce platforms, and software engineered for businesses that refuse templates.
            </p>

            <div className="pt-1 sm:pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1c1d22] border border-[#2e3038] text-[11px] sm:text-xs text-[#d4d4d8] max-w-full">
                <span>Founded in 2026 by Vaibhav Pacherwal & Karan Jangra</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 pt-2 sm:pt-3 flex-wrap">
              <a
                href={siteConfig.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#1c1d22] border border-[#2e3038] flex items-center justify-center text-[#a1a1aa] hover:text-white hover:border-[#3f414d] transition-colors"
                aria-label="GitHub Profile"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#1c1d22] border border-[#2e3038] flex items-center justify-center text-[#a1a1aa] hover:text-white hover:border-[#3f414d] transition-colors"
                aria-label="LinkedIn Profile"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#1c1d22] border border-[#2e3038] flex items-center justify-center text-[#a1a1aa] hover:text-white hover:border-[#3f414d] transition-colors"
                aria-label="Instagram Profile"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${siteConfig.contact.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#1c1d22] border border-[#2e3038] flex items-center justify-center text-[#a1a1aa] hover:text-white hover:border-[#3f414d] transition-colors"
                aria-label="Email Studio via Gmail"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${siteConfig.contact.whatsappNumber}?text=Hi%20Estaris,%20I'd%20like%20to%20discuss%20a%20project.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#1c1d22] border border-[#2e3038] flex items-center justify-center text-[#a1a1aa] hover:text-emerald-400 hover:border-emerald-500/30 transition-colors"
                aria-label="WhatsApp Us"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-[#d4d4d8] font-semibold">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              {siteConfig.navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/contact"
                  className="text-white font-medium inline-flex items-center gap-1 hover:underline transition-all"
                >
                  <span>Start a Project</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Selected Work Links */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-[#d4d4d8] font-semibold">
              Selected Work
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/work/gupta-wears" className="hover:text-white transition-colors">
                  Gupta Wears
                </Link>
              </li>
              <li>
                <Link to="/work" className="text-xs text-[#71717a] hover:text-white transition-colors">
                  View All Work →
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Contact & Status */}
          <div className="col-span-2 md:col-span-3 space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-[#d4d4d8] font-semibold">
              Studio Inquiries
            </h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Have an ambitious project or looking to upgrade your digital systems?
            </p>
            <div className="pt-1">
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${siteConfig.contact.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white hover:underline transition-all block font-medium"
              >
                {siteConfig.contact.email}
              </a>
              <p className="text-xs text-[#71717a] mt-1">
                {siteConfig.contact.timezone} • New Delhi · Remote
              </p>
            </div>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Taking on select projects</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-[#71717a] text-center sm:text-left">
          <p>© {currentYear} {siteConfig.legalName}. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Handcrafted with modern design and engineering discipline.
          </p>
        </div>
      </div>
    </footer>
  );
}
