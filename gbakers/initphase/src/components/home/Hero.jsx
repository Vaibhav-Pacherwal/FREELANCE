import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero" aria-label="Welcome to Gupta Bakers">
      <div className="hero__inner container">
        {/* Left: Typography-led content */}
        <div className="hero__content">
          <span className="hero__label label label--gold">
            Artisan Bakery
          </span>

          <h1 className="hero__title">
            <span className="hero__title-line">Baked with</span>
            <span className="hero__title-line hero__title-line--italic">Heritage</span>
          </h1>

          <p className="hero__subtitle">
            Where time-honoured recipes meet meticulous craft.
            Every creation from our ovens carries the warmth of
            tradition and the elegance of a fine patisserie.
          </p>

          <div className="hero__actions">
            <Link to="/shop" className="btn btn--primary">
              Explore the Collection
            </Link>
            <Link to="/shop/cakes" className="btn btn--ghost">
              Our Cakes
            </Link>
          </div>

          {/* Decorative detail */}
          <div className="hero__detail" aria-hidden="true">
            <span className="hero__detail-line" />
            <span className="hero__detail-text">Handcrafted Daily</span>
            <span className="hero__detail-line" />
          </div>
        </div>

        {/* Right: Editorial image composition */}
        <div className="hero__visual">
          <div className="hero__image-frame">
            <img
              src="/images/hero-cake.jpg"
              alt="A rich chocolate cake topped with berries, styled on vintage marble with brass accents"
              className="hero__image"
              loading="eager"
              fetchPriority="high"
            />
          </div>
          {/* Decorative border frame */}
          <div className="hero__frame-accent" aria-hidden="true" />
        </div>
      </div>

      {/* Bottom decorative rule */}
      <div className="hero__bottom-rule" aria-hidden="true">
        <span>✦</span>
        <span>Cakes</span>
        <span>✦</span>
        <span>Brownies</span>
        <span>✦</span>
        <span>Pastries</span>
        <span>✦</span>
        <span>Cookies</span>
        <span>✦</span>
      </div>
    </section>
  );
}
