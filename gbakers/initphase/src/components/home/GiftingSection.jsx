import { Link } from 'react-router-dom';
import './GiftingSection.css';

export default function GiftingSection() {
  return (
    <section className="gifting section" aria-label="Gifting & Celebrations">
      <div className="container">
        <div className="gifting__layout">
          {/* Image side */}
          <div className="gifting__visual">
            <div className="gifting__image-wrap">
              <img
                src="/images/gifting-box.jpg"
                alt="An elegant gift box of assorted pastries tied with a burgundy ribbon"
                className="gifting__image"
                loading="lazy"
              />
            </div>
            {/* Decorative offset frame */}
            <div className="gifting__frame-accent" aria-hidden="true" />
          </div>

          {/* Content side */}
          <div className="gifting__content">
            <span className="label label--gold">Bespoke Gifting</span>
            <h2 className="gifting__title">
              The Art of<br />
              <em>Giving Well</em>
            </h2>
            <p className="gifting__desc">
              Whether it&rsquo;s a curated box of artisan cookies, a towering
              celebration cake, or a selection of seasonal pastries&mdash;our
              gifting collection turns every occasion into a lasting memory.
            </p>

            <ul className="gifting__features">
              <li className="gifting__feature">
                <span className="gifting__feature-icon" aria-hidden="true">✦</span>
                <div>
                  <strong>Custom Curated Boxes</strong>
                  <p>Hand-picked assortments tailored to your celebration</p>
                </div>
              </li>
              <li className="gifting__feature">
                <span className="gifting__feature-icon" aria-hidden="true">✦</span>
                <div>
                  <strong>Bespoke Celebration Cakes</strong>
                  <p>Personalised designs for birthdays, anniversaries &amp; more</p>
                </div>
              </li>
              <li className="gifting__feature">
                <span className="gifting__feature-icon" aria-hidden="true">✦</span>
                <div>
                  <strong>Thoughtful Packaging</strong>
                  <p>Beautiful presentation worthy of the gift inside</p>
                </div>
              </li>
            </ul>

            <Link to="/shop" className="btn btn--primary">
              Explore Gifting
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
