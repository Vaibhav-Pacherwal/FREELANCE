import React, { useState, useEffect } from 'react';
import { siteConfig } from '../data/siteData';
import './FloatingCTA.css';

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className={`floating-cta ${expanded ? 'floating-cta--expanded' : ''}`}>
      {expanded && (
        <div className="floating-cta__menu">
          <a
            href={siteConfig.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="floating-cta__item floating-cta__item--whatsapp"
            aria-label="WhatsApp"
          >
            💬 <span>WhatsApp</span>
          </a>
          <a
            href={`tel:${siteConfig.phone}`}
            className="floating-cta__item floating-cta__item--call"
            aria-label="Call now"
          >
            📞 <span>Call</span>
          </a>
        </div>
      )}
      <button
        className="floating-cta__trigger"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={expanded ? 'Close contact options' : 'Open contact options'}
      >
        {expanded ? '✕' : '🎤'}
      </button>
    </div>
  );
}
