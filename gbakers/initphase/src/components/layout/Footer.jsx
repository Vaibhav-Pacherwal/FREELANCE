import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      {/* Decorative typography band */}
      <div className="footer__brand-band">
        <span className="footer__brand-word">Indulgence</span>
      </div>

      <div className="footer__main">
        <div className="container footer__grid">
          {/* Brand column */}
          <div className="footer__col footer__col--brand">
            <div className="footer__wordmark">
              <span className="footer__wordmark-top">Gupta</span>
              <span className="footer__wordmark-bottom">BAKERS</span>
            </div>
            <p className="footer__tagline">
              Crafted with care, served with warmth.
              Every bite tells our story.
            </p>
          </div>

          {/* Shop links */}
          <div className="footer__col">
            <h4 className="footer__heading">Shop</h4>
            <ul className="footer__links">
              <li><Link to="/shop/cakes">Cakes</Link></li>
              <li><Link to="/shop/brownies">Brownies</Link></li>
              <li><Link to="/shop/pastries">Pastries</Link></li>
              <li><Link to="/shop/cookies">Cookies</Link></li>
              <li><Link to="/shop">All Products</Link></li>
            </ul>
          </div>

          {/* Info links */}
          <div className="footer__col">
            <h4 className="footer__heading">Information</h4>
            <ul className="footer__links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#faq">FAQs</a></li>
              <li><a href="#delivery">Delivery Policy</a></li>
            </ul>
          </div>

          {/* Contact / Hours */}
          <div className="footer__col">
            <h4 className="footer__heading">Visit Us</h4>
            <div className="footer__contact">
              <p className="footer__detail">
                {/* Replace with actual address */}
                <span className="footer__detail-label">Address</span>
                Store address to be updated
              </p>
              <p className="footer__detail">
                {/* Replace with actual hours */}
                <span className="footer__detail-label">Hours</span>
                Mon – Sun · 9 AM – 9 PM
              </p>
              <p className="footer__detail">
                {/* Replace with actual phone */}
                <span className="footer__detail-label">Phone</span>
                +91 9810945356
              </p>
            </div>

            {/* Social links — replace # with actual URLs */}
            <div className="footer__social">
              <a href="#instagram" className="footer__social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
              <a href="#facebook" className="footer__social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </a>
              <a href="#whatsapp" className="footer__social-link" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copyright">
            © {new Date().getFullYear()} Gupta Bakers. All rights reserved.
          </p>
          <div className="footer__legal">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
