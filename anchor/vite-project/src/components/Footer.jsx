import React from 'react';
import { Link } from 'react-router-dom';
import { siteConfig, navigation } from '../data/siteData';
import { FlowerMarigold, Bird, Star, WavyLine, PaperTearSVG } from './Decorations';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer texture-paper" role="contentinfo">
      <PaperTearSVG color="var(--teal-dark)" position="top" className="footer__tear" />

      <div className="footer__inner container">
        <div className="footer__top">
          <div className="footer__brand">
            <h2 className="footer__name font-display">{siteConfig.name}</h2>
            <p className="footer__tagline font-handwritten">{siteConfig.tagline}</p>
            <div className="footer__roles">
              {siteConfig.roles.map((role, i) => (
                <span key={role} className="footer__role">
                  {role}{i < siteConfig.roles.length - 1 && <Star size={10} color="var(--marigold)" />}
                </span>
              ))}
            </div>
          </div>

          <nav className="footer__nav" aria-label="Footer navigation">
            <h3 className="footer__nav-title">Quick Links</h3>
            <ul>
              {navigation.map((item) => (
                <li key={item.id}>
                  <Link to={item.href} className="footer__nav-link">{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer__contact">
            <h3 className="footer__nav-title">Get in Touch</h3>
            <div className="footer__contact-links">
              <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer"
                className="footer__social-link" aria-label="WhatsApp">
                <span className="footer__social-icon">💬</span> WhatsApp
              </a>
              <a href={`tel:${siteConfig.phone}`} className="footer__social-link" aria-label="Call now">
                <span className="footer__social-icon">📞</span> Call Now
              </a>
              <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer"
                className="footer__social-link" aria-label="Instagram">
                <span className="footer__social-icon">📸</span> Instagram
              </a>
              <a href={siteConfig.youtube} target="_blank" rel="noopener noreferrer"
                className="footer__social-link" aria-label="YouTube">
                <span className="footer__social-icon">🎬</span> YouTube
              </a>
            </div>
          </div>
        </div>

        <WavyLine color="var(--cream)" className="footer__divider" />

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {year} {siteConfig.brandName}. All rights reserved.
          </p>
          <div className="footer__decorations">
            <FlowerMarigold size={30} className="footer__deco-flower" />
            <Bird size={35} color="var(--cream)" className="footer__deco-bird" />
          </div>
        </div>
      </div>
    </footer>
  );
}
