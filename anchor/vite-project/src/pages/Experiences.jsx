import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { experiences, siteConfig } from '../data/siteData';
import {
  FlowerMarigold, FlowerSimple, Leaf, Star, Sparkle,
  WavyLine, DoodleArrow, PaperTearSVG
} from '../components/Decorations';
import { useInView } from '../hooks/useHooks';
import './Experiences.css';

/* ─── Subcategory Detail Modal ─── */
function SubcategoryDetail({ subcategory, parentTitle, parentColor, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="subcat-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={subcategory.title}>
      <div className="subcat-modal" onClick={(e) => e.stopPropagation()}>
        <button className="subcat-modal__close" onClick={onClose} aria-label="Close">✕</button>
        <div className="subcat-modal__header" style={{ borderBottomColor: parentColor }}>
          <span className="subcat-modal__parent font-handwritten" style={{ color: parentColor }}>
            {parentTitle}
          </span>
          <h2 className="subcat-modal__title font-display">{subcategory.title}</h2>
        </div>
        <div className="subcat-modal__body">
          <p className="subcat-modal__description">{subcategory.description}</p>
          
          {/* Gallery placeholder */}
          <div className="subcat-modal__gallery">
            {subcategory.images && subcategory.images.length > 0 ? (
              subcategory.images.map((img, i) => (
                <div key={i} className="subcat-modal__gallery-item">
                  <img src={img.src} alt={img.alt || subcategory.title} loading="lazy" />
                </div>
              ))
            ) : (
              <div className="subcat-modal__gallery-empty">
                <div className="subcat-modal__gallery-placeholder">
                  <span className="subcat-modal__gallery-placeholder-icon">📷</span>
                  <p className="font-handwritten">Photos & videos coming soon!</p>
                  <p className="subcat-modal__gallery-placeholder-note">
                    Add performance media for {subcategory.title}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="subcat-modal__actions">
            <Link to="/contact" className="btn btn-primary" onClick={onClose}>
              Book for {subcategory.title}
            </Link>
            <Link to="/gallery" className="btn btn-outline" onClick={onClose}>
              View Gallery
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Category Card (expanded) ─── */
function CategorySection({ category, index }) {
  const [ref, isInView] = useInView();
  const [activeSubcat, setActiveSubcat] = useState(null);
  const isEven = index % 2 === 0;

  return (
    <>
      <section
        className={`cat-section ${isEven ? '' : 'cat-section--alt'}`}
        id={category.id}
        ref={ref}
        style={{ '--cat-color': category.color, '--cat-bg': category.bgColor }}
      >
        {!isEven && <PaperTearSVG color={category.bgColor} position="top" />}

        <div className="container">
          <div className={`cat-section__header ${isInView ? 'cat-section__header--visible' : ''}`}>
            <span className="cat-section__emoji">{category.emoji}</span>
            <h2 className="cat-section__title font-display">{category.title}</h2>
            <p className="cat-section__tagline font-handwritten">{category.tagline}</p>
            <p className="cat-section__description">{category.description}</p>
          </div>

          <div className={`cat-section__grid ${isInView ? 'cat-section__grid--visible' : ''}`}>
            {category.subcategories.map((sub, i) => (
              <button
                key={sub.id}
                className="subcat-card"
                style={{ animationDelay: `${i * 100}ms` }}
                onClick={() => setActiveSubcat(sub)}
                aria-label={`Open ${sub.title} details`}
              >
                <div className="subcat-card__inner">
                  {/* Placeholder image area */}
                  <div className="subcat-card__image">
                    <div className="subcat-card__image-placeholder">
                      <Star size={24} color={category.color} />
                    </div>
                  </div>
                  <h3 className="subcat-card__title font-display">{sub.title}</h3>
                  <p className="subcat-card__desc">{sub.description}</p>
                  <span className="subcat-card__cta" style={{ color: category.color }}>
                    Explore <DoodleArrow size={20} color={category.color} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {isEven && <PaperTearSVG color={isEven ? 'var(--cream)' : category.bgColor} position="bottom" />}
      </section>

      {activeSubcat && (
        <SubcategoryDetail
          subcategory={activeSubcat}
          parentTitle={category.title}
          parentColor={category.color}
          onClose={() => setActiveSubcat(null)}
        />
      )}
    </>
  );
}

/* ─── EXPERIENCES PAGE ─── */
export default function Experiences() {
  const location = useLocation();

  useEffect(() => {
    document.title = 'Experiences & Services — Dhruv Chauhan';
  }, []);

  // Scroll to hash section on load
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }
  }, [location.hash]);

  return (
    <main className="experiences-page">
      {/* Hero */}
      <section className="exp-hero texture-paper">
        <div className="exp-hero__decorations" aria-hidden="true">
          <FlowerMarigold size={70} className="exp-hero__deco exp-hero__deco--1" />
          <Leaf size={35} rotation={30} className="exp-hero__deco exp-hero__deco--2" />
          <FlowerSimple size={40} className="exp-hero__deco exp-hero__deco--3" />
          <Sparkle size={18} color="var(--hot-magenta)" className="exp-hero__deco exp-hero__deco--4" />
        </div>
        <div className="container exp-hero__content">
          <p className="exp-hero__label font-handwritten animate-in">
            <Star size={16} /> What I bring to your event
          </p>
          <h1 className="exp-hero__title font-display animate-in animate-in-delay-1">
            Experiences & Shows
          </h1>
          <WavyLine color="var(--hot-magenta)" />

          {/* Quick nav pills */}
          <div className="exp-hero__pills animate-in animate-in-delay-2">
            {experiences.map((exp) => (
              <a
                key={exp.id}
                href={`#${exp.id}`}
                className="exp-hero__pill"
                style={{ '--pill-color': exp.color }}
              >
                <span>{exp.emoji}</span>
                <span>{exp.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Category sections */}
      {experiences.map((category, i) => (
        <CategorySection key={category.id} category={category} index={i} />
      ))}

      {/* Bottom CTA */}
      <section className="exp-bottom-cta">
        <div className="container exp-bottom-cta__inner">
          <h2 className="exp-bottom-cta__title font-display">
            Don't See What You Need?
          </h2>
          <p className="exp-bottom-cta__text font-handwritten">
            Every event is unique — let's talk about yours!
          </p>
          <div className="exp-bottom-cta__actions">
            <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
              💬 WhatsApp
            </a>
            <Link to="/contact" className="btn btn-primary btn-lg">
              📋 Inquire Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
