import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, X, Menu } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-[#faf9f6]/95 backdrop-blur-md border-b border-[#e7e5e0] py-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Wordmark & Studio Descriptor */}
            <Link to="/" className="group flex items-center gap-3">
              <span className="font-sans text-[17px] font-bold tracking-tight text-[#121316] group-hover:opacity-80 transition-opacity">
                {siteConfig.name}
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium text-[#71717a] pl-2.5 border-l border-[#d5d2cb]">
                Digital Studio
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <nav className="flex items-center gap-8 text-[14px] font-medium">
                {siteConfig.navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `relative py-1 transition-colors duration-200 ${
                        isActive
                          ? 'text-[#121316] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#121316]'
                          : 'text-[#52525b] hover:text-[#121316]'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              <div className="h-4 w-[1px] bg-[#e7e5e0]" />

              <Link
                to="/contact"
                className="group inline-flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-full bg-[#121316] text-white hover:bg-[#27272a] transition-all shadow-xs"
              >
                <span>Start a Project</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-white/80" />
              </Link>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="flex md:hidden items-center gap-2.5">
              <Link
                to="/contact"
                className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-[#121316] text-white"
              >
                Start
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-[#e7e5e0] bg-white text-[#121316] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                aria-label="Toggle Navigation Menu"
              >
                {isOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
                <span>{isOpen ? 'Close' : 'Menu'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Studio Fullscreen Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#faf9f6] pt-28 px-6 pb-10 flex flex-col justify-between animate-in fade-in duration-200">
          <div className="space-y-6">
            <div className="text-xs font-medium uppercase tracking-wider text-[#71717a] pb-3 border-b border-[#e7e5e0]">
              Navigation
            </div>

            <nav className="flex flex-col space-y-4">
              {siteConfig.navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-3xl font-serif-editorial flex items-center justify-between transition-colors ${
                      isActive ? 'text-[#121316] italic font-semibold' : 'text-[#71717a] hover:text-[#121316]'
                    }`
                  }
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-40" />
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="space-y-4 pt-8 border-t border-[#e7e5e0]">
            <Link
              to="/contact"
              className="w-full text-center py-3.5 text-xs font-medium rounded-full bg-[#121316] text-white flex items-center justify-center gap-2"
            >
              <span>Start a Project</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-between text-xs text-[#71717a] pt-2">
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${siteConfig.contact.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#121316] transition-colors"
              >
                {siteConfig.contact.email}
              </a>
              <span>New Delhi · Remote</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
