import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { formatPrice } from '../data/products';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { items, subtotal, itemCount } = useCart();
  const [step, setStep] = useState(1); // 1 = details, 2 = confirmation
  const [form, setForm] = useState({
    name: '',
    phone: '',
    pincode: '',
    address: '',
    date: '',
    notes: '',
    payment: 'cod',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    /* PROTOTYPE ONLY — no real order placement */
    setStep(2);
  };

  if (items.length === 0 && step === 1) {
    return (
      <div className="checkout section">
        <div className="container checkout__empty">
          <h1>Checkout</h1>
          <p>Your cart is empty. Add some items before checking out.</p>
          <Link to="/shop" className="btn btn--primary">Browse Shop</Link>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="checkout section">
        <div className="container checkout__confirmation">
          <div className="checkout__confirmation-icon" aria-hidden="true">✦</div>
          <h1 className="checkout__confirmation-title">Order Preview</h1>
          <p className="checkout__confirmation-note">
            <strong>This is a prototype.</strong> No actual order has been placed.
            In the live version, your order will be confirmed here after payment.
          </p>
          <div className="checkout__confirmation-details">
            <p><strong>Name:</strong> {form.name || 'Not provided'}</p>
            <p><strong>Phone:</strong> {form.phone || 'Not provided'}</p>
            <p><strong>Delivery PIN:</strong> {form.pincode || 'Not provided'}</p>
            <p><strong>Items:</strong> {itemCount}</p>
            <p><strong>Subtotal:</strong> {formatPrice(subtotal)}</p>
          </div>
          <div className="checkout__confirmation-actions">
            <Link to="/" className="btn btn--primary">Back to Home</Link>
            <Link to="/shop" className="btn btn--ghost">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">
      {/* Header */}
      <div className="checkout__hero section--cream">
        <div className="container">
          <span className="label label--gold">Checkout</span>
          <h1 className="checkout__title">Complete Your Order</h1>
        </div>
      </div>

      <div className="container checkout__main">
        <div className="checkout__layout">
          {/* Form */}
          <form className="checkout__form" onSubmit={handleSubmit}>
            <fieldset className="checkout__fieldset">
              <legend className="checkout__legend">Delivery Details</legend>

              <div className="checkout__field">
                <label htmlFor="checkout-name" className="checkout__label">Full Name</label>
                <input
                  type="text"
                  id="checkout-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="checkout__input"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="checkout__field">
                <label htmlFor="checkout-phone" className="checkout__label">Phone Number</label>
                <input
                  type="tel"
                  id="checkout-phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="checkout__input"
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>

              <div className="checkout__row">
                <div className="checkout__field">
                  <label htmlFor="checkout-pincode" className="checkout__label">Delivery PIN Code</label>
                  <input
                    type="text"
                    id="checkout-pincode"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    className="checkout__input"
                    placeholder="6-digit PIN"
                    maxLength={6}
                    required
                  />
                </div>
                <div className="checkout__field">
                  <label htmlFor="checkout-date" className="checkout__label">Preferred Delivery Date</label>
                  <input
                    type="date"
                    id="checkout-date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="checkout__input"
                  />
                </div>
              </div>

              <div className="checkout__field">
                <label htmlFor="checkout-address" className="checkout__label">Delivery Address</label>
                <textarea
                  id="checkout-address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="checkout__input checkout__textarea"
                  placeholder="Full delivery address"
                  rows={3}
                  required
                />
              </div>

              <div className="checkout__field">
                <label htmlFor="checkout-notes" className="checkout__label">Special Instructions <span>(optional)</span></label>
                <textarea
                  id="checkout-notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="checkout__input checkout__textarea"
                  placeholder="Cake message, allergen notes, etc."
                  rows={2}
                />
              </div>
            </fieldset>

            <fieldset className="checkout__fieldset">
              <legend className="checkout__legend">Payment Method</legend>
              <div className="checkout__payment-options">
                <label className={`checkout__payment-option${form.payment === 'cod' ? ' active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={form.payment === 'cod'}
                    onChange={handleChange}
                  />
                  <span className="checkout__payment-radio" />
                  <div>
                    <strong>Cash on Delivery</strong>
                    <p>Pay when your order arrives</p>
                  </div>
                </label>
                <label className={`checkout__payment-option${form.payment === 'online' ? ' active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={form.payment === 'online'}
                    onChange={handleChange}
                  />
                  <span className="checkout__payment-radio" />
                  <div>
                    <strong>Pay Online</strong>
                    <p>UPI, Cards, Netbanking (coming soon)</p>
                  </div>
                </label>
              </div>
            </fieldset>

            <div className="checkout__prototype-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <p>This is a <strong>design prototype</strong>. No real order will be placed.</p>
            </div>

            <button type="submit" className="btn btn--primary checkout__submit">
              Preview Order
            </button>
          </form>

          {/* Order Summary */}
          <aside className="checkout__summary">
            <h3 className="checkout__summary-title">Order Summary</h3>
            <ul className="checkout__summary-items">
              {items.map((item) => (
                <li key={item.key} className="checkout__summary-item">
                  <div className="checkout__summary-item-info">
                    <span className="checkout__summary-item-name">{item.product.name}</span>
                    <span className="checkout__summary-item-variant label">{item.variant.label} × {item.quantity}</span>
                  </div>
                  <span className="checkout__summary-item-price">
                    {formatPrice(item.variant.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="checkout__summary-totals">
              <div className="checkout__summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="checkout__summary-row">
                <span>Delivery</span>
                <span className="checkout__summary-tbd">Calculated next</span>
              </div>
              <div className="checkout__summary-row checkout__summary-row--total">
                <span>Estimated Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
