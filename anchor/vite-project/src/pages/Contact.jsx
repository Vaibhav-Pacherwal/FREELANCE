import React, { useEffect, useCallback } from 'react';
import { siteConfig, bookingFormFields } from '../data/siteData';
import { Star, Sparkle, FlowerMarigold, FlowerSimple, Bird, Leaf, WavyLine, DoodleArrow, PaperTearSVG } from '../components/Decorations';
import { useForm, useInView } from '../hooks/useHooks';
import './Contact.css';

/* ─── Contact Cards ─── */
function ContactCards() {
  const [ref, isInView] = useInView();

  const cards = [
    {
      icon: '💬',
      title: 'WhatsApp',
      subtitle: 'Quick responses, always!',
      href: siteConfig.whatsapp,
      color: '#25D366',
      external: true,
    },
    {
      icon: '📞',
      title: 'Call Now',
      subtitle: siteConfig.phone,
      href: `tel:${siteConfig.phone}`,
      color: 'var(--teal)',
      external: false,
    },
    {
      icon: '📸',
      title: 'Instagram',
      subtitle: '@dhruvchauhan',
      href: siteConfig.instagram,
      color: '#E4405F',
      external: true,
    },
    {
      icon: '🎬',
      title: 'YouTube',
      subtitle: 'Watch performances',
      href: siteConfig.youtube,
      color: '#FF0000',
      external: true,
    },
    {
      icon: '✉️',
      title: 'Email',
      subtitle: siteConfig.email,
      href: `mailto:${siteConfig.email}`,
      color: 'var(--orange)',
      external: false,
    },
  ];

  return (
    <div ref={ref} className={`contact-cards ${isInView ? 'contact-cards--visible' : ''}`}>
      {cards.map((card, i) => (
        <a
          key={card.title}
          href={card.href}
          target={card.external ? '_blank' : undefined}
          rel={card.external ? 'noopener noreferrer' : undefined}
          className="contact-card"
          style={{ '--card-accent': card.color, animationDelay: `${i * 100}ms` }}
          aria-label={`${card.title}: ${card.subtitle}`}
        >
          <span className="contact-card__icon">{card.icon}</span>
          <span className="contact-card__title">{card.title}</span>
          <span className="contact-card__subtitle">{card.subtitle}</span>
        </a>
      ))}
    </div>
  );
}

/* ─── Booking Form ─── */
function BookingForm() {
  const [ref, isInView] = useInView();
  const initialValues = Object.fromEntries(bookingFormFields.map(f => [f.name, '']));
  const { values, errors, setErrors, status, setStatus, handleChange, reset } = useForm(initialValues);

  const validate = useCallback(() => {
    const newErrors = {};
    bookingFormFields.forEach(field => {
      if (field.required && !values[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
      if (field.type === 'email' && values[field.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[field.name])) {
        newErrors[field.name] = 'Please enter a valid email';
      }
      if (field.type === 'tel' && values[field.name] && !/^[\+]?[\d\s\-]{8,15}$/.test(values[field.name])) {
        newErrors[field.name] = 'Please enter a valid phone number';
      }
    });
    return newErrors;
  }, [values]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setStatus('submitting');

    // Build WhatsApp message as fallback
    const message = encodeURIComponent(
      `🎤 New Event Inquiry!\n\n` +
      `Name: ${values.name}\n` +
      `Phone: ${values.phone}\n` +
      `Email: ${values.email || 'Not provided'}\n` +
      `Event: ${values.eventType}\n` +
      `Date: ${values.eventDate}\n` +
      `Location: ${values.eventLocation}\n` +
      `Message: ${values.message || 'None'}`
    );

    // Since no backend is connected, redirect to WhatsApp
    const whatsappUrl = `${siteConfig.whatsapp}?text=${message}`;

    setTimeout(() => {
      setStatus('success');
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }, 800);
  };

  return (
    <div ref={ref} className={`booking-form-wrap ${isInView ? 'booking-form-wrap--visible' : ''}`}>
      <div className="booking-form-header">
        <h2 className="booking-form-header__title font-display">
          <DoodleArrow size={30} rotation={-30} /> Book Dhruv
        </h2>
        <p className="booking-form-header__subtitle font-handwritten">
          Fill in the details and we'll get back to you!
        </p>
      </div>

      {status === 'success' ? (
        <div className="booking-form__success">
          <div className="booking-form__success-inner">
            <span className="booking-form__success-emoji">🎉</span>
            <h3 className="font-display">Inquiry Sent!</h3>
            <p>Your inquiry has been formatted and sent via WhatsApp. Dhruv's team will respond soon!</p>
            <p className="booking-form__success-note font-handwritten">
              If WhatsApp didn't open, you can reach out directly.
            </p>
            <div className="booking-form__success-actions">
              <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                💬 Open WhatsApp
              </a>
              <button onClick={reset} className="btn btn-outline">
                Send Another Inquiry
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form className="booking-form" onSubmit={handleSubmit} noValidate>
          {bookingFormFields.map((field) => (
            <div key={field.name} className={`booking-form__field ${errors[field.name] ? 'booking-form__field--error' : ''}`}>
              <label htmlFor={`field-${field.name}`} className="booking-form__label">
                {field.label}
                {field.required && <span className="booking-form__required" aria-label="required"> *</span>}
              </label>

              {field.type === 'select' ? (
                <select
                  id={`field-${field.name}`}
                  name={field.name}
                  value={values[field.name]}
                  onChange={handleChange}
                  className="booking-form__input booking-form__select"
                  required={field.required}
                >
                  <option value="">Select event type...</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={`field-${field.name}`}
                  name={field.name}
                  value={values[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="booking-form__input booking-form__textarea"
                  rows={4}
                />
              ) : (
                <input
                  id={`field-${field.name}`}
                  type={field.type}
                  name={field.name}
                  value={values[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="booking-form__input"
                  required={field.required}
                />
              )}

              {errors[field.name] && (
                <span className="booking-form__error" role="alert">{errors[field.name]}</span>
              )}
            </div>
          ))}

          <div className="booking-form__privacy">
            <p>
              🔒 Your information is used solely to respond to your event inquiry.
              We do not share or sell personal data.
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg booking-form__submit"
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? '⏳ Sending...' : '🎤 Send Inquiry'}
          </button>
        </form>
      )}
    </div>
  );
}

/* ─── CONTACT PAGE ─── */
export default function Contact() {
  useEffect(() => {
    document.title = 'Contact & Book — Dhruv Chauhan';
  }, []);

  return (
    <main className="contact-page">
      {/* Hero */}
      <section className="contact-hero texture-paper">
        <div className="contact-hero__decorations" aria-hidden="true">
          <FlowerMarigold size={70} className="contact-hero__deco contact-hero__deco--1" />
          <Leaf size={35} rotation={-15} className="contact-hero__deco contact-hero__deco--2" />
          <Bird size={45} color="var(--teal)" className="contact-hero__deco contact-hero__deco--3" />
          <Sparkle size={15} color="var(--hot-magenta)" className="contact-hero__deco contact-hero__deco--4" />
        </div>
        <div className="container contact-hero__content">
          <p className="contact-hero__label font-handwritten animate-in">
            <Star size={16} /> Let's make magic happen
          </p>
          <h1 className="contact-hero__title font-display animate-in animate-in-delay-1">
            Book Dhruv
          </h1>
          <p className="contact-hero__subtitle animate-in animate-in-delay-2">
            Ready to make your event unforgettable? Get in touch through any of these channels.
          </p>
          <WavyLine color="var(--hot-magenta)" />
        </div>
      </section>

      {/* Contact Cards */}
      <section className="contact-cards-section">
        <div className="container">
          <ContactCards />
        </div>
      </section>

      {/* Booking Form */}
      <section className="contact-form-section texture-paper">
        <PaperTearSVG color="var(--cream-warm)" position="top" className="contact-form-section__tear" />
        <div className="container">
          <div className="contact-form-layout">
            <div className="contact-form-layout__info">
              <h2 className="font-display contact-form-layout__title">
                Every Great Event<br />
                <span className="font-handwritten" style={{ color: 'var(--hot-magenta)' }}>Starts with a Conversation</span>
              </h2>
              <div className="contact-form-layout__deco" aria-hidden="true">
                <FlowerSimple size={45} color="var(--coral)" />
                <Leaf size={30} color="var(--teal)" rotation={30} />
                <FlowerMarigold size={55} />
              </div>
              <div className="contact-form-layout__note">
                <p className="font-handwritten">
                  <Star size={14} /> Pro tip: Include your event date and type for a faster response!
                </p>
              </div>
            </div>
            <BookingForm />
          </div>
        </div>
      </section>
    </main>
  );
}
