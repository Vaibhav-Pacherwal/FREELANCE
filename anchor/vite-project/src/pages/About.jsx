import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { siteConfig, aboutContent } from '../data/siteData';
import {
  FlowerMarigold, FlowerSimple, Leaf, Bird, Star,
  Sparkle, WavyLine, DoodleArrow, PaperTearSVG
} from '../components/Decorations';
import { useInView } from '../hooks/useHooks';
import './About.css';

export default function About() {
  useEffect(() => {
    document.title = 'About Dhruv Chauhan — Anchor, Comedian & Entertainer';
  }, []);

  const [bioRef, bioInView] = useInView();
  const [statsRef, statsInView] = useInView();

  return (
    <main className="about-page">
      {/* Hero Banner */}
      <section className="about-hero texture-paper">
        <div className="about-hero__decorations" aria-hidden="true">
          <FlowerMarigold size={80} className="about-hero__deco about-hero__deco--1" />
          <Leaf size={40} rotation={-20} className="about-hero__deco about-hero__deco--2" />
          <Bird size={50} color="var(--teal)" className="about-hero__deco about-hero__deco--3" />
          <Star size={20} className="about-hero__deco about-hero__deco--4" />
          <Sparkle size={15} color="var(--hot-magenta)" className="about-hero__deco about-hero__deco--5" />
        </div>

        <div className="container about-hero__content">
          <p className="about-hero__label font-handwritten animate-in">
            <Star size={16} /> Get to know
          </p>
          <h1 className="about-hero__title font-display animate-in animate-in-delay-1">
            {aboutContent.headline}
          </h1>
          <WavyLine color="var(--hot-magenta)" />
        </div>
      </section>

      {/* Bio Section */}
      <section className="about-bio" ref={bioRef}>
        <div className="container about-bio__layout">
          <div className="about-bio__photo-col">
            <div className="about-bio__photo-frame">
              {/* TODO: Replace with Dhruv's real portrait */}
              <div className="about-bio__photo-placeholder">
                <span className="about-bio__photo-emoji">🎭</span>
                <span className="about-bio__photo-text font-handwritten">
                  Portrait Photo
                </span>
              </div>
              <div className="about-bio__photo-sticker" aria-hidden="true">
                <FlowerSimple size={30} color="var(--hot-magenta)" />
              </div>
            </div>
            <p className="about-bio__annotation font-handwritten" aria-hidden="true">
              <DoodleArrow size={28} rotation={-60} /> that's me!
            </p>

            {/* Handwritten notes */}
            <div className="about-bio__notes" aria-hidden="true">
              <div className="about-bio__note about-bio__note--1">
                <p className="font-handwritten">Loves chai & stage equally ☕</p>
              </div>
              <div className="about-bio__note about-bio__note--2">
                <p className="font-handwritten">Born entertainer 🌟</p>
              </div>
            </div>
          </div>

          <div className={`about-bio__text-col ${bioInView ? 'about-bio__text-col--visible' : ''}`}>
            <h2 className="about-bio__name font-display">
              <span className="about-bio__name-dhruv">Dhruv</span>{' '}
              <span className="about-bio__name-chauhan">Chauhan</span>
            </h2>
            <div className="about-bio__roles">
              {siteConfig.roles.map((role) => (
                <span key={role} className="about-bio__role">{role}</span>
              ))}
            </div>

            <div className="about-bio__paragraphs">
              {aboutContent.bio.map((para, i) => (
                <p key={i} className="about-bio__para">{para}</p>
              ))}
            </div>

            <div className="about-bio__actions">
              <Link to="/experiences" className="btn btn-teal">
                See My Work
              </Link>
              <Link to="/contact" className="btn btn-primary">
                Book Me
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Highlights */}
      <section className="about-stats texture-paper" ref={statsRef}>
        <PaperTearSVG color="var(--teal)" position="top" className="about-stats__tear" />
        <div className="container">
          <div className={`about-stats__grid ${statsInView ? 'about-stats__grid--visible' : ''}`}>
            {aboutContent.highlights.map((stat, i) => (
              <div key={stat.label} className="about-stat" style={{ animationDelay: `${i * 120}ms` }}>
                <span className="about-stat__value font-display">{stat.value}</span>
                <span className="about-stat__label">{stat.label}</span>
                {stat.note && (
                  <span className="about-stat__note font-handwritten">{stat.note}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline (simple) */}
      <section className="about-journey">
        <div className="container">
          <div className="section-header">
            <p className="section-header__annotation font-handwritten">
              <Sparkle size={16} color="var(--hot-magenta)" /> The journey so far
            </p>
            <h2 className="section-header__title font-display">
              My Story
            </h2>
            <WavyLine color="var(--teal)" />
          </div>

          <div className="about-journey__content">
            <div className="about-journey__item">
              <div className="about-journey__marker">
                <FlowerSimple size={20} color="var(--hot-magenta)" />
              </div>
              <div className="about-journey__text">
                <h3 className="about-journey__title font-display">The Beginning</h3>
                <p className="font-handwritten about-journey__note">Where it all started...</p>
                <p>
                  {/* TODO: Add Dhruv's real journey milestones */}
                  Add the story of how Dhruv's journey in entertainment began —
                  first performances, early inspirations, and the spark that lit the fire.
                </p>
              </div>
            </div>
            <div className="about-journey__item">
              <div className="about-journey__marker">
                <Star size={18} color="var(--marigold)" />
              </div>
              <div className="about-journey__text">
                <h3 className="about-journey__title font-display">The Growth</h3>
                <p className="font-handwritten about-journey__note">Bigger stages, bigger dreams...</p>
                <p>
                  Add milestones, key events, memorable shows, and career-defining moments
                  that shaped Dhruv as a performer.
                </p>
              </div>
            </div>
            <div className="about-journey__item">
              <div className="about-journey__marker">
                <Sparkle size={18} color="var(--orange)" />
              </div>
              <div className="about-journey__text">
                <h3 className="about-journey__title font-display">Today & Beyond</h3>
                <p className="font-handwritten about-journey__note">The show goes on!</p>
                <p>
                  Add Dhruv's current focus, upcoming projects, vision for the future,
                  and what drives him to keep performing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta texture-paper">
        <div className="container about-cta__inner">
          <Bird size={50} color="var(--cream)" className="about-cta__bird" />
          <h2 className="about-cta__title font-display">
            Let's Create Something <span className="font-handwritten" style={{ color: 'var(--marigold)' }}>Magical</span>
          </h2>
          <div className="about-cta__actions">
            <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
              💬 WhatsApp Me
            </a>
            <Link to="/contact" className="btn btn-secondary btn-lg">
              📋 Book an Event
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
