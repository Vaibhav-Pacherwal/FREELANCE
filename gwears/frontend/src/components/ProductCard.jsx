import { useNavigate } from "react-router-dom";
import { useWishlist } from "../utils/WishlistContext.jsx";
import { useUserAuth } from "../utils/UserAuthContext.jsx";
import { useSnackbar } from "../utils/SnackbarContext.jsx";
import { useState } from "react";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const { showSnackbar } = useSnackbar();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [wishlistLoading, setWishlistLoading] = useState(false);

  const activeVariant = product.variants?.find((variant) => variant.isActive) || product.variants?.[0];

  const wishlisted = isWishlisted(product._id);

  const handleProductClick = () => {
    navigate(`/products/${product._id}`);
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);
      const result = await toggleWishlist(product._id);

      if (!result.success) {
        showSnackbar(
          result.message || "Unable to update wishlist",
          "error"
        );
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  // Pricing & discount calculation
  const currentPrice = activeVariant?.price;
  const originalPrice = activeVariant?.originalPrice;
  const hasDiscount = originalPrice && originalPrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  // Stock check
  const isOutOfStock =
    product.variants?.length > 0 &&
    product.variants.every((v) => !v.isActive || v.stock === 0);

  const primaryImage = product.images?.[0];
  const secondaryImage = product.images?.[1];

  return (
    <div className="product-card" onClick={handleProductClick}>
      <div className="product-image-wrapper">
        {/* BADGES */}
        <div className="product-badge-group">
          {isOutOfStock ? (
            <span className="product-badge badge-out-of-stock">SOLD OUT</span>
          ) : hasDiscount ? (
            <span className="product-badge badge-discount">{discountPercent}% OFF</span>
          ) : null}
        </div>

        {/* IMAGES */}
        {primaryImage ? (
          <>
            <img
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              className="product-image"
              loading="lazy"
            />
            {secondaryImage && (
              <img
                src={secondaryImage.url}
                alt={secondaryImage.alt || `${product.name} alternate view`}
                className="product-image-hover"
                loading="lazy"
              />
            )}
          </>
        ) : (
          <div className="no-product-image">No Image</div>
        )}

        {/* WISHLIST BUTTON */}
        <button
          type="button"
          className={`wishlist-button ${wishlisted ? "wishlisted" : ""} ${
            wishlistLoading ? "wishlist-loading" : ""
          }`}
          onClick={handleWishlistClick}
          disabled={wishlistLoading}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          title={wishlisted ? "Saved in wishlist" : "Save to wishlist"}
        >
          <i className={`fa-${wishlisted ? "solid" : "regular"} fa-heart`}></i>
        </button>
      </div>

      <div className="product-info">
        <div>
          <p className="product-category">
            {product.category?.name || "MEN'S APPAREL"}
          </p>

          <h3 className="product-name" title={product.name}>
            {product.name}
          </h3>
        </div>

        <div className="product-price-row">
          {currentPrice != null ? (
            <>
              <span className="product-price">
                ₹{Number(currentPrice).toLocaleString("en-IN")}
              </span>
              {hasDiscount && (
                <>
                  <span className="product-original-price">
                    ₹{Number(originalPrice).toLocaleString("en-IN")}
                  </span>
                  <span className="product-discount-percent">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </>
          ) : (
            <span className="product-price" style={{ color: "#737373", fontSize: "0.85rem" }}>
              Price unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
}