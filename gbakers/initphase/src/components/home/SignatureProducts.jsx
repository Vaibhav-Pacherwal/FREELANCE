import { useState } from 'react';
import { useCart } from '../../context/useCart';
import { getBestsellers, formatPrice } from '../../data/products';
import './SignatureProducts.css';

export default function SignatureProducts() {
  const bestsellers = getBestsellers();
  const { addItem } = useCart();

  return (
    <section className="signatures section--lg section--cream" aria-label="Signature Products">
      <div className="container">
        <div className="signatures__header">
          <div className="signatures__header-text">
            <span className="label label--gold">Bestsellers</span>
            <h2>Our Signature<br /><em>Selection</em></h2>
          </div>
          <p className="signatures__header-desc">
            The creations our patrons return for, time after time.
            Each one crafted with the finest ingredients and unwavering attention.
          </p>
        </div>

        <div className="signatures__grid">
          {bestsellers.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              onAddToCart={addItem}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, onAddToCart }) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const variant = product.variants[selectedVariant];

  const handleAdd = () => {
    onAddToCart(product, variant, 1);
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 1200);
  };

  return (
    <article className={`product-card product-card--sig`}>
      <div className="product-card__image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-card__image"
          loading="lazy"
        />
        {product.tags.includes('bestseller') && (
          <span className="product-card__badge">Bestseller</span>
        )}
      </div>

      <div className="product-card__body">
        <span className="product-card__category label">{product.category}</span>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__desc">{product.description}</p>

        {/* Variants */}
        {product.variants.length > 1 && (
          <div className="product-card__variants">
            {product.variants.map((v, i) => (
              <button
                key={v.label}
                className={`product-card__variant${i === selectedVariant ? ' active' : ''}`}
                onClick={() => setSelectedVariant(i)}
                aria-pressed={i === selectedVariant}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        <div className="product-card__footer">
          <span className="product-card__price">{formatPrice(variant.price)}</span>
          <button
            className={`btn btn--primary btn--small product-card__add${isAdding ? ' added' : ''}`}
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
