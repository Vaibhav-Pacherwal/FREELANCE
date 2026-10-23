import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { products, categories, formatPrice } from '../data/products';
import './CataloguePage.css';

export default function CataloguePage() {
  const { category: categoryParam } = useParams();
  const { addItem } = useCart();

  const activeCategory = categoryParam || 'all';

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

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

        {/* Product grid */}
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
