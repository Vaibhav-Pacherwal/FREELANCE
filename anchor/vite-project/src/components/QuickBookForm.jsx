import React, { useState, useCallback } from 'react';
import { siteConfig } from '../data/siteData';
import { DoodleArrow, Star } from './Decorations';
import './QuickBookForm.css';

/**
 * QuickBookForm — compact inline booking form for the homepage.
 * Collects essential info only and sends via WhatsApp.
 * Mirrors the UX shown in the ChatGPT screenshot from the client.
 */
export default function QuickBookForm() {
  const [values, setValues] = useState({
    eventType: 'Wedding',
    eventDate: '',
    eventCity: '',
    functions: '1 function',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  const eventTypes = ['Wedding', 'Corporate', 'Comedy / Character Artist', 'Other'];
  const functionOptions = ['1 function', '2 functions', '3 functions', '4+ functions'];

  const handleChange = useCallback((field, val) => {
    setValues(prev => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }, [errors]);

  const validate = () => {
    const e = {};
    if (!values.eventDate) e.eventDate = 'Please select a date';
    if (!values.eventCity.trim()) e.eventCity = 'Please enter your city';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStatus('submitting');
    const msg = encodeURIComponent(
      `🎤 New Booking Enquiry!\n\n` +
      `Event Type: ${values.eventType}\n` +
      `Date: ${values.eventDate}\n` +
      `City: ${values.eventCity}\n` +
      `Functions: ${values.functions}`
    );
    setTimeout(() => {
      setStatus('sent');
      window.open(`${siteConfig.whatsapp}?text=${msg}`, '_blank', 'noopener,noreferrer');
    }, 600);
  };

  if (status === 'sent') {
    return (
      <div className="qbf qbf--success">
        <span className="qbf__success-icon">🎉</span>
        <p className="font-display qbf__success-title">Enquiry Sent!</p>
        <p className="qbf__success-sub font-handwritten">We'll respond on WhatsApp shortly.</p>
        <button className="btn btn-outline qbf__reset" onClick={() => { setStatus('idle'); setValues({ eventType: 'Wedding', eventDate: '', eventCity: '', functions: '1 function' }); }}>
          Send Another
        </button>
      </div>
    );
  }

  return (
    <div className="qbf">
      <div className="qbf__header">
        <h3 className="qbf__title font-display">
          <DoodleArrow size={24} rotation={-20} /> Quick Booking Enquiry
        </h3>
        <p className="qbf__sub font-handwritten">
          <Star size={12} color="var(--marigold)" /> Fill in the basics — we'll handle the rest!
        </p>
      </div>

      <form className="qbf__form" onSubmit={handleSubmit} noValidate>
        {/* Event Type */}
        <fieldset className="qbf__fieldset">
          <legend className="qbf__legend">Event type</legend>
          <div className="qbf__radio-group">
            {eventTypes.map(type => (
              <label key={type} className={`qbf__radio-label ${values.eventType === type ? 'qbf__radio-label--active' : ''}`}>
                <input
                  type="radio"
                  name="eventType"
                  value={type}
                  checked={values.eventType === type}
                  onChange={() => handleChange('eventType', type)}
                  className="qbf__radio"
                />
                {type}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Event Date */}
        <div className={`qbf__field ${errors.eventDate ? 'qbf__field--error' : ''}`}>
          <label htmlFor="qbf-date" className="qbf__label">Event date</label>
          <input
            id="qbf-date"
            type="date"
            className="qbf__input"
            value={values.eventDate}
            onChange={e => handleChange('eventDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.eventDate && <span className="qbf__error" role="alert">{errors.eventDate}</span>}
        </div>

        {/* Event City */}
        <div className={`qbf__field ${errors.eventCity ? 'qbf__field--error' : ''}`}>
          <label htmlFor="qbf-city" className="qbf__label">Event city</label>
          <input
            id="qbf-city"
            type="text"
            className="qbf__input"
            placeholder="Delhi NCR, Mumbai, etc."
            value={values.eventCity}
            onChange={e => handleChange('eventCity', e.target.value)}
          />
          {errors.eventCity && <span className="qbf__error" role="alert">{errors.eventCity}</span>}
        </div>

        {/* Number of functions */}
        <fieldset className="qbf__fieldset">
          <legend className="qbf__legend">Number of functions</legend>
          <div className="qbf__radio-group">
            {functionOptions.map(opt => (
              <label key={opt} className={`qbf__radio-label ${values.functions === opt ? 'qbf__radio-label--active' : ''}`}>
                <input
                  type="radio"
                  name="functions"
                  value={opt}
                  checked={values.functions === opt}
                  onChange={() => handleChange('functions', opt)}
                  className="qbf__radio"
                />
                {opt}
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          className="btn btn-primary qbf__submit"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? '⏳ Opening WhatsApp...' : '💬 Get a Custom Quote'}
        </button>

        <p className="qbf__note">🔒 Sent securely via WhatsApp — no spam, ever.</p>
      </form>
    </div>
  );
}
