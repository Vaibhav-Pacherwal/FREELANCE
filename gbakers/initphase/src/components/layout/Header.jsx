import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/useCart';
import './Header.css';

export default function Header() {
  const { itemCount, toggleCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Close mobile nav on route change */
  const currentPath = location.pathname;
  useEffect(() => {
    return () => {
      setMobileOpen(false);
    };
  }, [currentPath]);

  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}`} role="banner">
      <div className="header__inner container">
        {/* Mobile menu toggle */}
        <button
          className="header__hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span className={`header__hamburger-line${mobileOpen ? ' open' : ''}`} />
        </button>

        {/* Wordmark */}
        <Link to="/" className="header__wordmark" aria-label="Gupta Bakers — Home">
          <span className="header__wordmark-top">Gupta</span>
          <span className="header__wordmark-bottom">BAKERS</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={`header__nav${mobileOpen ? ' header__nav--open' : ''}`} role="navigation" aria-label="Main navigation">
          <ul className="header__nav-list">
            <li>
              <Link to="/shop" className="header__nav-link">Shop All</Link>
            </li>
            <li>
              <Link to="/shop/cakes" className="header__nav-link">Cakes</Link>
            </li>
            <li>
              <Link to="/shop/brownies" className="header__nav-link">Brownies</Link>
            </li>
            <li>
              <Link to="/shop/pastries" className="header__nav-link">Pastries</Link>
            </li>
            <li>
              <Link to="/shop/cookies" className="header__nav-link">Cookies</Link>
            </li>
          </ul>
        </nav>

        {/* Actions */}
        <div className="header__actions">
          <button
            className="header__cart-btn"
            onClick={toggleCart}
            aria-label={`Shopping cart, ${itemCount} items`}
          >
            {/* Cart icon — SVG */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {itemCount > 0 && (
              <span className="header__cart-count">{itemCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div
          className="header__overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
