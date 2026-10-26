import { useState, useEffect, useReducer, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { categories, formatPrice } from '../data/products';
import { fetchProducts } from '../services/api';
import { mapProducts } from '../services/productMapper';
import './CataloguePage.css';

// ── Category filter config (UI-side; maps UI slug → backend category value) ─
// Backend enum is singular: cake | bread | pastry | cookie | snack | other
// Frontend routes use plural slugs: cakes | brownies | pastries | cookies
const CATEGORY_SLUG_TO_BACKEND = {
  cakes:    'cake',
  brownies: 'snack',   // brownies map to the closest backend category
  pastries: 'pastry',
  cookies:  'cookie',
};

// ── Fetch state machine (avoids multiple synchronous setState calls in effects) ─
const FETCH_INIT    = 'FETCH_INIT';
const FETCH_SUCCESS = 'FETCH_SUCCESS';
const FETCH_ERROR   = 'FETCH_ERROR';

const initialFetchState = { products: [], loading: true, error: null };

function fetchReducer(state, action) {
  switch (action.type) {
    case FETCH_INIT:    return { ...state, loading: true,  error: null };
    case FETCH_SUCCESS: return { products: action.data, loading: false, error: null };
    case FETCH_ERROR:   return { ...state, loading: false, error: action.error };
    default:            return state;
  }
}

export default function CataloguePage() {
  const { category: categoryParam } = useParams();
  const { addItem } = useCart();

  const [fetchState, dispatch] = useReducer(fetchReducer, initialFetchState);
  const { products, loading, error } = fetchState;
  const [fetchKey, setFetchKey] = useState(0); // increment to retry

  const activeCategory = categoryParam || 'all';

  // Fetch products from the backend on mount (and on retry)
  useEffect(() => {
    let cancelled = false;
    dispatch({ type: FETCH_INIT });

    fetchProducts()
      .then((raw) => {
        if (!cancelled) dispatch({ type: FETCH_SUCCESS, data: mapProducts(raw) });
      })
      .catch((err) => {
        if (!cancelled) dispatch({ type: FETCH_ERROR, error: err.message });
      });

    return () => { cancelled = true; };
  }, [fetchKey]);

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return products;
    const backendCategory = CATEGORY_SLUG_TO_BACKEND[activeCategory];
    if (!backendCategory) return products;
    return products.filter((p) => p.category === backendCategory);
  }, [products, activeCategory]);

  const activeLabel =
    activeCategory === 'all'
      ? 'All Products'
      : categories.find((c) => c.id === activeCategory)?.name || 'Products';

  return (
    <div className="catalogue">
      {/* Page header */}
      <div className="catalogue__hero section--cream">
        <div className="container">
          <span className="label label--gold">Our Collection</span>
          <h1 className="catalogue__title">{activeLabel}</h1>
          <p className="catalogue__subtitle">
            {activeCategory === 'all'
              ? 'Browse our complete collection of handcrafted bakes'
              : categories.find((c) => c.id === activeCategory)?.description ||
                'Explore this collection'}
          </p>
        </div>
      </div>

      <div className="container catalogue__main">
        {/* Category filters */}
        <nav className="catalogue__filters" aria-label="Category filters">
          <Link
            to="/shop"
            className={`catalogue__filter${activeCategory === 'all' ? ' active' : ''}`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop/${cat.id}`}
              className={`catalogue__filter${activeCategory === cat.id ? ' active' : ''}`}
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Loading state */}
        {loading && (
          <div className="catalogue__grid" aria-busy="true" aria-label="Loading products">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="cat-card cat-card--skeleton" aria-hidden="true">
                <div className="cat-card__image-wrap" />
                <div className="cat-card__body">
                  <div className="cat-card__skeleton-line cat-card__skeleton-line--short" />
                  <div className="cat-card__skeleton-line" />
                  <div className="cat-card__skeleton-line cat-card__skeleton-line--medium" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="catalogue__error" role="alert">
            <p className="catalogue__error-msg">{error}</p>
            <button
              className="btn btn--ghost"
              onClick={() => setFetchKey((k) => k + 1)}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Product grid */}
        {!loading && !error && (
          <>
            <div className="catalogue__grid">
              {filtered.map((product) => (
                <CatalogueCard
                  key={product.id}
                  product={product}
                  onAddToCart={addItem}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="catalogue__empty">
                <p>No products found in this category.</p>
                <Link to="/shop" className="btn btn--ghost">View All Products</Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CatalogueCard({ product, onAddToCart }) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const variant = product.variants[selectedVariant];

  const handleAdd = () => {
    onAddToCart(product, variant, 1);
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 1200);
  };

  return (
    <article className="cat-card">
      <div className="cat-card__image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="cat-card__image"
          loading="lazy"
        />
        {product.tags.includes('bestseller') && (
          <span className="cat-card__badge">Bestseller</span>
        )}
      </div>

      <div className="cat-card__body">
        <span className="cat-card__category label">{product.category}</span>
        <h3 className="cat-card__name">{product.name}</h3>
        <p className="cat-card__desc">{product.description}</p>

        {product.variants.length > 1 && (
          <div className="cat-card__variants">
            {product.variants.map((v, i) => (
              <button
                key={v.label}
                className={`cat-card__variant${i === selectedVariant ? ' active' : ''}`}
                onClick={() => setSelectedVariant(i)}
                aria-pressed={i === selectedVariant}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        <div className="cat-card__footer">
          <span className="cat-card__price">{formatPrice(variant.price)}</span>
          <button
            className={`btn btn--primary btn--small cat-card__add${isAdding ? ' added' : ''}`}
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
          >
            {isAdding ? '✓ Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}
