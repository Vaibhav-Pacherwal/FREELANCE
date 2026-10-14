import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { siteConfig, corporateContent, corporateFormFields } from '../data/siteData';
import {
  Star, Sparkle, FlowerMarigold, Leaf, Bird,
  WavyLine, DoodleArrow, PaperTearSVG
} from '../components/Decorations';
import ShowreelSection from '../components/ShowreelSection';
import { useInView } from '../hooks/useHooks';
import { useForm } from '../hooks/useHooks';
import './CorporateAnchor.css';

/* ─── Corporate Form ─── */
function CorporateInquiryForm() {
  const [ref, isInView] = useInView();
  const initialValues = Object.fromEntries(corporateFormFields.map(f => [f.name, '']));
  const { values, errors, setErrors, status, setStatus, handleChange, reset } = useForm(initialValues);

  const validate = useCallback(() => {
    const e = {};
    corporateFormFields.forEach(field => {
      if (field.required && !values[field.name]?.trim()) {
        e[field.name] = `${field.label} is required`;
      }
      if (field.type === 'email' && values[field.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[field.name])) {
        e[field.name] = 'Please enter a valid email address';
      }
      if (field.type === 'tel' && values[field.name] && !/^[\+]?[\d\s\-]{8,15}$/.test(values[field.name])) {
        e[field.name] = 'Please enter a valid phone number';
      }
    });
    return e;
  }, [values]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) { setErrors(formErrors); return; }
    setStatus('submitting');

    const msg = encodeURIComponent(
      `🏢 Corporate Booking Enquiry!\n\n` +
      `Contact: ${values.contactName}\n` +
      `Company: ${values.company}\n` +
      `Email: ${values.workEmail}\n` +
      `Phone: ${values.phone}\n` +
      `Event Format: ${values.eventType}\n` +
      `Date: ${values.eventDate || 'TBD'}\n` +
      `Location: ${values.eventLocation}\n` +
      `Audience: ${values.audienceSize || 'Not specified'}\n` +
      `Duration: ${values.duration || 'Not specified'}\n` +
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
        <p>Your corporate enquiry has been sent via WhatsApp. Dhruv's team will respond to your work email and WhatsApp shortly.</p>
        <p className="corp-form__success-note font-handwritten">
          Didn't open? Tap the button below.
        </p>
        <div className="corp-form__success-actions">
          <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
            💬 Open WhatsApp
          </a>
          <button onClick={reset} className="btn btn-outline-teal">Send Another Enquiry</button>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={`corp-form-wrap ${isInView ? 'corp-form-wrap--visible' : ''}`}>
      <div className="corp-form-header">
        <h2 className="corp-form-header__title font-display">
          Corporate Enquiry Form
        </h2>
        <p className="corp-form-header__sub font-handwritten">
          Tell us about your event — we'll send a tailored proposal.
        </p>
      </div>
      <form className="corp-form" onSubmit={handleSubmit} noValidate>
        <div className="corp-form__grid">
          {corporateFormFields.map((field) => (
            <div
              key={field.name}
              className={`corp-form__field ${field.type === 'textarea' ? 'corp-form__field--full' : ''} ${errors[field.name] ? 'corp-form__field--error' : ''}`}
            >
              <label htmlFor={`corp-${field.name}`} className="corp-form__label">
                {field.label}
                {field.required && <span className="corp-form__required" aria-label="required"> *</span>}
              </label>

              {field.type === 'select' ? (
                <select
                  id={`corp-${field.name}`}
                  name={field.name}
                  value={values[field.name]}
                  onChange={handleChange}
                  className="corp-form__input corp-form__select"
                  required={field.required}
                >
                  <option value="">Select...</option>
                  {field.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={`corp-${field.name}`}
                  name={field.name}
                  value={values[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="corp-form__input corp-form__textarea"
                  rows={4}
                />
              ) : (
                <input
                  id={`corp-${field.name}`}
                  type={field.type}
                  name={field.name}
                  value={values[field.name]}
                  onChange={handleChange}
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
          🔒 Your information is used only to respond to your event enquiry. We do not share personal data.
        </div>

        <button type="submit" className="btn btn-teal btn-lg corp-form__submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? '⏳ Sending...' : '🏢 Send Corporate Enquiry'}
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
        <div key={i} className={`corp-faq ${open === i ? 'corp-faq--open' : ''}`}>
          <button
            className="corp-faq__q"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span>{faq.q}</span>
            <span className="corp-faq__chevron" aria-hidden="true">{open === i ? '▲' : '▼'}</span>
          </button>
          {open === i && (
            <div className="corp-faq__a">
              <p>{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── CORPORATE ANCHOR PAGE ─── */
export default function CorporateAnchor() {
  useEffect(() => {
    document.title = 'Corporate Anchor & Emcee — Dhruv Chauhan | Team Building, Conference Host';
  }, []);

  const [formRef, formInView] = useInView();

  return (
    <main className="corporate-page">
      {/* SEO — unique meta is set via document.title above; 
          OG/meta-description should be added in index.html or via react-helmet when adopted */}

      {/* ─── Hero ─── */}
      <section className="corp-hero texture-paper">
        <div className="corp-hero__decorations" aria-hidden="true">
          <FlowerMarigold size={70} className="corp-hero__deco corp-hero__deco--1" />
          <Leaf size={40} color="var(--teal)" rotation={-20} className="corp-hero__deco corp-hero__deco--2" />
          <Bird size={50} color="var(--teal-dark)" className="corp-hero__deco corp-hero__deco--3" />
          <Sparkle size={16} color="var(--hot-magenta)" className="corp-hero__deco corp-hero__deco--4" />
        </div>
        <div className="container corp-hero__content">
          <p className="corp-hero__label font-handwritten animate-in">
            <Star size={16} color="var(--marigold)" /> Corporate Events
          </p>
          <h1 className="corp-hero__title font-display animate-in animate-in-delay-1">
            {corporateContent.heroHeadline}
          </h1>
          <p className="corp-hero__subline animate-in animate-in-delay-2">
            {corporateContent.heroSubline}
          </p>
          <WavyLine color="var(--teal)" />
          <div className="corp-hero__actions animate-in animate-in-delay-3">
            <a href="#corp-enquiry" className="btn btn-teal btn-lg">📋 Request a Proposal</a>
            <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
              💬 WhatsApp Us
            </a>
            <a href={`tel:${siteConfig.phone}`} className="btn btn-secondary btn-lg">
              📞 Call Now
            </a>
          </div>
        </div>
      </section>

      {/* ─── Intro ─── */}
      <section className="corp-intro">
        <div className="container corp-intro__layout">
          <div className="corp-intro__photo">
            {/* TODO: Replace with corporate event photo */}
            <div className="corp-intro__photo-placeholder">
              <span className="corp-intro__photo-icon">🎤</span>
              <span className="font-handwritten corp-intro__photo-label">Corporate Event Photo</span>
              <span className="corp-intro__photo-note">Add corporate event imagery here</span>
            </div>
          </div>
          <div className="corp-intro__text">
            <p className="font-handwritten corp-intro__annotation">
              <DoodleArrow size={28} rotation={-30} /> why Dhruv?
            </p>
            <h2 className="font-display corp-intro__title">
              Where Professionalism Meets Entertainment
            </h2>
            <p className="corp-intro__body">{corporateContent.intro}</p>
            <div className="corp-intro__capabilities">
              {[
                'Audience engagement & facilitation',
                'Seamless programme flow & transitions',
                'Interactive activities & team games',
                'Multilingual & culturally aware hosting',
                'Script collaboration with your team',
                'Experience across industries & formats',
              ].map(cap => (
                <div key={cap} className="corp-intro__capability">
                  <Star size={14} color="var(--teal)" /> {cap}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Showreel ─── */}
      <ShowreelSection
        variant="corporate"
        title="Corporate Hosting Showreel"
        subtitle="See how Dhruv handles corporate stages — conferences, team events, and annual days."
      />

      {/* ─── Event Formats ─── */}
      <section className="corp-formats texture-paper">
        <PaperTearSVG color="var(--cream-warm)" position="top" />
        <div className="container">
          <div className="section-header">
            <p className="section-header__annotation font-handwritten">
              <Sparkle size={16} color="var(--teal)" /> What Dhruv hosts
            </p>
            <h2 className="section-header__title font-display" style={{ color: 'var(--teal-dark)' }}>
              Corporate Event Formats
            </h2>
            <WavyLine color="var(--teal)" />
          </div>
          <div className="corp-formats__grid">
            {corporateContent.formats.map((fmt, i) => (
              <div key={fmt.id} className="corp-format-card" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="corp-format-card__emoji">{fmt.emoji}</span>
                <h3 className="corp-format-card__title font-display">{fmt.title}</h3>
                <p className="corp-format-card__desc">{fmt.description}</p>
                <div className="corp-format-card__meta">
                  <span>👥 {fmt.audienceSize}</span>
                  <span>⏱ {fmt.duration}</span>
                </div>
                <Link to="/contact" className="corp-format-card__cta">
                  Enquire <DoodleArrow size={20} color="var(--teal)" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Corporate Testimonials ─── */}
      <section className="corp-testimonials">
        <div className="container">
          <div className="section-header">
            <p className="section-header__annotation font-handwritten">
              <Star size={16} /> What organisations say
            </p>
            <h2 className="section-header__title font-display">Corporate Reviews</h2>
            <WavyLine color="var(--teal)" />
          </div>
          <div className="corp-testimonials__grid">
            {corporateContent.testimonials.map((t) => (
              <div key={t.id} className="corp-testimonial-card">
                <div className="corp-testimonial-card__quote font-display" aria-hidden="true">"</div>
                <blockquote className="corp-testimonial-card__text">{t.text}</blockquote>
                <div className="corp-testimonial-card__footer">
                  <cite className="corp-testimonial-card__name">{t.name}</cite>
                  {t.company && <span className="corp-testimonial-card__company">{t.company}</span>}
                  <span className="corp-testimonial-card__event font-handwritten">{t.event}</span>
                </div>
                {t.isPlaceholder && (
                  <div className="corp-testimonial-card__placeholder">Placeholder — Add real review</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing / Quote ─── */}
      <section className="corp-pricing texture-paper">
        <PaperTearSVG color="var(--peach-light)" position="top" />
        <div className="container corp-pricing__inner">
          <div className="section-header">
            <p className="section-header__annotation font-handwritten">
              <Sparkle size={16} color="var(--hot-magenta)" /> Investment
            </p>
            <h2 className="section-header__title font-display">Pricing & Packages</h2>
            <WavyLine color="var(--hot-magenta)" />
          </div>

          <div className="corp-pricing__card">
            <div className="corp-pricing__card-icon">💼</div>
            <h3 className="corp-pricing__card-title font-display">Custom Quote for Every Event</h3>
            <p className="corp-pricing__card-body">
              Every corporate event is unique. The investment for Dhruv's hosting depends on several factors:
            </p>
            <ul className="corp-pricing__factors">
              {[
                'Event format and number of segments',
                'Duration of hosting required',
                'Event location and travel requirements',
                'Date and season',
                'Specific performance or character elements',
                'Audience size and programme complexity',
              ].map(factor => (
                <li key={factor} className="corp-pricing__factor">
                  <Star size={12} color="var(--teal)" /> {factor}
                </li>
              ))}
            </ul>
            <p className="corp-pricing__cta-text font-handwritten">
              Contact us for a no-obligation quote — usually within 24 hours.
            </p>
            <div className="corp-pricing__actions">
              <a href="#corp-enquiry" className="btn btn-teal btn-lg">📋 Request a Quote</a>
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
            <WavyLine color="var(--teal)" />
          </div>
          <FAQ faqs={corporateContent.faqs} />
        </div>
      </section>

      {/* ─── Enquiry Form ─── */}
      <section className="corp-enquiry-section" id="corp-enquiry">
        <PaperTearSVG color="var(--teal)" position="top" className="corp-enquiry-section__tear" />
        <div className="container corp-enquiry-layout">
          <div className="corp-enquiry-info">
            <h2 className="corp-enquiry-info__title font-display">
              Plan Your <span className="font-handwritten" style={{ color: 'var(--marigold)' }}>Corporate Event</span>
            </h2>
            <p className="corp-enquiry-info__body">
              Share the details below and Dhruv's team will come back with a tailored proposal — usually within one business day.
            </p>
            <div className="corp-enquiry-info__contacts">
              <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                💬 WhatsApp
              </a>
              <a href={`tel:${siteConfig.phone}`} className="btn btn-secondary">
                📞 Call Now
              </a>
            </div>
          </div>
          <CorporateInquiryForm />
        </div>
      </section>
    </main>
  );
}
