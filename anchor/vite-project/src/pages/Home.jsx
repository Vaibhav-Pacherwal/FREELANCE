import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { siteConfig, heroSlider, testimonials, experiences } from '../data/siteData';
import {
  FlowerMarigold, FlowerSimple, Leaf, Bird, Sunburst,
  Star, Sparkle, DoodleArrow, WavyLine, DecorativeBorder, PaperTearSVG
} from '../components/Decorations';
import { useInView, usePrefersReducedMotion } from '../hooks/useHooks';
import ShowreelSection from '../components/ShowreelSection';
import QuickBookForm from '../components/QuickBookForm';
import './Home.css';

/* ─── HERO SECTION ─── */
function HeroSection() {
  return (
    <section className="hero texture-paper" id="hero">
      {/* Background decorations */}
      <div className="hero__decorations" aria-hidden="true">
        <FlowerMarigold size={90} className="hero__deco hero__deco--flower1" />
        <FlowerSimple size={50} color="var(--coral)" className="hero__deco hero__deco--flower2" />
        <Leaf size={45} color="var(--teal)" rotation={-30} className="hero__deco hero__deco--leaf1" />
        <Leaf size={35} color="var(--forest)" rotation={20} className="hero__deco hero__deco--leaf2" />
        <Bird size={55} color="var(--teal-dark)" className="hero__deco hero__deco--bird1" />
        <Bird size={40} color="var(--coral-deep)" flip className="hero__deco hero__deco--bird2" />
        <Sunburst size={70} className="hero__deco hero__deco--sun" />
        <Star size={18} className="hero__deco hero__deco--star1" />
        <Star size={14} className="hero__deco hero__deco--star2" />
        <Star size={22} color="var(--orange)" className="hero__deco hero__deco--star3" />
        <Sparkle size={16} className="hero__deco hero__deco--sparkle1" />
        <Sparkle size={12} color="var(--hot-magenta)" className="hero__deco hero__deco--sparkle2" />
      </div>

      <div className="hero__content container">
        <div className="hero__text-side">
          <p className="hero__pre-title font-handwritten animate-in">
            <Star size={16} color="var(--marigold)" /> Welcome to the show <Star size={16} color="var(--marigold)" />
          </p>
          <h1 className="hero__name font-display animate-in animate-in-delay-1">
            <span className="hero__name-first">Dhruv</span>
            <span className="hero__name-last">Chauhan</span>
          </h1>
          <p className="hero__tagline font-handwritten animate-in animate-in-delay-2">
            {siteConfig.tagline}
          </p>
          <div className="hero__roles animate-in animate-in-delay-3">
            {siteConfig.roles.map((role, i) => (
              <span key={role} className="hero__role-tag">
                {role}
              </span>
            ))}
          </div>
          <div className="hero__actions animate-in animate-in-delay-4">
            <a href="#showreel" className="btn btn-secondary btn-lg">
              ▶ Watch Showreel
            </a>
            <Link to="/contact" className="btn btn-primary btn-lg">
              Book Now
            </Link>
            <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
              💬 WhatsApp
            </a>
          </div>
        </div>

        <div className="hero__photo-side animate-in animate-in-delay-2">
          <div className="hero__photo-frame">
            {/* TODO: Replace with Dhruv's real performance photo */}
            <div className="hero__photo-placeholder">
              <span className="hero__photo-placeholder-emoji">🎤</span>
              <span className="hero__photo-placeholder-text font-handwritten">
                Dhruv's Performance Photo
              </span>
              <span className="hero__photo-placeholder-note">
                Add your best stage photo here
              </span>
            </div>
            {/* Decorative frame elements */}
            <div className="hero__photo-corner hero__photo-corner--tl" aria-hidden="true" />
            <div className="hero__photo-corner hero__photo-corner--tr" aria-hidden="true" />
            <div className="hero__photo-corner hero__photo-corner--bl" aria-hidden="true" />
            <div className="hero__photo-corner hero__photo-corner--br" aria-hidden="true" />
          </div>
          <p className="hero__photo-annotation font-handwritten" aria-hidden="true">
            <DoodleArrow size={30} rotation={-45} /> the rockstar himself!
          </p>
        </div>
      </div>

      <PaperTearSVG color="var(--teal-dark)" position="bottom" className="hero__tear-bottom" />
    </section>
  );
}

/* ─── SLIDING SHOWCASE MARQUEE ─── */
function ShowcaseMarquee() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const marqueeRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const items = [...heroSlider, ...heroSlider];

  return (
    <section className="showcase" aria-label="Services showcase">
      <div
        className="showcase__track"
        ref={marqueeRef}
        style={{
          animationPlayState: (prefersReducedMotion || isPaused) ? 'paused' : 'running',
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        {items.map((item, i) => (
          <div key={i} className="showcase__item" style={{ '--item-color': item.color }}>
            <span className="showcase__icon">{item.icon}</span>
            <span className="showcase__label">{item.label}</span>
            <Star size={16} color={item.color} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── EXPERIENCE CATEGORIES PREVIEW ─── */
function ExperiencePreview() {
  const [ref, isInView] = useInView();

  return (
    <section className="exp-preview texture-paper" ref={ref} id="experiences-preview">
      <div className="container">
        <div className="section-header">
          <p className="section-header__annotation font-handwritten">
            <Sparkle size={16} color="var(--hot-magenta)" /> What I do best
          </p>
          <h2 className="section-header__title font-display">
            Experiences & Shows
          </h2>
          <WavyLine color="var(--hot-magenta)" />
        </div>

        <div className={`exp-preview__grid ${isInView ? 'exp-preview__grid--visible' : ''}`}>
          {experiences.map((exp, i) => (
            <Link
              key={exp.id}
              to={`/experiences#${exp.id}`}
              className="exp-card"
              style={{
                '--card-color': exp.color,
                '--card-bg': exp.bgColor,
                animationDelay: `${i * 120}ms`,
              }}
            >
              <div className="exp-card__inner">
                <span className="exp-card__emoji">{exp.emoji}</span>
                <h3 className="exp-card__title font-display">{exp.title}</h3>
                <p className="exp-card__tagline font-handwritten">{exp.tagline}</p>
                <div className="exp-card__subcats">
                  {exp.subcategories.slice(0, 3).map((sub) => (
                    <span key={sub.id} className="exp-card__subcat">{sub.title}</span>
                  ))}
                  {exp.subcategories.length > 3 && (
                    <span className="exp-card__subcat exp-card__subcat--more">
                      +{exp.subcategories.length - 3} more
                    </span>
                  )}
                </div>
                <span className="exp-card__cta font-body">
                  Explore <DoodleArrow size={24} color="var(--card-color)" />
                </span>
              </div>
              {/* Decorative border */}
              <div className="exp-card__border" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── TESTIMONIALS ─── */
function TestimonialsSection() {
  const [ref, isInView] = useInView();
  const colors = ['var(--cream)', 'var(--peach-light)', 'var(--cream-warm)', 'var(--peach)'];
  const rotations = [-2, 1.5, -1, 2.5];

  return (
    <section className="testimonials" ref={ref}>
      <PaperTearSVG color="var(--peach-light)" position="top" className="testimonials__tear-top" />

      <div className="container">
        <div className="section-header">
          <p className="section-header__annotation font-handwritten">
            <Star size={16} /> Words from happy clients
          </p>
          <h2 className="section-header__title font-display">
            Love Notes
          </h2>
          <WavyLine color="var(--teal)" />
        </div>

        <div className={`testimonials__grid ${isInView ? 'testimonials__grid--visible' : ''}`}>
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              className="testimonial-card"
              style={{
                '--card-bg': colors[i % colors.length],
                '--card-rotation': `${rotations[i % rotations.length]}deg`,
                animationDelay: `${i * 150}ms`,
              }}
            >
              <div className="testimonial-card__quote-mark font-display" aria-hidden="true">"</div>
              <blockquote className="testimonial-card__text">
                {t.text}
              </blockquote>
              <div className="testimonial-card__footer">
                <cite className="testimonial-card__name">{t.name}</cite>
                {t.role && <span className="testimonial-card__role">{t.role}</span>}
                <span className="testimonial-card__event font-handwritten">{t.event}</span>
                {t.source && (
                  t.sourceUrl ? (
                    <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer" className="testimonial-card__source">
                      via {t.source} ↗
                    </a>
                  ) : (
                    <span className="testimonial-card__source">via {t.source}</span>
                  )
                )}
              </div>
              {t.isPlaceholder && (
                <div className="testimonial-card__placeholder-badge">
                  Placeholder — Add real review
                </div>
              )}
              <FlowerSimple size={25} color={i % 2 === 0 ? 'var(--coral)' : 'var(--teal)'} className="testimonial-card__deco" />
            </div>
          ))}
        </div>
      </div>

      <PaperTearSVG color="var(--cream)" position="bottom" className="testimonials__tear-bottom" />
    </section>
  );
}

/* ─── CTA BANNER ─── */
function CTABanner() {
  const [ref, isInView] = useInView();

  return (
    <section className="cta-banner texture-paper" ref={ref}>
      <div className="container">
        <div className={`cta-banner__inner ${isInView ? 'cta-banner__inner--visible' : ''}`}>
          <div className="cta-banner__decorations" aria-hidden="true">
            <FlowerMarigold size={60} className="cta-banner__deco cta-banner__deco--1" />
            <Leaf size={35} rotation={45} className="cta-banner__deco cta-banner__deco--2" />
            <Bird size={45} color="var(--cream)" className="cta-banner__deco cta-banner__deco--3" />
          </div>
          <h2 className="cta-banner__title font-display">
            Ready to Make Your Event<br />
            <span className="cta-banner__title-accent font-handwritten">Unforgettable?</span>
          </h2>
          <p className="cta-banner__subtitle">
            Let's talk about your vision and create magic together.
          </p>
          <div className="cta-banner__actions">
            <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer"
              className="btn btn-whatsapp btn-lg">
              💬 WhatsApp
            </a>
            <Link to="/contact" className="btn btn-secondary btn-lg">
              📋 Book Now
            </Link>
            <a href={`tel:${siteConfig.phone}`} className="btn btn-outline btn-lg" style={{ borderColor: 'var(--cream)', color: 'var(--cream)' }}>
              📞 Call Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── QUICK BOOK PANEL (homepage) ─── */
function QuickBookPanel() {
  const [ref, isInView] = useInView();
  return (
    <section className="home-qbf-section" ref={ref} id="quick-book">
      <div className="container home-qbf-layout">
        <div className={`home-qbf-layout__text ${isInView ? 'home-qbf-layout__text--visible' : ''}`}>
          <p className="font-handwritten home-qbf-annotation">
            <Sparkle size={16} color="var(--hot-magenta)" /> The fastest way to book
          </p>
          <h2 className="font-display home-qbf-title">
            Get a Custom Quote<br />
            <span className="font-handwritten" style={{ color: 'var(--hot-magenta)' }}>in Minutes</span>
          </h2>
          <p className="home-qbf-desc">
            Tell us a little about your event and we'll reach out on WhatsApp
            with a tailored proposal — no spam, ever.
          </p>
          <div className="home-qbf-extras">
            <span className="home-qbf-extra-item">✅ Weddings</span>
            <span className="home-qbf-extra-item">✅ Corporate Events</span>
            <span className="home-qbf-extra-item">✅ Private Parties</span>
            <span className="home-qbf-extra-item">✅ Character Shows</span>
          </div>
        </div>
        <div className={`home-qbf-layout__form ${isInView ? 'home-qbf-layout__form--visible' : ''}`}>
          <QuickBookForm />
        </div>
      </div>
    </section>
  );
}

/* ─── HOME PAGE ─── */
export default function Home() {
  useEffect(() => {
    document.title = 'Dhruv Chauhan — Anchor, Comedian, Corporate Host & Character Artist';
  }, []);

  return (
    <main>
      <HeroSection />
      <ShowcaseMarquee />
      <ShowreelSection variant="general" title="See Dhruv in Action" subtitle="Watch the showreel — then book your event." />
      <ExperiencePreview />
      <QuickBookPanel />
      <TestimonialsSection />
      <CTABanner />
    </main>
  );
}
