import { Link } from 'react-router-dom';
import { categories } from '../../data/products';
import './Categories.css';

export default function Categories() {
  return (
    <section className="categories section" aria-label="Product Categories">
      <div className="container">
        <div className="section-header section-header--center">
          <span className="label label--oxblood">Our Collection</span>
          <h2>Crafted for Every Craving</h2>
        </div>

        {/* Asymmetric category grid — 2 large + 2 standard */}
        <div className="categories__grid">
          {categories.map((cat, index) => (
            <Link
              key={cat.id}
              to={`/shop/${cat.id}`}
              className={`categories__card categories__card--${index === 0 ? 'featured' : index === 3 ? 'wide' : 'standard'}`}
            >
              <div className="categories__image-wrap">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="categories__image"
                  loading="lazy"
                />
              </div>
              <div className="categories__info">
                <h3 className="categories__name">{cat.name}</h3>
                <p className="categories__desc">{cat.description}</p>
                <span className="categories__link-text label">
                  Explore
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
