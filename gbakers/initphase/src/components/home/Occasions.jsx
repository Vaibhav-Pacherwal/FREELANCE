import { Link } from 'react-router-dom';
import { occasions } from '../../data/products';
import './Occasions.css';

export default function Occasions() {
  return (
    <section className="occasions section" aria-label="Shop by Occasion">
      <div className="container">
        <div className="occasions__layout">
          {/* Left: Editorial typography */}
          <div className="occasions__intro">
            <span className="label label--gold">For Every Moment</span>
            <h2 className="occasions__title">
              Celebrations<br />
              Deserve<br />
              <em>Something Special</em>
            </h2>
            <p className="occasions__desc">
              From intimate gatherings to grand celebrations,
              find the perfect sweet centrepiece for every occasion.
            </p>
            <Link to="/shop" className="btn btn--secondary">
              Browse All
            </Link>
          </div>

          {/* Right: Staggered occasion cards */}
          <div className="occasions__cards">
            {occasions.map((occ, i) => (
              <Link
                key={occ.id}
                to="/shop"
                className={`occasions__card occasions__card--${i % 2 === 0 ? 'left' : 'right'}`}
              >
                <span className="occasions__card-icon" aria-hidden="true">{occ.icon}</span>
                <div className="occasions__card-content">
                  <h4 className="occasions__card-name">{occ.name}</h4>
                  <p className="occasions__card-tagline">{occ.tagline}</p>
                </div>
                <svg className="occasions__card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
