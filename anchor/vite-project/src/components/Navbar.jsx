import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigation, siteConfig } from '../data/siteData';
import { Star } from './Decorations';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="banner">
      <nav className="navbar__inner container-wide" aria-label="Main navigation">
        <Link to="/" className="navbar__logo" aria-label="Dhruv Chauhan — Home">
          <span className="navbar__logo-text">
            <span className="navbar__logo-d">D</span>
            <span className="navbar__logo-name">hruv</span>
          </span>
          <Star size={14} color="var(--marigold)" className="navbar__logo-star" />
        </Link>

        <ul className={`navbar__links ${isOpen ? 'navbar__links--open' : ''}`} role="list">
          {navigation.map((item) => (
            <li key={item.id}>
              <Link
                to={item.href}
                className={`navbar__link ${location.pathname === item.href ? 'navbar__link--active' : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="navbar__links-cta">
            <Link to="/contact" className="btn btn-primary btn-sm">
              Book Now
            </Link>
          </li>
        </ul>

        <div className="navbar__actions">
          <Link to="/contact" className="btn btn-primary btn-sm navbar__cta-desktop">
            Book Now
          </Link>
          <button
            className={`navbar__hamburger ${isOpen ? 'navbar__hamburger--open' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="navbar__hamburger-line" />
            <span className="navbar__hamburger-line" />
            <span className="navbar__hamburger-line" />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="navbar__overlay" onClick={() => setIsOpen(false)} aria-hidden="true" />
      )}
    </header>
  );
}
