import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../ApiEndpoints.js";
import { useCart } from "../utils/CartContext.jsx";
import { useUserAuth } from "../utils/UserAuthContext.jsx";
import { useSnackbar } from "../utils/SnackbarContext.jsx";
import { useWishlist } from "../utils/WishlistContext.jsx";
import ProductCard from "../components/ProductCard.jsx";
import "./ProductDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useUserAuth();
  const { addToCart } = useCart();
  const { showSnackbar } = useSnackbar();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [product, setProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Pincode checker state
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Accordion state
  const [openAccordions, setOpenAccordions] = useState({
    details: true,
    care: false,
    shipping: false,
  });

  const toggleAccordion = (section) => {
    setOpenAccordions((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API.storeProducts}/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch product");
      }

      const prod = data.product;
      setProduct(prod);
      setActiveImageIndex(0);

      // Auto-select first active variant options if available
      if (prod.options && prod.options.length > 0 && prod.variants && prod.variants.length > 0) {
        const firstActiveVariant = prod.variants.find((v) => v.isActive && v.stock > 0) || prod.variants[0];
        if (firstActiveVariant && firstActiveVariant.attributes) {
          const initialOptions = {};
          firstActiveVariant.attributes.forEach((attr) => {
            initialOptions[attr.name] = attr.value;
          });
          setSelectedOptions(initialOptions);
        }
      }

      // Fetch related products
      if (prod.category?._id) {
        try {
          const relRes = await fetch(`${API.storeProducts}?category=${prod.category._id}&limit=4`);
          const relData = await relRes.json();
          if (relRes.ok && relData.products) {
            setRelatedProducts(relData.products.filter((p) => p._id !== prod._id));
          }
        } catch (err) {
          // ignore related products error
        }
      }
    } catch (error) {
      console.error("Fetch product error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const selectedVariant = product?.variants?.find((variant) => {
    if (!variant.isActive) return false;
    return variant.attributes.every(
      (attribute) => selectedOptions[attribute.name] === attribute.value
    );
  });

  const allOptionsSelected =
    product?.options?.every((option) => selectedOptions[option.name]) ?? false;

  const handleOptionSelect = (optionName, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
    setQuantity(1);
    setCartMessage("");
  };

  const increaseQuantity = () => {
    if (!selectedVariant) return;
    if (quantity < selectedVariant.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const handleAddToCart = async () => {
    setCartMessage("");

    if (!user) {
      navigate("/login");
      return;
    }

    if (!allOptionsSelected) {
      setCartMessage("Please select your size and options");
      showSnackbar("Please select your size and options", "error");
      return;
    }

    if (!selectedVariant) {
      setCartMessage("Selected variant is unavailable");
      showSnackbar("Selected variant is unavailable", "error");
      return;
    }

    if (selectedVariant.stock < 1) {
      setCartMessage("This variant is sold out");
      showSnackbar("This variant is currently sold out", "error");
      return;
    }

    if (quantity > selectedVariant.stock) {
      setCartMessage(`Only ${selectedVariant.stock} item(s) in stock`);
      showSnackbar(`Only ${selectedVariant.stock} item(s) in stock`, "error");
      return;
    }

    try {
      setAddingToCart(true);
      const result = await addToCart(product._id, selectedVariant._id, quantity);

      if (result.success) {
        showSnackbar("Creation added to your shopping bag", "success");
        setCartMessage("Added to your shopping bag");
      } else {
        showSnackbar(result.message || "Unable to add to bag", "error");
        setCartMessage(result.message);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      showSnackbar("Failed to add item to bag", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);
      const res = await toggleWishlist(product._id);
      if (res.success) {
        showSnackbar(
          isWishlisted(product._id)
            ? "Removed from your private wishlist"
            : "Saved to your private wishlist",
          "success"
        );
      } else {
        showSnackbar(res.message || "Failed to update wishlist", "error");
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    const cleanPin = pincode.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setPincodeStatus({
        valid: false,
        message: "Please enter a valid 6-digit Indian postal code.",
      });
      return;
    }
    setPincodeStatus({
      valid: true,
      message: `Delivery available to ${cleanPin}. Estimated 2-4 business days via Express Courier & Secure Online Payment.`,
    });
  };

  if (loading) {
    return (
      <div className="gw-pdp" style={{ textAlign: "center", padding: "8rem 2rem" }}>
        <i className="fa-solid fa-circle-notch fa-spin fa-2x" style={{ color: "#111" }}></i>
        <p style={{ marginTop: "1rem", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.82rem" }}>
          Loading product details...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="gw-pdp" style={{ textAlign: "center", padding: "8rem 2rem" }}>
        <h2>Product Not Found</h2>
        <p style={{ color: "#737373", margin: "1rem 0 2rem 0" }}>
          {error || "The requested product is no longer available in our store."}
        </p>
        <button className="gw-btn gw-btn-primary" onClick={() => navigate("/products")}>
          EXPLORE CATALOG
        </button>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const mainImage = images[activeImageIndex] || {
    url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80",
    alt: product.name,
  };

  const wishlisted = isWishlisted(product._id);
  const activeVariantStock = selectedVariant ? selectedVariant.stock : 0;
  const isOutOfStock = selectedVariant && activeVariantStock < 1;
  const isLowStock = selectedVariant && activeVariantStock > 0 && activeVariantStock <= 3;

  return (
    <div className="gw-pdp">
      {/* BREADCRUMBS */}
      <nav className="gw-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Creations</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/products?category=${product.category._id}`}>
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="current">{product.name}</span>
      </nav>

      <div className="gw-pdp-grid">
        {/* LEFT: GALLERY COLUMN */}
        <div className="gw-pdp-gallery">
          {images.length > 1 && (
            <div className="gw-pdp-thumbs">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`gw-pdp-thumb ${idx === activeImageIndex ? "active" : ""}`}
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={img.url} alt={img.alt || `${product.name} thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}

          <div className="gw-pdp-main-image-wrap">
            <div className="gw-pdp-badge-wrap">
              {isOutOfStock && <span className="gw-pdp-badge">SOLD OUT</span>}
              {isLowStock && <span className="gw-pdp-badge gw-pdp-badge-gold">FEW REMAINING</span>}
              {product.category?.name && (
                <span className="gw-pdp-badge">{product.category.name}</span>
              )}
            </div>

            <img
              src={mainImage.url}
              alt={mainImage.alt || product.name}
              className="gw-pdp-main-img"
            />
          </div>
        </div>

        {/* RIGHT: DETAILS COLUMN */}
        <div className="gw-pdp-info">
          <span className="gw-pdp-category-tag">
            {product.category?.group?.toUpperCase() || "MEN'S COLLECTION"}
          </span>

          <h1 className="gw-pdp-title">{product.name}</h1>

          {/* PRICING */}
          <div className="gw-pdp-pricing">
            {selectedVariant ? (
              <>
                <span className="gw-pdp-price">
                  ₹{Number(selectedVariant.price).toLocaleString("en-IN")}
                </span>
                {selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.price && (
                  <>
                    <span className="gw-pdp-original-price">
                      ₹{Number(selectedVariant.originalPrice).toLocaleString("en-IN")}
                    </span>
                    <span className="gw-pdp-discount-badge">
                      SAVE {Math.round(((selectedVariant.originalPrice - selectedVariant.price) / selectedVariant.originalPrice) * 100)}%
                    </span>
                  </>
                )}
              </>
            ) : (
              <span className="gw-pdp-price" style={{ fontSize: "1.1rem", color: "#737373" }}>
                Select options to view price
              </span>
            )}
          </div>

          {/* VARIANT OPTIONS (e.g. Size, Color) */}
          {product.options && product.options.length > 0 && (
            <div className="gw-pdp-options-container">
              {product.options.map((option) => (
                <div key={option.name} className="gw-pdp-options-block">
                  <div className="gw-pdp-option-header">
                    <span className="gw-pdp-option-title">{option.name}</span>
                    <span className="gw-pdp-option-selected-val">
                      {selectedOptions[option.name] || "Please choose"}
                    </span>
                  </div>

                  <div className="gw-pdp-pills">
                    {option.values.map((val) => {
                      const isSelected = selectedOptions[option.name] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          className={`gw-pdp-pill ${isSelected ? "active" : ""}`}
                          onClick={() => handleOptionSelect(option.name, val)}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STOCK STATUS */}
          {allOptionsSelected && selectedVariant && (
            <div className="gw-pdp-stock">
              {isOutOfStock ? (
                <span className="gw-stock-out">
                  <i className="fa-solid fa-circle-xmark"></i> Currently Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="gw-stock-low">
                  <i className="fa-solid fa-triangle-exclamation"></i> Only {activeVariantStock} left in stock
                </span>
              ) : (
                <span className="gw-stock-in">
                  <i className="fa-solid fa-circle-check"></i> In Stock & Ready to Dispatch
                </span>
              )}
            </div>
          )}

          {/* ACTION BUTTONS & QUANTITY */}
          <div className="gw-pdp-action-row">
            {selectedVariant && activeVariantStock > 0 && (
              <div className="gw-pdp-qty-stepper">
                <button
                  type="button"
                  className="gw-pdp-qty-btn"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="gw-pdp-qty-val">{quantity}</span>
                <button
                  type="button"
                  className="gw-pdp-qty-btn"
                  onClick={increaseQuantity}
                  disabled={quantity >= activeVariantStock}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            )}

            <button
              type="button"
              className="gw-pdp-add-btn"
              onClick={handleAddToCart}
              disabled={addingToCart || !selectedVariant || isOutOfStock}
            >
              {addingToCart ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i> ADDING TO BAG...
                </>
              ) : isOutOfStock ? (
                "OUT OF STOCK"
              ) : (
                <>
                  <i className="fa-solid fa-bag-shopping"></i> ADD TO SHOPPING BAG
                </>
              )}
            </button>

            <button
              type="button"
              className={`gw-pdp-wish-btn ${wishlisted ? "active" : ""}`}
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              aria-label="Wishlist toggle"
            >
              <i className={`fa-${wishlisted ? "solid" : "regular"} fa-heart`}></i>
            </button>
          </div>

          {cartMessage && (
            <p style={{ color: "#15803D", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              {cartMessage}
            </p>
          )}

          {/* PINCODE ESTIMATOR */}
          <div className="gw-pdp-pincode-card">
            <div className="gw-pdp-pincode-title">
              <i className="fa-solid fa-truck-fast"></i> CHECK ESTIMATED DISPATCH
            </div>
            <form onSubmit={handlePincodeCheck} className="gw-pdp-pincode-form">
              <input
                type="text"
                placeholder="Enter 6-digit PIN code"
                value={pincode}
                maxLength={6}
                onChange={(e) => setPincode(e.target.value)}
                className="gw-pdp-pincode-input"
              />
              <button type="submit" className="gw-pdp-pincode-btn">
                VERIFY
              </button>
            </form>
            {pincodeStatus && (
              <div
                className="gw-pdp-pincode-result"
                style={{ color: pincodeStatus.valid ? "#15803D" : "#DC2626" }}
              >
                <i
                  className={`fa-solid ${pincodeStatus.valid ? "fa-circle-check" : "fa-circle-exclamation"
                    }`}
                ></i>
                <span>{pincodeStatus.message}</span>
              </div>
            )}
          </div>

          {/* EDITORIAL ACCORDIONS */}
          <div className="gw-pdp-accordions">
            {/* 1. DESCRIPTION */}
            <div className="gw-pdp-accordion-item">
              <button
                type="button"
                className="gw-pdp-accordion-header"
                onClick={() => toggleAccordion("details")}
              >
                <span>DESCRIPTION &amp; DETAILS</span>
                <i className={`fa-solid fa-chevron-down ${openAccordions.details ? "open" : ""}`}></i>
              </button>
              {openAccordions.details && (
                <div className="gw-pdp-accordion-body">
                  <p>{product.description || "Premium men's fashion designed for effortless daily style, superior comfort, and durability."}</p>
                  <ul>
                    <li>Modern regular / relaxed fit</li>
                    <li>Durable stitching &amp; quality finishing</li>
                    <li>High-grade fabric selected for all-day comfort</li>
                    {selectedVariant?.sku && <li>SKU: {selectedVariant.sku}</li>}
                  </ul>
                </div>
              )}
            </div>

            {/* 2. FABRIC & CARE */}
            <div className="gw-pdp-accordion-item">
              <button
                type="button"
                className="gw-pdp-accordion-header"
                onClick={() => toggleAccordion("care")}
              >
                <span>COMPOSITION &amp; CARE</span>
                <i className={`fa-solid fa-chevron-down ${openAccordions.care ? "open" : ""}`}></i>
              </button>
              {openAccordions.care && (
                <div className="gw-pdp-accordion-body">
                  <p>Crafted from premium cotton blends and quality fabrics.</p>
                  <ul>
                    <li>Gentle machine wash or hand wash inside-out at 30°C</li>
                    <li>Do not tumble dry; reshape while damp and dry flat</li>
                    <li>Cool iron on reverse side</li>
                  </ul>
                </div>
              )}
            </div>

            {/* 3. SHIPPING & RETURNS */}
            <div className="gw-pdp-accordion-item">
              <button
                type="button"
                className="gw-pdp-accordion-header"
                onClick={() => toggleAccordion("shipping")}
              >
                <span>SHIPPING &amp; EXCHANGES</span>
                <i className={`fa-solid fa-chevron-down ${openAccordions.shipping ? "open" : ""}`}></i>
              </button>
              {openAccordions.shipping && (
                <div className="gw-pdp-accordion-body">
                  <p>
                    All orders above ₹1,999 qualify for complimentary domestic express shipping with tracked delivery.
                  </p>
                  <ul>
                    <li>Estimated express delivery within 2-4 business days</li>
                    <li>100% Secure Online Payment via Razorpay (UPI, Cards, NetBanking)</li>
                    <li>7-day easy size exchange and store customer support</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RELATED CREATIONS */}
      {relatedProducts.length > 0 && (
        <div className="gw-pdp-related">
          <div className="gw-section-header">
            <span className="gw-section-badge">RECOMMENDED FOR YOU</span>
            <h2 className="gw-section-title">SIMILAR STYLES</h2>
          </div>
          <div className="products-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}