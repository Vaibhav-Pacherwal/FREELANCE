import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { formatPrice } from '../data/products';
import { createPaymentOrder, verifyPayment, reverseGeocode } from '../services/api';
import {
  buildWhatsAppOrderMessage,
  BAKERY_WHATSAPP_PHONE,
  getDeliveryCoordinates,
} from '../utils/whatsapp';
import './CheckoutPage.css';

/**
 * CheckoutPage — Gupta Bakers
 *
 * Real Order Placement & Razorpay Payment Integration:
 *  1. Details   — Customer enters delivery details (name, phone, PIN, date, address, notes).
 *  2. Payment   — On submit, creates pending MongoDB order & Razorpay order via POST /api/payments/create-order.
 *                 Opens official Razorpay Checkout modal with the server-generated order ID & amount.
 *  3. Verify    — On payment callback, verifies HMAC-SHA256 signature via POST /api/payments/verify.
 *  4. Confirm   — Cart is cleared only after backend verification confirmation.
 *                 Shows verified order reference & customer-triggered WhatsApp dispatch link.
 */

// Today's date string (YYYY-MM-DD) in local time — used as min on date picker
function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Normalise phone input by extracting digits and stripping country prefix
function normalizePhone(val) {
  let digits = String(val || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  return digits;
}

// Ensure official Razorpay Checkout SDK is loaded
function loadRazorpaySdk() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && typeof window.Razorpay === 'function') {
      return resolve(true);
    }
    const existing = document.getElementById('razorpay-checkout-sdk');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { items, subtotal, itemCount, clearCart } = useCart();

  // 'details' | 'confirm'
  const [step, setStep] = useState('details');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    pincode: '',
    date: '',
    address: '',
    notes: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [paymentError, setPaymentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Snapshot of confirmed order details populated only after backend verification
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Geolocation & reverse-geocoding state
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null); // { type: 'success' | 'info' | 'error', message: string } | null
  const [confirmedCoordinates, setConfirmedCoordinates] = useState(null); // { latitude: number, longitude: number } | null

  // Guard ref to prevent repeat / duplicate submissions
  const submissionInProgressRef = useRef(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (paymentError) {
      setPaymentError('');
    }
  };

  const handleUseCurrentLocation = () => {
    if (isLocating || isSubmitting || isVerifying) return;

    if (!('geolocation' in navigator)) {
      setLocationStatus({
        type: 'error',
        message: 'Geolocation is not supported by your browser. Please enter your address manually.',
      });
      return;
    }

    setIsLocating(true);
    setLocationStatus({
      type: 'info',
      message: 'Requesting device location permission...',
    });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          setLocationStatus({
            type: 'info',
            message: 'Looking up address for your location...',
          });

          const geoData = await reverseGeocode(latitude, longitude);

          // Autofill address and PIN code
          setForm((prev) => ({
            ...prev,
            address: geoData.formattedAddress || prev.address,
            pincode: geoData.pincode || prev.pincode,
          }));

          // Clear field errors for populated fields
          setFieldErrors((prev) => ({
            ...prev,
            address: '',
            ...(geoData.pincode ? { pincode: '' } : {}),
          }));

          setConfirmedCoordinates({ latitude, longitude });

          setLocationStatus({
            type: 'success',
            message: 'Location detected. Please review house/flat number and landmark.',
          });
        } catch (err) {
          setLocationStatus({
            type: 'error',
            message: err.message || 'Could not retrieve address automatically. Please enter your address manually.',
          });
        } finally {
          setIsLocating(false);
        }
      },
      (geoErr) => {
        setIsLocating(false);
        let msg = 'Could not retrieve your location. Please enter your delivery address manually.';
        if (geoErr.code === 1) {
          msg = 'Location permission was denied. You can enter your delivery address manually below.';
        } else if (geoErr.code === 2) {
          msg = 'Location information is currently unavailable. Please enter your address manually.';
        } else if (geoErr.code === 3) {
          msg = 'Location request timed out. Please enter your delivery address manually.';
        }
        setLocationStatus({
          type: 'error',
          message: msg,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submissionInProgressRef.current || isSubmitting || isVerifying) {
      return;
    }

    const errors = {};

    if (!form.name.trim()) {
      errors.name = 'Please enter your full name.';
    }

    const digits = normalizePhone(form.phone);
    if (!form.phone.trim()) {
      errors.phone = 'Please enter your mobile number.';
    } else if (!/^[6-9]\d{9}$/.test(digits)) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number (e.g. 98765 43210).';
    }

    if (!form.pincode.trim()) {
      errors.pincode = 'Please enter your delivery PIN code.';
    } else if (!/^\d{6}$/.test(form.pincode.trim())) {
      errors.pincode = 'Please enter a valid 6-digit delivery PIN code.';
    }

    if (!form.date) {
      errors.date = 'Please select a preferred delivery date.';
    } else if (form.date < todayISO()) {
      errors.date = 'Delivery date cannot be in the past.';
    }

    if (!form.address.trim()) {
      errors.address = 'Please enter your full delivery address.';
    } else if (form.address.trim().length < 5) {
      errors.address = 'Please provide a complete street/house address.';
    }

    if (items.length === 0) {
      setPaymentError('Your cart is empty. Please add items from our shop before checking out.');
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setPaymentError('');
    setIsSubmitting(true);
    submissionInProgressRef.current = true;

    try {
      // ── 1. Format order payload ──────────────────────────────────────────
      // Build full delivery address with PIN, date, and notes to satisfy schema & persistence
      const fullDeliveryAddress = `${form.address.trim()}, PIN: ${form.pincode.trim()} | Delivery Date: ${form.date}${
        form.notes.trim() ? ` | Notes: ${form.notes.trim()}` : ''
      }`;

      // Validate that all cart items have genuine MongoDB ObjectIds
      for (const item of items) {
        const prodId = String(item.product?._id || item.product?.id || '');
        if (!/^[0-9a-fA-F]{24}$/.test(prodId)) {
          setPaymentError(`Cart item "${item.product?.name || 'Item'}" has an invalid product reference. Please clear your cart and re-add from our shop.`);
          submissionInProgressRef.current = false;
          setIsSubmitting(false);
          return;
        }
      }

      const orderPayloadItems = items.map((item) => {
        const prodId = item.product._id || item.product.id;
        const payloadItem = {
          productId: String(prodId),
          quantity: Number(item.quantity),
        };
        if (item.variant?.label && item.variant.label !== 'Standard') {
          payloadItem.variantLabel = item.variant.label;
        }
        return payloadItem;
      });

      // ── 2. Create pending order on backend & Razorpay order ───────────────
      const paymentOrderData = await createPaymentOrder({
        customerName: form.name.trim(),
        customerPhone: digits,
        deliveryAddress: fullDeliveryAddress,
        items: orderPayloadItems,
        ...(confirmedCoordinates ? { deliveryCoordinates: confirmedCoordinates } : {}),
      });

      const { orderId, razorpayOrderId, totalPaise, totalRupees, keyId, currency } = paymentOrderData;

      // ── 3. Ensure Razorpay Checkout SDK is ready ─────────────────────────
      const sdkReady = await loadRazorpaySdk();
      if (!sdkReady || typeof window.Razorpay !== 'function') {
        throw new Error('Unable to load Razorpay payment gateway. Please check your internet connection.');
      }

      // ── 4. Open Razorpay Checkout modal ──────────────────────────────────
      const options = {
        key: keyId,
        amount: totalPaise,
        currency: currency || 'INR',
        name: 'Gupta Bakers',
        description: `Order #${String(orderId).slice(-6).toUpperCase()}`,
        order_id: razorpayOrderId,
        prefill: {
          name: form.name.trim(),
          contact: `+91${digits}`,
        },
        theme: {
          color: '#b8954f', // Brand artisan gold
        },
        modal: {
          ondismiss: () => {
            submissionInProgressRef.current = false;
            setIsSubmitting(false);
            setPaymentError('Payment window was closed before completing payment. You can try again whenever ready.');
          },
        },
        handler: async (response) => {
          // Response received from Razorpay after customer authorization
          try {
            setIsVerifying(true);

            // ── 5. Server-side payment signature verification ─────────────────
            // Never trust frontend callbacks alone — verify HMAC-SHA256 on backend
            const verifyResult = await verifyPayment({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyResult?.paymentStatus === 'paid' || verifyResult?.orderStatus === 'confirmed') {
              // Capture cart snapshot before clearing
              const itemsSnapshot = [...items];

              // ── 6. Clear cart & show confirmation ─────────────────────────
              clearCart();

              setConfirmedOrder({
                orderId: verifyResult.orderId || orderId,
                paymentId: response.razorpay_payment_id,
                totalRupees: totalRupees,
                name: form.name.trim(),
                phone: digits,
                address: form.address.trim(),
                pincode: form.pincode.trim(),
                date: form.date,
                notes: form.notes.trim(),
                coordinates: confirmedCoordinates,
                deliveryCoordinates: confirmedCoordinates,
                itemCount,
                items: itemsSnapshot,
              });

              setStep('confirm');
            } else {
              setPaymentError(
                `Payment verification could not be confirmed. If amount was deducted, please quote Payment ID: ${response.razorpay_payment_id}`
              );
            }
          } catch (verifyErr) {
            setPaymentError(
              verifyErr.message ||
                `Payment verification failed. If amount was deducted, please quote Payment ID: ${response.razorpay_payment_id}`
            );
          } finally {
            submissionInProgressRef.current = false;
            setIsSubmitting(false);
            setIsVerifying(false);
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', (failedResponse) => {
        submissionInProgressRef.current = false;
        setIsSubmitting(false);
        const reason = failedResponse?.error?.description || 'Payment was declined or failed. Please try again.';
        setPaymentError(reason);
      });

      razorpayInstance.open();
    } catch (err) {
      submissionInProgressRef.current = false;
      setIsSubmitting(false);
      setPaymentError(err.message || 'Failed to initiate payment. Please try again.');
    }
  };

  // ── Empty cart screen ──────────────────────────────────────────────────────
  if (items.length === 0 && step !== 'confirm') {
    return (
      <div className="checkout section">
        <div className="container checkout__empty">
          <h1>Checkout</h1>
          <p>Your cart is empty. Add some handcrafted bakery items before checking out.</p>
          <Link to="/shop" className="btn btn--primary">Browse Shop</Link>
        </div>
      </div>
    );
  }

  // ── Confirmation screen ────────────────────────────────────────────────────
  if (step === 'confirm' && confirmedOrder) {
    const formattedPhone = confirmedOrder.phone.startsWith('+')
      ? confirmedOrder.phone
      : `+91 ${confirmedOrder.phone}`;
    const orderRef = String(confirmedOrder.orderId).slice(-6).toUpperCase();

    // Customer-triggered prefilled WhatsApp message to bakery support
    const whatsappMessage = encodeURIComponent(
      buildWhatsAppOrderMessage(confirmedOrder)
    );
    const confirmedCoords = getDeliveryCoordinates(confirmedOrder);

    return (
      <div className="checkout section">
        <div className="container checkout__confirmation">
          <div className="checkout__confirmation-icon" aria-hidden="true">✦</div>
          
          <div className="checkout__status-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Payment Verified & Order Confirmed</span>
          </div>

          <h1 className="checkout__confirmation-title">Thank You for Your Order!</h1>
          
          <p className="checkout__confirmation-note">
            Your order <strong>#{orderRef}</strong> has been successfully placed and payment verified via Razorpay.
            Our bakers are now preparing your treats with care.
          </p>

          {/* Customer-Triggered WhatsApp Link Card */}
          <div className="checkout__whatsapp-card">
            <div className="checkout__whatsapp-card-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <div>
                <strong>Send Order Reference on WhatsApp</strong>
                <p>Connect directly with Gupta Bakers (+91 {BAKERY_WHATSAPP_PHONE.slice(2)}) for priority delivery dispatch.</p>
              </div>
            </div>
            
            <a
              href={`https://wa.me/${BAKERY_WHATSAPP_PHONE}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--whatsapp"
            >
              Share Order on WhatsApp
            </a>

            <p className="checkout__whatsapp-disclaimer">
              Clicking above opens WhatsApp with your order details prefilled for immediate coordination with our team.
            </p>
          </div>

          {/* Order Details Breakdown */}
          <div className="checkout__confirmation-details">
            <p><strong>Order ID:</strong> #{orderRef} ({confirmedOrder.orderId})</p>
            <p><strong>Payment Reference:</strong> {confirmedOrder.paymentId}</p>
            <p><strong>Amount Paid:</strong> ₹{confirmedOrder.totalRupees}</p>
            <p><strong>Customer Name:</strong> {confirmedOrder.name}</p>
            <p><strong>Customer Phone:</strong> {formattedPhone}</p>
            <p><strong>Delivery PIN:</strong> {confirmedOrder.pincode}</p>
            <p><strong>Preferred Delivery Date:</strong> {confirmedOrder.date}</p>
            <p><strong>Delivery Address:</strong> {confirmedOrder.address}</p>
            {confirmedCoords && (
              <p className="checkout__coords-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                <span>
                  GPS coordinates confirmed with order: {confirmedCoords.latitude.toFixed(4)}, {confirmedCoords.longitude.toFixed(4)}{' '}
                  (
                  <a
                    href={`https://www.google.com/maps?q=${confirmedCoords.latitude},${confirmedCoords.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--gold, #b8954f)', textDecoration: 'underline' }}
                  >
                    View on Google Maps
                  </a>
                  )
                </span>
              </p>
            )}
            {confirmedOrder.notes && <p><strong>Special Instructions:</strong> {confirmedOrder.notes}</p>}
            
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: 'var(--border-fine)' }}>
              <strong>Items Ordered ({confirmedOrder.itemCount}):</strong>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
                {confirmedOrder.items.map((it) => (
                  <li key={it.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                    <span>{it.product.name} ({it.variant.label}) × {it.quantity}</span>
                    <span>{formatPrice(it.variant.price * it.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="checkout__confirmation-actions">
            <Link to="/" className="btn btn--primary">Back to Home</Link>
            <Link to="/shop" className="btn btn--ghost">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Delivery details form (step === 'details') ──────────────────────────────
  const isBusy = isSubmitting || isVerifying;

  return (
    <div className="checkout">
      {/* Header */}
      <div className="checkout__hero section--cream">
        <div className="container">
          <span className="label label--gold">Checkout</span>
          <h1 className="checkout__title">Delivery & Payment</h1>
        </div>
      </div>

      <div className="container checkout__main">
        <div className="checkout__layout">
          <div>
            {/* Global payment / submission error banner */}
            {paymentError && (
              <div className="checkout__payment-error" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{paymentError}</span>
              </div>
            )}

            {/* Form */}
            <form className="checkout__form" onSubmit={handleSubmit} noValidate>
              <fieldset className="checkout__fieldset" disabled={isBusy}>
                <legend className="checkout__legend">Customer & Delivery Information</legend>

                {/* Name field */}
                <div className="checkout__field">
                  <label htmlFor="checkout-name" className="checkout__label">
                    Full Name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text"
                    id="checkout-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="checkout__input"
                    placeholder="e.g. Priyanshu Sharma"
                    required
                    disabled={isBusy}
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={fieldErrors.name ? 'checkout-name-error' : undefined}
                  />
                  {fieldErrors.name && (
                    <span id="checkout-name-error" className="checkout__field-error" role="alert">
                      {fieldErrors.name}
                    </span>
                  )}
                </div>

                {/* Phone field with Indian mobile validation */}
                <div className="checkout__field">
                  <label htmlFor="checkout-phone" className="checkout__label">
                    Mobile Number <span aria-hidden="true">*</span>
                  </label>
                  <div className="checkout__phone-group">
                    <span className="checkout__phone-prefix" aria-hidden="true">+91</span>
                    <input
                      type="tel"
                      id="checkout-phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="checkout__input checkout__phone-input"
                      placeholder="98765 43210"
                      maxLength={15}
                      autoComplete="tel-national"
                      inputMode="numeric"
                      required
                      disabled={isBusy}
                      aria-invalid={Boolean(fieldErrors.phone)}
                      aria-describedby={fieldErrors.phone ? 'checkout-phone-error' : 'checkout-phone-hint'}
                    />
                  </div>
                  {fieldErrors.phone ? (
                    <span id="checkout-phone-error" className="checkout__field-error" role="alert">
                      {fieldErrors.phone}
                    </span>
                  ) : (
                    <span id="checkout-phone-hint" className="checkout__field-hint">
                      10-digit Indian mobile number for delivery updates
                    </span>
                  )}
                </div>

                {/* Row: PIN Code + Delivery Date */}
                <div className="checkout__row">
                  <div className="checkout__field">
                    <label htmlFor="checkout-pincode" className="checkout__label">
                      Delivery PIN Code <span aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text"
                      id="checkout-pincode"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      className="checkout__input"
                      placeholder="6-digit PIN"
                      maxLength={6}
                      inputMode="numeric"
                      required
                      disabled={isBusy}
                      aria-invalid={Boolean(fieldErrors.pincode)}
                      aria-describedby={fieldErrors.pincode ? 'checkout-pincode-error' : undefined}
                    />
                    {fieldErrors.pincode && (
                      <span id="checkout-pincode-error" className="checkout__field-error" role="alert">
                        {fieldErrors.pincode}
                      </span>
                    )}
                  </div>

                  <div className="checkout__field">
                    <label htmlFor="checkout-date" className="checkout__label">
                      Preferred Delivery Date <span aria-hidden="true">*</span>
                    </label>
                    <input
                      type="date"
                      id="checkout-date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      className="checkout__input"
                      min={todayISO()}
                      required
                      disabled={isBusy}
                      aria-invalid={Boolean(fieldErrors.date)}
                      aria-describedby={fieldErrors.date ? 'checkout-date-error' : undefined}
                    />
                    {fieldErrors.date && (
                      <span id="checkout-date-error" className="checkout__field-error" role="alert">
                        {fieldErrors.date}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="checkout__field">
                  <div className="checkout__field-header">
                    <label htmlFor="checkout-address" className="checkout__label">
                      Delivery Address <span aria-hidden="true">*</span>
                    </label>
                    <button
                      type="button"
                      id="checkout-use-location-btn"
                      className="checkout__location-btn"
                      onClick={handleUseCurrentLocation}
                      disabled={isLocating || isBusy}
                      aria-label="Use my current location to autofill delivery address"
                    >
                      {isLocating ? (
                        <>
                          <span className="checkout__location-spinner" aria-hidden="true" />
                          <span>Locating...</span>
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polygon points="3 11 22 2 13 21 11 13 3 11" />
                          </svg>
                          <span>Use My Current Location</span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    id="checkout-address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="checkout__input checkout__textarea"
                    placeholder="House / Flat No., Street, Landmark, Area"
                    rows={3}
                    required
                    disabled={isBusy}
                    aria-invalid={Boolean(fieldErrors.address)}
                    aria-describedby={fieldErrors.address ? 'checkout-address-error' : undefined}
                  />

                  {/* Geolocation status notice (success, info, or failure) */}
                  {locationStatus && (
                    <div
                      className={`checkout__location-notice checkout__location-notice--${locationStatus.type}`}
                      role="status"
                      aria-live="polite"
                    >
                      {locationStatus.type === 'success' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {locationStatus.type === 'error' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      )}
                      {locationStatus.type === 'info' && (
                        <span className="checkout__location-spinner checkout__location-spinner--small" aria-hidden="true" />
                      )}
                      <span>{locationStatus.message}</span>
                    </div>
                  )}

                  {fieldErrors.address && (
                    <span id="checkout-address-error" className="checkout__field-error" role="alert">
                      {fieldErrors.address}
                    </span>
                  )}
                </div>

                {/* Special Instructions */}
                <div className="checkout__field">
                  <label htmlFor="checkout-notes" className="checkout__label">
                    Special Instructions <span>(optional)</span>
                  </label>
                  <textarea
                    id="checkout-notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    className="checkout__input checkout__textarea"
                    placeholder="Cake message, allergen notes, delivery instructions, etc."
                    rows={2}
                    disabled={isBusy}
                  />
                </div>
              </fieldset>

              {/* Payment Section (Razorpay) */}
              <fieldset className="checkout__fieldset" disabled={isBusy}>
                <legend className="checkout__legend">Payment Method</legend>
                <div className="checkout__payment-info">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  <div>
                    <strong>Secure Online Payment (Razorpay)</strong>
                    <p>Pay securely using UPI, Credit/Debit Cards, Netbanking, or Wallets.</p>
                  </div>
                </div>
              </fieldset>

              <button
                type="submit"
                className="btn btn--primary checkout__submit"
                disabled={isBusy}
              >
                {isVerifying ? (
                  <>
                    <span className="checkout__spinner" aria-hidden="true" />
                    Verifying Payment…
                  </>
                ) : isSubmitting ? (
                  <>
                    <span className="checkout__spinner" aria-hidden="true" />
                    Connecting to Razorpay…
                  </>
                ) : (
                  `Pay ${formatPrice(subtotal)} via Razorpay`
                )}
              </button>
            </form>
          </div>

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
                <span className="checkout__summary-tbd">Calculated at payment</span>
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
