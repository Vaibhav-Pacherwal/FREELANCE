import React, { useState } from 'react';
import { showreels } from '../data/siteData';
import { Star, Sparkle } from './Decorations';
import './ShowreelSection.css';

/**
 * Showreel section — displayed on Home and Corporate pages.
 * Renders a YouTube embed when a valid embedUrl is provided,
 * or a styled placeholder when the URL is not yet configured.
 */
export default function ShowreelSection({ variant = 'general', title, subtitle }) {
  const [playing, setPlaying] = useState(false);
  const reel = showreels[variant] || showreels.general;

  const hasVideo = Boolean(reel.embedUrl);
  const displayTitle = title || reel.title;

  return (
    <section className="showreel-section" id="showreel" aria-label="Showreel video">
      <div className="showreel-section__header">
        <p className="showreel-section__label font-handwritten">
          <Sparkle size={16} color="var(--marigold)" /> Watch the magic
        </p>
        <h2 className="showreel-section__title font-display">
          {displayTitle}
        </h2>
        {subtitle && (
          <p className="showreel-section__subtitle">{subtitle}</p>
        )}
      </div>

      <div className="showreel-section__player-wrap">
        {hasVideo ? (
          playing ? (
            <div className="showreel-section__iframe-wrap">
              <iframe
                src={`${reel.embedUrl}?autoplay=1&rel=0&modestbranding=1`}
                title={displayTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="showreel-section__iframe"
              />
            </div>
          ) : (
            <button
              className="showreel-section__thumbnail"
              onClick={() => setPlaying(true)}
              aria-label={`Play ${displayTitle}`}
            >
              {reel.thumbnailUrl ? (
                <img src={reel.thumbnailUrl} alt={`${displayTitle} thumbnail`} className="showreel-section__thumb-img" />
              ) : (
                <div className="showreel-section__thumb-placeholder">
                  <Star size={40} color="var(--marigold)" />
                </div>
              )}
              <div className="showreel-section__play-overlay">
                <div className="showreel-section__play-btn" aria-hidden="true">▶</div>
              </div>
            </button>
          )
        ) : (
          /* No video configured yet — clear placeholder */
          <div className="showreel-section__placeholder">
            <div className="showreel-section__placeholder-inner">
              <span className="showreel-section__placeholder-icon">🎬</span>
              <p className="showreel-section__placeholder-title font-display">
                Showreel Coming Soon
              </p>
              <p className="showreel-section__placeholder-text font-handwritten">
                Add your YouTube showreel URL in siteData.js → showreels.{variant}.embedUrl
              </p>
              <p className="showreel-section__placeholder-note">
                Until then, check out the YouTube channel for performances.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
