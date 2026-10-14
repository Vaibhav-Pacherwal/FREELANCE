import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { siteConfig, experiences } from '../data/siteData';
import { Star, Sparkle, FlowerSimple, WavyLine, PaperTearSVG } from '../components/Decorations';
import { useEscapeKey, useScrollLock } from '../hooks/useHooks';
import { useInView } from '../hooks/useHooks';
import './Gallery.css';

/* Generate placeholder gallery items from experiences */
const placeholderGallery = experiences.flatMap((exp) =>
  exp.subcategories.map((sub, i) => ({
    id: `${exp.id}-${sub.id}`,
    category: exp.id,
    categoryTitle: exp.title,
    subcategory: sub.title,
    type: 'image',
    src: null, // TODO: Add real images
    alt: `${sub.title} - ${exp.title} performance by Dhruv Chauhan`,
    caption: sub.title,
    isPlaceholder: true,
  }))
);

/* ─── Lightbox ─── */
function Lightbox({ items, currentIndex, onClose, onPrev, onNext }) {
  useEscapeKey(onClose);
  useScrollLock(true);

  const item = items[currentIndex];
  if (!item) return null;

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
  }, [onPrev, onNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Image lightbox">
      <div className="lightbox__overlay" onClick={onClose} />
      <div className="lightbox__content">
        <button className="lightbox__close" onClick={onClose} aria-label="Close lightbox">✕</button>
        <button className="lightbox__nav lightbox__nav--prev" onClick={onPrev} aria-label="Previous image" disabled={currentIndex === 0}>
          ‹
        </button>

        <div className="lightbox__media">
          {item.isPlaceholder ? (
            <div className="lightbox__placeholder">
              <Star size={40} color="var(--marigold)" />
              <p className="font-handwritten">{item.caption}</p>
              <p className="lightbox__placeholder-note">{item.categoryTitle} — Add real media</p>
            </div>
          ) : item.type === 'video' ? (
            <div className="lightbox__video-wrap">
              <iframe
                src={item.videoUrl}
                title={item.alt}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : (
            <img src={item.src} alt={item.alt} className="lightbox__image" />
          )}
        </div>

        <button className="lightbox__nav lightbox__nav--next" onClick={onNext} aria-label="Next image" disabled={currentIndex === items.length - 1}>
          ›
        </button>

        <div className="lightbox__info">
          <p className="lightbox__caption">{item.caption || item.alt}</p>
          <p className="lightbox__counter">{currentIndex + 1} / {items.length}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Gallery Grid Item ─── */
function GalleryItem({ item, onClick, index }) {
  const [ref, isInView] = useInView();
  // Varied sizes for collage feel
  const sizeClass = index % 5 === 0 ? 'gallery-item--large' :
                    index % 7 === 0 ? 'gallery-item--tall' : '';

  return (
    <button
      ref={ref}
      className={`gallery-item ${sizeClass} ${isInView ? 'gallery-item--visible' : ''}`}
      onClick={onClick}
      aria-label={`View ${item.caption || item.alt}`}
      style={{ animationDelay: `${(index % 6) * 80}ms` }}
    >
      {item.isPlaceholder ? (
        <div className="gallery-item__placeholder" style={{ '--placeholder-color': experiences.find(e => e.id === item.category)?.color || 'var(--teal)' }}>
          <Star size={28} color="var(--cream)" />
          <span className="gallery-item__placeholder-label font-handwritten">{item.subcategory}</span>
          <span className="gallery-item__placeholder-cat">{item.categoryTitle}</span>
        </div>
      ) : (
        <img src={item.src} alt={item.alt} loading="lazy" className="gallery-item__image" />
      )}
      <div className="gallery-item__overlay">
        <span className="gallery-item__overlay-title font-display">{item.subcategory || item.caption}</span>
        <span className="gallery-item__overlay-cat font-handwritten">{item.categoryTitle}</span>
      </div>
    </button>
  );
}

/* ─── GALLERY PAGE ─── */
export default function Gallery() {
  const [filter, setFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    document.title = 'Gallery — Dhruv Chauhan Portfolio';
  }, []);

  const categories = [
    { id: 'all', label: 'All', emoji: '✨' },
    ...experiences.map(e => ({ id: e.id, label: e.title, emoji: e.emoji })),
  ];

  const filteredItems = filter === 'all'
    ? placeholderGallery
    : placeholderGallery.filter(item => item.category === filter);

  return (
    <main className="gallery-page">
      {/* Hero */}
      <section className="gallery-hero texture-paper">
        <div className="gallery-hero__decorations" aria-hidden="true">
          <FlowerSimple size={50} className="gallery-hero__deco gallery-hero__deco--1" />
          <Sparkle size={18} className="gallery-hero__deco gallery-hero__deco--2" />
        </div>
        <div className="container gallery-hero__content">
          <p className="gallery-hero__label font-handwritten animate-in">
            <Star size={16} /> Behind the scenes & on stage
          </p>
          <h1 className="gallery-hero__title font-display animate-in animate-in-delay-1">
            The Gallery
          </h1>
          <WavyLine color="var(--hot-magenta)" />
        </div>
      </section>

      {/* Filter Bar */}
      <div className="gallery-filters texture-paper">
        <div className="container">
          <div className="gallery-filters__bar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`gallery-filter-btn ${filter === cat.id ? 'gallery-filter-btn--active' : ''}`}
                onClick={() => setFilter(cat.id)}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <section className="gallery-grid-section">
        <div className="container">
          {filteredItems.length > 0 ? (
            <div className="gallery-grid">
              {filteredItems.map((item, i) => (
                <GalleryItem
                  key={item.id}
                  item={item}
                  index={i}
                  onClick={() => setLightboxIndex(i)}
                />
              ))}
            </div>
          ) : (
            <div className="gallery-empty">
              <Star size={40} />
              <p className="font-handwritten gallery-empty__text">No items in this category yet!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="gallery-cta">
        <PaperTearSVG color="var(--teal-dark)" position="top" className="gallery-cta__tear" />
        <div className="container gallery-cta__inner">
          <h2 className="gallery-cta__title font-display">
            Want to See Me <span className="font-handwritten" style={{ color: 'var(--marigold)' }}>Live?</span>
          </h2>
          <div className="gallery-cta__actions">
            <Link to="/contact" className="btn btn-primary btn-lg">Book a Show</Link>
            <a href={siteConfig.youtube} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-lg">
              🎬 YouTube Channel
            </a>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex >= 0 && (
        <Lightbox
          items={filteredItems}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
          onPrev={() => setLightboxIndex(Math.max(0, lightboxIndex - 1))}
          onNext={() => setLightboxIndex(Math.min(filteredItems.length - 1, lightboxIndex + 1))}
        />
      )}
    </main>
  );
}
