import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  siteConfig, experiences, testimonials, galleryItems, showreels,
  weddingContent, weddingFormFields, pricingStrategy,
} from '../data/siteData';
import {
  Star, Sparkle, FlowerMarigold, Leaf, Bird,
  WavyLine, DoodleArrow, PaperTearSVG
} from '../components/Decorations';
import ShowreelSection from '../components/ShowreelSection';
import { useInView, useForm } from '../hooks/useHooks';
import './CorporateAnchor.css';
import './WeddingAnchor.css';

const PAGE_TITLE = 'Wedding Anchor — Haldi, Mehndi & Sangeet Host | Dhruv Chauhan';
const PAGE_DESC = 'Book Dhruv Chauhan as your wedding anchor for haldi, mehndi and sangeet — games, dance, comedy and high-energy hosting. Send an enquiry or message on WhatsApp.';

/** Set page-level meta tags, restoring the previous values when leaving the page. */
function usePageMeta({ title, description, path }) {
  useEffect(() => {
    const url = `${window.location.origin}${path}`;
    const prevTitle = document.title;
    document.title = title;

    const entries = [
      ['name', 'description', description],
      ['property', 'og:title', title],
      ['property', 'og:description', description],
      ['property', 'og:type', 'website'],
      ['property', 'og:url', url],
      ['name', 'twitter:card', 'summary'],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', description],
    ];
    const restore = [];
    entries.forEach(([attr, key, value]) => {
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (el) {
        const prev = el.getAttribute('content');
        restore.push(() => el.setAttribute('content', prev));
      } else {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
        restore.push(() => el.remove());
      }
      el.setAttribute('content', value);
    });

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) {
      const prev = canonical.getAttribute('href');
      restore.push(() => canonical.setAttribute('href', prev));
    } else {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
      restore.push(() => canonical.remove());
    }
    canonical.setAttribute('href', url);

    return () => {
      document.title = prevTitle;
      restore.forEach(fn => fn());
    };
  }, [title, description, path]);
}

/* ─── Wedding Form ─── */
function WeddingInquiryForm({ picked, setPicked }) {
  const [ref, isInView] = useInView();
  const initialValues = Object.fromEntries(weddingFormFields.map(f => [f.name, '']));
  const { values, errors, setErrors, status, setStatus, handleChange, reset } = useForm(initialValues);
  // `picked` is the function chosen from the cards above; cleared once the user edits the select directly.
  const fnValue = picked || values.weddingFunction;
  const getValue = (name) => (name === 'weddingFunction' ? fnValue : values[name]);

  const onChange = (e) => {
    if (e.target.name === 'weddingFunction') setPicked('');
    handleChange(e);
  };

  const validate = () => {
    const e = {};
    weddingFormFields.forEach(field => {
      const v = getValue(field.name);
      if (field.required && !v?.trim()) e[field.name] = `${field.label} is required`;
      if (field.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        e[field.name] = 'Please enter a valid email address';
      }
      if (field.type === 'tel' && v && !/^[+]?[\d\s-]{8,15}$/.test(v)) {
        e[field.name] = 'Please enter a valid phone number';
      }
    });
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) { setErrors(formErrors); return; }
    setStatus('submitting');

    const msg = encodeURIComponent(
      `💍 Wedding Booking Enquiry!\n\n` +
      `Name: ${values.contactName}\n` +
      `Phone: ${values.phone}\n` +
      `Email: ${values.email || 'Not provided'}\n` +
      `Function: ${fnValue}\n` +
      `Date: ${values.eventDate || 'TBD'}\n` +
      `City / Venue: ${values.eventLocation}\n` +
      `Guests: ${values.guestCount || 'Not specified'}\n` +
      `Notes: ${values.message || 'None'}`
    );

    setTimeout(() => {
      setStatus('success');
      window.open(`${siteConfig.whatsapp}?text=${msg}`, '_blank', 'noopener,noreferrer');
    }, 800);
  };

  if (status === 'success') {
    return (
      <div className="corp-form__success">
        <span className="corp-form__success-icon">🎉</span>
        <h3 className="font-display">Enquiry Received!</h3>
        <p>Your wedding enquiry has been sent via WhatsApp. Dhruv's team will respond shortly.</p>
        <p className="corp-form__success-note font-handwritten">
          Didn't open? Tap the button below.
        </p>
        <div className="corp-form__success-actions">
          <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
            💬 Open WhatsApp
          </a>
          <button onClick={() => { reset(); setPicked(''); }} className="btn btn-outline-teal">Send Another Enquiry</button>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={`corp-form-wrap ${isInView ? 'corp-form-wrap--visible' : ''}`}>
      <div className="corp-form-header">
        <h2 className="corp-form-header__title font-display">Wedding Enquiry Form</h2>
        <p className="corp-form-header__sub font-handwritten">
          Tell us about your celebration — we'll get back to you on WhatsApp.
        </p>
      </div>
      <form className="corp-form" onSubmit={handleSubmit} noValidate>
        <div className="corp-form__grid">
          {weddingFormFields.map((field) => (
            <div
              key={field.name}
              className={`corp-form__field ${field.type === 'textarea' ? 'corp-form__field--full' : ''} ${errors[field.name] ? 'corp-form__field--error' : ''}`}
            >
              <label htmlFor={`wed-${field.name}`} className="corp-form__label">
                {field.label}
                {field.required && <span className="corp-form__required" aria-label="required"> *</span>}
              </label>

              {field.type === 'select' ? (
                <select
                  id={`wed-${field.name}`}
                  name={field.name}
                  value={getValue(field.name)}
                  onChange={onChange}
                  className="corp-form__input corp-form__select"
                  required={field.required}
                >
                  <option value="">Select...</option>
                  {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={`wed-${field.name}`}
                  name={field.name}
                  value={values[field.name]}
                  onChange={onChange}
                  placeholder={field.placeholder}
                  className="corp-form__input corp-form__textarea"
                  rows={4}
                />
              ) : (
                <input
                  id={`wed-${field.name}`}
                  type={field.type}
                  name={field.name}
                  value={values[field.name]}
                  onChange={onChange}
                  placeholder={field.placeholder}
                  className="corp-form__input"
                  required={field.required}
                />
              )}

              {errors[field.name] && (
                <span className="corp-form__error" role="alert">{errors[field.name]}</span>
              )}
            </div>
          ))}
        </div>

        <div className="corp-form__privacy">
          🔒 Your information is used only to respond to your wedding enquiry. We do not share personal data.
        </div>

        <button type="submit" className="btn btn-teal btn-lg corp-form__submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? '⏳ Sending...' : '💍 Send Wedding Enquiry'}
        </button>
      </form>
    </div>
  );
}

/* ─── FAQ Accordion ─── */
function FAQ({ faqs }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="corp-faqs">
      {faqs.map((faq, i) => (
        <div key={faq.q} className={`corp-faq ${open === i ? 'corp-faq--open' : ''}`}>
          <button
            className="corp-faq__q"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span>{faq.q}</span>
            <span className="corp-faq__chevron" aria-hidden="true">{open === i ? '▲' : '▼'}</span>
          </button>
          {open === i && <div className="corp-faq__a"><p>{faq.a}</p></div>}
        </div>
      ))}
    </div>
  );
}

/* ─── WEDDING ANCHOR PAGE ─── */
export default function WeddingAnchor() {
  usePageMeta({ title: PAGE_TITLE, description: PAGE_DESC, path: '/wedding-anchor' });
  const [picked, setPicked] = useState('');

  const wedding = experiences.find(e => e.id === 'wedding');
  const functions = wedding.subcategories.map(sub => ({
    ...sub,
    ...weddingContent.functions.find(f => f.id === sub.id),
  }));

  // Only genuine wedding proof is shown: no placeholders, no other categories.
  const weddingReviews = testimonials.filter(t => t.category === 'wedding' && !t.isPlaceholder);
  const weddingMedia = galleryItems.filter(g => g.category === 'wedding' && !g.isPlaceholder);
  const hasWeddingReel = Boolean(showreels.wedding?.embedUrl);

  const chooseFunction = (name) => {
    setPicked(name);
    document.getElementById('wed-enquiry')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="corporate-page wedding-page">
      {/* ─── Hero ─── */}
      <section className="corp-hero wed-hero texture-paper">
        <div className="corp-hero__decorations" aria-hidden="true">
          <FlowerMarigold size={70} className="corp-hero__deco corp-hero__deco--1" />
          <Leaf size={40} color="var(--hot-magenta)" rotation={-20} className="corp-hero__deco corp-hero__deco--2" />
          <Bird size={50} color="var(--hot-magenta)" className="corp-hero__deco corp-hero__deco--3" />
          <Sparkle size={16} color="var(--marigold)" className="corp-hero__deco corp-hero__deco--4" />
        </div>
        <div className="container corp-hero__content">
          <p className="corp-hero__label font-handwritten animate-in">
            <Star size={16} color="var(--marigold)" /> Wedding Events
          </p>
          <h1 className="corp-hero__title font-display animate-in animate-in-delay-1">
            {weddingContent.heroHeadline}
          </h1>
          <p className="corp-hero__subline animate-in animate-in-delay-2">
            {weddingContent.heroSubline}
          </p>
          <WavyLine color="var(--hot-magenta)" />
          <div className="corp-hero__actions animate-in animate-in-delay-3">
            <a href="#wed-enquiry" className="btn btn-primary btn-lg">💍 Check Availability</a>
            <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
              💬 WhatsApp Us
            </a>
            <a href={`tel:${siteConfig.phone}`} className="btn btn-secondary btn-lg">📞 Call Now</a>
          </div>
        </div>
      </section>

      {/* ─── Intro ─── */}
      <section className="corp-intro">
        <div className="container wed-intro">
          <p className="font-handwritten corp-intro__annotation">
            <DoodleArrow size={28} rotation={-30} /> why Dhruv?
          </p>
          <h2 className="font-display corp-intro__title">
            Every Function Gets Its Own Energy
          </h2>
          <p className="corp-intro__body">{weddingContent.intro}</p>
          <div className="corp-intro__capabilities">
            {weddingContent.capabilities.map(cap => (
              <div key={cap} className="corp-intro__capability">
                <Star size={14} color="var(--hot-magenta)" /> {cap}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Functions: Haldi / Mehndi / Sangeet ─── */}
      <section className="corp-formats texture-paper" id="wed-functions">
        <PaperTearSVG color="var(--cream-warm)" position="top" />
        <div className="container">
          <div className="section-header">
            <p className="section-header__annotation font-handwritten">
              <Sparkle size={16} color="var(--hot-magenta)" /> What Dhruv hosts
            </p>
            <h2 className="section-header__title font-display" style={{ color: 'var(--hot-magenta)' }}>
              Haldi, Mehndi &amp; Sangeet
            </h2>
            <WavyLine color="var(--hot-magenta)" />
          </div>
          <div className="corp-formats__grid wed-functions__grid">
            {functions.map((fn, i) => (
              <div key={fn.id} className="corp-format-card" id={`wed-${fn.id}`} style={{ animationDelay: `${i * 100}ms` }}>
                <span className="corp-format-card__emoji">{fn.emoji}</span>
                <h3 className="corp-format-card__title font-display">{fn.title}</h3>
                <p className="corp-format-card__desc">{fn.description}</p>
                <div className="wed-fn-actions">
                  <button type="button" className="corp-format-card__cta wed-fn-btn" onClick={() => chooseFunction(fn.title)}>
                    Enquire for {fn.title} <DoodleArrow size={20} color="var(--hot-magenta)" />
                  </button>
                  <Link to="/experiences#wedding" className="wed-fn-link">See in Experiences</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Performance media (genuine wedding media only) ─── */}
      {hasWeddingReel && (
        <ShowreelSection
          variant="wedding"
          title="Wedding Hosting Showreel"
          subtitle="See how Dhruv hosts haldi, mehndi and sangeet nights."
        />
      )}

      {weddingMedia.length > 0 && (
        <section className="wed-media">
          <div className="container">
            <div className="section-header">
              <p className="section-header__annotation font-handwritten">
                <Star size={16} /> From real weddings
              </p>
              <h2 className="section-header__title font-display">Wedding Moments</h2>
              <WavyLine color="var(--hot-magenta)" />
            </div>
            <div className="wed-media__grid">
              {weddingMedia.map(item => (
                item.type === 'video' ? (
                  <iframe
                    key={item.id}
                    className="wed-media__item"
                    src={item.videoUrl}
                    title={item.alt || item.caption || 'Wedding performance'}
                    loading="lazy"
                    allowFullScreen
                  />
                ) : (
                  <img key={item.id} className="wed-media__item" src={item.src} alt={item.alt} loading="lazy" />
                )
              ))}
            </div>
            <p className="wed-media__more"><Link to="/gallery">View full gallery →</Link></p>
          </div>
        </section>
      )}

      {!hasWeddingReel && weddingMedia.length === 0 && (
        <section className="wed-media wed-media--watch">
          <div className="container">
            <div className="section-header">
              <p className="section-header__annotation font-handwritten">
                <Sparkle size={16} color="var(--marigold)" /> See Dhruv perform
              </p>
              <h2 className="section-header__title font-display">Watch Dhruv Live</h2>
              <WavyLine color="var(--hot-magenta)" />
            </div>
            <p className="wed-media__text">
              Follow Dhruv's latest performances on Instagram and YouTube, or browse the gallery.
            </p>
            <div className="corp-pricing__actions">
              <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Instagram</a>
              <a href={siteConfig.youtube} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">YouTube</a>
              <Link to="/gallery" className="btn btn-outline">Gallery</Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Wedding reviews (genuine only) ─── */}
      {weddingReviews.length > 0 && (
        <section className="corp-testimonials">
          <div className="container">
            <div className="section-header">
              <p className="section-header__annotation font-handwritten">
                <Star size={16} /> What couples &amp; families say
              </p>
              <h2 className="section-header__title font-display">Wedding Reviews</h2>
              <WavyLine color="var(--hot-magenta)" />
            </div>
            <div className="corp-testimonials__grid">
              {weddingReviews.map((t) => (
                <div key={t.id} className="corp-testimonial-card">
                  <div className="corp-testimonial-card__quote font-display" aria-hidden="true">"</div>
                  <blockquote className="corp-testimonial-card__text">{t.text}</blockquote>
                  <div className="corp-testimonial-card__footer">
                    <cite className="corp-testimonial-card__name">{t.name}</cite>
                    {t.role && <span className="corp-testimonial-card__company">{t.role}</span>}
                    <span className="corp-testimonial-card__event font-handwritten">{t.event}</span>
                    {t.sourceUrl && (
                      <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer">Source: {t.source}</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Pricing / Quote ─── */}
      <section className="corp-pricing texture-paper">
        <PaperTearSVG color="var(--peach-light)" position="top" />
        <div className="container corp-pricing__inner">
          <div className="section-header">
            <p className="section-header__annotation font-handwritten">
              <Sparkle size={16} color="var(--hot-magenta)" /> Investment
            </p>
            <h2 className="section-header__title font-display">Pricing &amp; Booking</h2>
            <WavyLine color="var(--hot-magenta)" />
          </div>
          <div className="corp-pricing__card">
            <div className="corp-pricing__card-icon">💍</div>
            <h3 className="corp-pricing__card-title font-display">Custom Quote for Every Wedding</h3>
            <p className="corp-pricing__card-body">
              The investment for Dhruv's hosting depends on several factors:
            </p>
            <ul className="corp-pricing__factors">
              {pricingStrategy.quoteFactors.map(factor => (
                <li key={factor} className="corp-pricing__factor">
                  <Star size={12} color="var(--hot-magenta)" /> {factor}
                </li>
              ))}
            </ul>
            <div className="corp-pricing__actions">
              <a href="#wed-enquiry" className="btn btn-primary btn-lg">💍 Request a Quote</a>
              <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
                💬 Quick WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="corp-faq-section">
        <div className="container">
          <div className="section-header">
            <p className="section-header__annotation font-handwritten">
              <DoodleArrow size={24} rotation={-20} /> Common questions
            </p>
            <h2 className="section-header__title font-display">FAQs</h2>
            <WavyLine color="var(--hot-magenta)" />
          </div>
          <FAQ faqs={weddingContent.faqs} />
          <p className="wed-also">
            Hosting a company event too? See <Link to="/corporate-anchor">Corporate Anchoring</Link> or the full <Link to="/contact">contact page</Link>.
          </p>
        </div>
      </section>

      {/* ─── Enquiry Form ─── */}
      <section className="corp-enquiry-section" id="wed-enquiry">
        <PaperTearSVG color="var(--teal)" position="top" className="corp-enquiry-section__tear" />
        <div className="container corp-enquiry-layout">
          <div className="corp-enquiry-info">
            <h2 className="corp-enquiry-info__title font-display">
              Plan Your <span className="font-handwritten" style={{ color: 'var(--marigold)' }}>Wedding Celebration</span>
            </h2>
            <p className="corp-enquiry-info__body">
              Share the details and Dhruv's team will get back to you with availability and a tailored quote.
            </p>
            <div className="corp-enquiry-info__contacts">
              <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">💬 WhatsApp</a>
              <a href={`tel:${siteConfig.phone}`} className="btn btn-secondary">📞 Call Now</a>
            </div>
          </div>
          <WeddingInquiryForm picked={picked} setPicked={setPicked} />
        </div>
      </section>
    </main>
  );
}
