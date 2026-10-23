import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/useCart';
import { formatPrice } from '../../data/products';
import './CartDrawer.css';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    itemCount,
    subtotal,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  /* Lock body scroll when cart is open */
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('cart-open');
    } else {
      document.body.classList.remove('cart-open');
    }
    return () => document.body.classList.remove('cart-open');
  }, [isOpen]);

  /* Close on Escape */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) closeCart();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="cart-overlay"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`cart-drawer${isOpen ? ' cart-drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="cart-drawer__header">
          <div className="cart-drawer__title-row">
            <h2 className="cart-drawer__title">Your Cart</h2>
            <span className="cart-drawer__count label">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          </div>
          <button
            className="cart-drawer__close"
            onClick={closeCart}
            aria-label="Close cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <p className="cart-drawer__empty-title">Your cart is empty</p>
              <p className="cart-drawer__empty-desc">
                Discover our handcrafted collection and add something special.
              </p>
              <Link to="/shop" className="btn btn--primary" onClick={closeCart}>
                Browse Shop
              </Link>
            </div>
          ) : (
            <ul className="cart-drawer__items">
              {items.map((item) => (
                <li key={item.key} className="cart-item">
                  <div className="cart-item__image-wrap">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="cart-item__image"
                    />
                  </div>
                  <div className="cart-item__details">
                    <h4 className="cart-item__name">{item.product.name}</h4>
                    <span className="cart-item__variant label">{item.variant.label}</span>
                    <div className="cart-item__controls">
                      <div className="cart-item__qty">
                        <button
                          className="cart-item__qty-btn"
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="cart-item__qty-value">{item.quantity}</span>
                        <button
                          className="cart-item__qty-btn"
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="cart-item__price">
                        {formatPrice(item.variant.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="cart-item__remove"
                    onClick={() => removeItem(item.key)}
                    aria-label={`Remove ${item.product.name}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__subtotal">
              <span>Subtotal</span>
              <span className="cart-drawer__subtotal-value">{formatPrice(subtotal)}</span>
            </div>
            <p className="cart-drawer__note">Delivery charges calculated at checkout</p>
            <Link
              to="/checkout"
              className="btn btn--primary cart-drawer__checkout-btn"
              onClick={closeCart}
            >
              Proceed to Checkout
            </Link>
            <button
              className="cart-drawer__clear"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
