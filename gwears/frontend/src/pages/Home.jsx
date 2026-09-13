import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../ApiEndpoints.js";
import ProductCard from "../components/ProductCard.jsx";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [newArrivals, setNewArrivals] = useState([]);
  const [activeOffer, setActiveOffer] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        // 1. Fetch New Arrivals
        const prodRes = await fetch(`${API.storeProducts}?limit=8`);
        const prodData = await prodRes.json();
        if (prodRes.ok && prodData.products) {
          setNewArrivals(prodData.products);
        }

        // 2. Fetch Active Offers
        try {
          const offerRes = await fetch(`${API.offers}/active`);
          const offerData = await offerRes.json();
          if (offerRes.ok && offerData.offers && offerData.offers.length > 0) {
            setActiveOffer(offerData.offers[0]);
          }
        } catch (err) {
          // silent fallback
        }

        // 3. Fetch Store Settings
        try {
          const setRes = await fetch(API.settings);
          const setData = await setRes.json();
          if (setRes.ok && setData.settings) {
            setSettings(setData.settings);
          }
        } catch (err) {
          // silent fallback
        }
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const storeName = settings?.storeName || "Gupta Wears";

  return (
    <div className="gw-home">
      {/* HERO SECTION */}
      <section className="gw-hero">
        <div className="gw-hero-content">
          <span className="gw-hero-badge">ATELIER AUTUMN / WINTER 2026</span>
          <h1 className="gw-hero-title">THE NEW SILHOUETTES OF LUXURY</h1>
          <p className="gw-hero-subtitle">
            Bespoke tailoring, archival fabrics, and refined modern silhouettes crafted for effortless distinction.
          </p>
          <div className="gw-hero-ctas">
            <button
              className="gw-hero-btn-primary"
              onClick={() => navigate("/products")}
            >
              EXPLORE CREATIONS
            </button>
            <button
              className="gw-hero-btn-outline"
              onClick={() => navigate("/offers")}
            >
              CURATED OFFERS
            </button>
          </div>
        </div>
      </section>

      {/* LUXURY VALUES STRIP */}
      <section className="gw-values-strip">
        <div className="gw-values-grid">
          <div className="gw-value-item">
            <div className="gw-value-icon">
              <i className="fa-solid fa-gem"></i>
            </div>
            <div className="gw-value-text">
              <h4>Bespoke Tailoring</h4>
              <p>Hand-finished silhouettes & premium textiles</p>
            </div>
          </div>
          <div className="gw-value-item">
            <div className="gw-value-icon">
              <i className="fa-solid fa-truck-fast"></i>
            </div>
            <div className="gw-value-text">
              <h4>Complimentary Delivery</h4>
              <p>On all domestic orders over ₹1,999</p>
            </div>
          </div>
          <div className="gw-value-item">
            <div className="gw-value-icon">
              <i className="fa-solid fa-rotate-left"></i>
            </div>
            <div className="gw-value-text">
              <h4>Effortless Returns</h4>
              <p>30-day exchange and concierge support</p>
            </div>
          </div>
          <div className="gw-value-item">
            <div className="gw-value-icon">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div className="gw-value-text">
              <h4>Guaranteed Authenticity</h4>
              <p>100% genuine atelier guaranteed products</p>
            </div>
          </div>
        </div>
      </section>

      {/* DISCOVER BY CATEGORY */}
      <section className="gw-section">
        <div className="gw-section-header">
          <span className="gw-section-badge">THE ARCHIVES</span>
          <h2 className="gw-section-title">EXPLORE BY SILHOUETTE</h2>
          <p className="gw-section-subtitle">
            Impeccably tailored garments, statement footwear, and refined artisanal accessories.
          </p>
        </div>

        <div className="gw-category-grid">
          {/* CLOTHING */}
          <Link to="/products?group=clothing" className="gw-category-card">
            <div
              className="gw-category-bg"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80')",
              }}
            ></div>
            <div className="gw-category-overlay"></div>
            <div className="gw-category-info">
              <span className="gw-category-tag">ATELIER READY-TO-WEAR</span>
              <h3 className="gw-category-name">TAILORED CLOTHING</h3>
              <span className="gw-category-cta">
                DISCOVER WARDROBE <i className="fa-solid fa-arrow-right"></i>
              </span>
            </div>
          </Link>

          {/* FOOTWEAR */}
          <Link to="/products?group=footwear" className="gw-category-card">
            <div
              className="gw-category-bg"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80')",
              }}
            ></div>
            <div className="gw-category-overlay"></div>
            <div className="gw-category-info">
              <span className="gw-category-tag">HANDCRAFTED EDITIONS</span>
              <h3 className="gw-category-name">FOOTWEAR ATELIER</h3>
              <span className="gw-category-cta">
                DISCOVER FOOTWEAR <i className="fa-solid fa-arrow-right"></i>
              </span>
            </div>
          </Link>

          {/* ACCESSORIES */}
          <Link to="/products?group=accessories" className="gw-category-card">
            <div
              className="gw-category-bg"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80')",
              }}
            ></div>
            <div className="gw-category-overlay"></div>
            <div className="gw-category-info">
              <span className="gw-category-tag">REFINED ACCENTS</span>
              <h3 className="gw-category-name">CAPS & ACCESSORIES</h3>
              <span className="gw-category-cta">
                DISCOVER ACCENTS <i className="fa-solid fa-arrow-right"></i>
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* NEW ARRIVALS GRID */}
      <section className="gw-section" style={{ paddingTop: 0 }}>
        <div className="gw-section-header">
          <span className="gw-section-badge">FRESH FROM THE WORKSHOP</span>
          <h2 className="gw-section-title">NEW SEASON ARRIVALS</h2>
          <p className="gw-section-subtitle">
            Handpicked latest releases combining elevated street sensibility with contemporary elegance.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#737373" }}>
            <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
            <p style={{ marginTop: "1rem" }}>Curating collection...</p>
          </div>
        ) : newArrivals.length > 0 ? (
          <div className="products-grid">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "3rem", color: "#737373" }}>
            <p>New season creations are arriving shortly.</p>
            <button
              className="gw-btn gw-btn-primary"
              onClick={() => navigate("/products")}
              style={{ marginTop: "1rem" }}
            >
              Browse Catalog
            </button>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "3.5rem" }}>
          <button
            className="gw-btn gw-btn-outline"
            onClick={() => navigate("/products")}
            style={{ padding: "14px 40px", letterSpacing: "0.18em" }}
          >
            VIEW ENTIRE CATALOG
          </button>
        </div>
      </section>

      {/* EDITORIAL SPOTLIGHT BANNER */}
      <section className="gw-spotlight-banner">
        <div className="gw-spotlight-content">
          <div className="gw-spotlight-text">
            <span className="gw-section-badge" style={{ color: "#D4AF37" }}>THE PHILOSOPHY</span>
            <h3>PRECISION STITCHWORK & MODERN SENSIBILITY</h3>
            <p>
              At {storeName}, we believe luxury is defined not by excess, but by intentional restraint. Every seam, cut, and texture is engineered with purpose — blending high-grade fabrics with relaxed silhouettes designed to transition seamlessly from private ateliers to city streets.
            </p>
            <button
              className="gw-btn gw-btn-primary"
              onClick={() => navigate("/products?group=clothing")}
              style={{ background: "#FFFFFF", color: "#000000" }}
            >
              EXPLORE TAILORING
            </button>
          </div>
          <div>
            <blockquote className="gw-spotlight-quote">
              "Elegance is refusal — the discipline to craft only what is essential, durable, and breathtakingly modern."
            </blockquote>
          </div>
        </div>
      </section>

      {/* ACTIVE PROMOTION SPOTLIGHT (IF ANY) */}
      {activeOffer && (
        <section className="gw-promo-section">
          <div className="gw-promo-card">
            <div>
              <span className="gw-promo-badge">EXCLUSIVE ATELIER PRIVILEGE</span>
              <h3 className="gw-promo-title">{activeOffer.title}</h3>
              <p className="gw-promo-desc">
                {activeOffer.description ||
                  `Enjoy an exclusive ${
                    activeOffer.discountType === "percentage"
                      ? `${activeOffer.discountValue}% discount`
                      : `flat ₹${activeOffer.discountValue} concession`
                  } on eligible wardrobe selections.`}
              </p>
            </div>
            <div>
              <button
                className="gw-btn gw-btn-primary"
                onClick={() => navigate("/offers")}
                style={{ padding: "14px 32px", whiteSpace: "nowrap" }}
              >
                CLAIM OFFER
              </button>
            </div>
          </div>
        </section>
      )}

      {/* FLAGSHIP BOUTIQUE SECTION */}
      {settings && (
        <section className="gw-boutique-section">
          <div className="gw-boutique-grid">
            <div className="gw-boutique-info">
              <span className="gw-section-badge">VISIT OUR ATELIER</span>
              <h3>OUR FLAGSHIP BOUTIQUE</h3>
              <p>
                Experience our curated fabrics, bespoke sizing, and personal styling consultation in person at our flagship destination.
              </p>
              <div className="gw-boutique-detail-list">
                <div className="gw-boutique-detail-item">
                  <i className="fa-solid fa-location-dot"></i>
                  <div>
                    <h5>Boutique Address</h5>
                    <p>{settings.address || "Delhi, India"}</p>
                  </div>
                </div>
                <div className="gw-boutique-detail-item">
                  <i className="fa-solid fa-clock"></i>
                  <div>
                    <h5>Consultation Hours</h5>
                    <p>{settings.openingHours || "Monday - Saturday: 10:00 AM - 08:30 PM"}</p>
                  </div>
                </div>
                <div className="gw-boutique-detail-item">
                  <i className="fa-solid fa-phone"></i>
                  <div>
                    <h5>Private Appointments</h5>
                    <p>{settings.phone || "+91 72898 54805"}</p>
                  </div>
                </div>
              </div>

              <div className="gw-boutique-actions">
                {settings.googleMaps && (
                  <a
                    href={settings.googleMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gw-btn gw-btn-outline"
                    style={{ textDecoration: "none" }}
                  >
                    <i className="fa-solid fa-map-location-dot" style={{ marginRight: "8px" }}></i>
                    GET DIRECTIONS
                  </a>
                )}
                {settings.whatsapp && (
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gw-btn gw-btn-primary"
                    style={{ textDecoration: "none" }}
                  >
                    <i className="fa-brands fa-whatsapp" style={{ marginRight: "8px" }}></i>
                    WHATSAPP CONCIERGE
                  </a>
                )}
              </div>
            </div>

            <div style={{ position: "relative", height: "380px", borderRadius: "4px", overflow: "hidden" }}>
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80"
                alt="Flagship Boutique"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}