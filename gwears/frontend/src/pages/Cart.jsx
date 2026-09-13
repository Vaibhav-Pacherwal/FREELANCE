import { useCart } from "../utils/CartContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import "./Cart.css";

export default function Cart() {
  const navigate = useNavigate();

  const {
    cart,
    loading,
    updateCartItem,
    removeCartItem,
    clearCart,
  } = useCart();

  if (loading) {
    return (
      <div className="gw-cart-page" style={{ textAlign: "center", padding: "8rem 1rem" }}>
        <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
        <p style={{ marginTop: "1rem", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.82rem", color: "#737373" }}>
          Retrieving your shopping bag...
        </p>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="gw-cart-page">
        <div className="gw-cart-empty">
          <i className="fa-solid fa-bag-shopping fa-3x"></i>
          <h2>Your Shopping Bag is Empty</h2>
          <p>
            Your private selection currently contains no pieces. Explore our latest atelier silhouettes and curated collections.
          </p>
          <button className="gw-btn gw-btn-primary" onClick={() => navigate("/products")}>
            DISCOVER CREATIONS
          </button>
        </div>
      </div>
    );
  }

  const getVariant = (item) => {
    return item.product?.variants?.find(
      (variant) => String(variant._id) === String(item.variantId)
    );
  };

  const handleIncrease = async (item) => {
    const variant = getVariant(item);
    if (!variant || item.quantity >= variant.stock) return;
    await updateCartItem(item._id, item.quantity + 1);
  };

  const handleDecrease = async (item) => {
    if (item.quantity <= 1) return;
    await updateCartItem(item._id, item.quantity - 1);
  };

  const handleRemove = async (itemId) => {
    await removeCartItem(itemId);
  };

  const handleClear = async () => {
    if (window.confirm("Are you sure you wish to empty your shopping bag?")) {
      await clearCart();
    }
  };

  // Subtotal directly from backend or fallback to calculation
  const subtotal =
    cart.subtotal != null
      ? cart.subtotal
      : cart.items.reduce((acc, item) => {
          const v = getVariant(item);
          const price = item.unitPrice || item.pricing?.finalPrice || v?.price || 0;
          return acc + price * item.quantity;
        }, 0);

  const totalItemsCount =
    cart.totalItems != null
      ? cart.totalItems
      : cart.items.reduce((acc, item) => acc + item.quantity, 0);

  // Complimentary delivery threshold at 1999
  const isFreeDelivery = subtotal >= 1999;
  const amountNeededForFree = 1999 - subtotal;

  return (
    <div className="gw-cart-page">
      <h1 className="gw-cart-title">SHOPPING BAG</h1>
      <p className="gw-cart-subtitle">
        {totalItemsCount} creation{totalItemsCount === 1 ? "" : "s"} reserved in your private bag
      </p>

      <div className="gw-cart-grid">
        {/* LEFT COLUMN: ITEM LIST */}
        <div className="gw-cart-items-wrap">
          <div className="gw-cart-items">
            {cart.items.map((item) => {
              const product = item.product;
              const variant = getVariant(item);

              if (!product || !variant) {
                return (
                  <div key={item._id} className="gw-cart-item">
                    <div style={{ gridColumn: "span 3", color: "#DC2626", fontSize: "0.9rem" }}>
                      This creation is no longer available in the archives.
                      <button
                        className="gw-cart-remove-btn"
                        style={{ marginLeft: "1rem" }}
                        onClick={() => handleRemove(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              }

              const imgUrl =
                product.images?.length > 0
                  ? product.images[0].url
                  : "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80";

              const unitPrice = item.unitPrice || item.pricing?.finalPrice || variant.price;
              const hasDiscount = item.pricing?.hasDiscount;
              const originalPrice = item.pricing?.originalPrice || variant.originalPrice;
              const lineTotal = item.subtotal || unitPrice * item.quantity;

              return (
                <div key={item._id} className="gw-cart-item">
                  {/* THUMBNAIL */}
                  <img
                    src={imgUrl}
                    alt={product.name}
                    className="gw-cart-item-img"
                    onClick={() => navigate(`/products/${product._id}`)}
                  />

                  {/* INFO */}
                  <div className="gw-cart-item-info">
                    <span className="gw-cart-item-cat">
                      {product.category?.name || "ATELIER"}
                    </span>
                    <h3
                      className="gw-cart-item-name"
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      {product.name}
                    </h3>

                    {/* ATTRIBUTES */}
                    <div className="gw-cart-item-attrs">
                      {variant.attributes?.map((attr) => (
                        <span key={attr.name} className="gw-cart-attr-badge">
                          {attr.name}: {attr.value}
                        </span>
                      ))}
                    </div>

                    {/* UNIT PRICING */}
                    <div className="gw-cart-item-pricing">
                      <span className="gw-cart-unit-price">
                        ₹{Number(unitPrice).toLocaleString("en-IN")}
                      </span>
                      {hasDiscount && originalPrice && (
                        <>
                          <span className="gw-cart-unit-orig">
                            ₹{Number(originalPrice).toLocaleString("en-IN")}
                          </span>
                          <span className="gw-cart-discount-tag">
                            OFFER APPLIED
                          </span>
                        </>
                      )}
                    </div>

                    {/* STEPPER & REMOVE */}
                    <div className="gw-cart-stepper-row">
                      <div className="gw-cart-stepper">
                        <button
                          type="button"
                          onClick={() => handleDecrease(item)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleIncrease(item)}
                          disabled={item.quantity >= variant.stock}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="gw-cart-remove-btn"
                        onClick={() => handleRemove(item._id)}
                      >
                        Remove
                      </button>
                    </div>

                    {variant.stock <= 3 && variant.stock > 0 && (
                      <p style={{ color: "#B45309", fontSize: "0.75rem", margin: "6px 0 0 0" }}>
                        Only {variant.stock} left in atelier
                      </p>
                    )}
                  </div>

                  {/* LINE TOTAL */}
                  <div className="gw-cart-item-total">
                    ₹{Number(lineTotal).toLocaleString("en-IN")}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="gw-cart-actions-bar">
            <Link to="/products" style={{ fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              &larr; Continue Exploring
            </Link>
            <button className="gw-cart-clear-btn" onClick={handleClear}>
              Empty Shopping Bag
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY */}
        <div className="gw-cart-summary">
          <h2 className="gw-cart-summary-title">ORDER SUMMARY</h2>

          <div className="gw-cart-summary-row">
            <span>Bag Subtotal ({totalItemsCount} items)</span>
            <span>₹{Number(subtotal).toLocaleString("en-IN")}</span>
          </div>

          <div className="gw-cart-summary-row">
            <span>Estimated Shipping</span>
            <span>{isFreeDelivery ? "Complimentary" : "₹149"}</span>
          </div>

          {!isFreeDelivery && (
            <p style={{ fontSize: "0.78rem", color: "#B45309", margin: "0 0 1rem 0" }}>
              Add ₹{Number(amountNeededForFree).toLocaleString("en-IN")} more for Complimentary Express Delivery.
            </p>
          )}

          <div className="gw-cart-summary-row total">
            <span>Total Payable</span>
            <span>
              ₹{Number(isFreeDelivery ? subtotal : subtotal + 149).toLocaleString("en-IN")}
            </span>
          </div>

          <button
            className="gw-cart-checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            PROCEED TO CHECKOUT
          </button>

          <div className="gw-cart-trust-block">
            <div className="gw-cart-trust-item">
              <i className="fa-solid fa-lock"></i>
              <span>256-Bit SSL Encrypted &amp; Secure Checkout</span>
            </div>
            <div className="gw-cart-trust-item">
              <i className="fa-solid fa-truck"></i>
              <span>Cash on Delivery (COD) Available Nationwide</span>
            </div>
            <div className="gw-cart-trust-item">
              <i className="fa-solid fa-rotate-left"></i>
              <span>30-Day Effortless Return &amp; Exchange Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}