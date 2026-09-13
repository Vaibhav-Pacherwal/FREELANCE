import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../ApiEndpoints.js";
import "./Footer.css";

export default function Footer() {
  const [settings, setSettings] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(API.settings);
        const data = await res.json();
        if (res.ok && data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error("Failed to load footer store settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const storeName = settings?.storeName || "Gupta Wears";
  const address = settings?.address || "Atelier Flagship Store, Delhi, India";
  const phone = settings?.phone || "+91 72898 54805";
  const whatsapp = settings?.whatsapp || "+91 72898 54805";
  const instagram = settings?.instagram || "https://instagram.com";
  const googleMaps = settings?.googleMaps || "";
  const openingHours = settings?.openingHours || "Mon - Sat: 10:00 AM - 08:30 PM";

  return (
    <footer className="gw-footer">
      <div className="gw-container">
        <div className="gw-footer-grid">
          {/* BRAND COLUMN */}
          <div className="gw-footer-brand">
            <h2>{storeName}</h2>
            <p className="gw-footer-tagline">
              Curated contemporary elegance, bespoke craftsmanship, and refined streetwear. Redefining modern luxury tailoring for the discerning wardrobe.
            </p>
            <div className="gw-footer-socials">
              {instagram && (
                <a
                  href={instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gw-footer-social-btn"
                  aria-label="Instagram"
                >
                  <i className="fa-brands fa-instagram"></i>
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gw-footer-social-btn"
                  aria-label="WhatsApp"
                >
                  <i className="fa-brands fa-whatsapp"></i>
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="gw-footer-social-btn"
                  aria-label="Phone"
                >
                  <i className="fa-solid fa-phone"></i>
                </a>
              )}
              {googleMaps && (
                <a
                  href={googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gw-footer-social-btn"
                  aria-label="Google Maps"
                >
                  <i className="fa-solid fa-location-dot"></i>
                </a>
              )}
            </div>
          </div>

          {/* EXPLORE / SHOP COLUMN */}
          <div className="gw-footer-col">
            <h4>Collections</h4>
            <ul className="gw-footer-links">
              <li>
                <Link to="/products">All Creations</Link>
              </li>
              <li>
                <Link to="/products?group=clothing">Tailored Clothing</Link>
              </li>
              <li>
                <Link to="/products?group=footwear">Footwear Atelier</Link>
              </li>
              <li>
                <Link to="/products?group=accessories">Accessories & Caps</Link>
              </li>
              <li>
                <Link to="/offers">Curated Offers</Link>
              </li>
            </ul>
          </div>

          {/* CLIENT CARE COLUMN */}
          <div className="gw-footer-col">
            <h4>Client Care</h4>
            <ul className="gw-footer-links">
              <li>
                <Link to="/account">My Account</Link>
              </li>
              <li>
                <Link to="/orders">Track Orders</Link>
              </li>
              <li>
                <Link to="/wishlist">Private Wishlist</Link>
              </li>
              <li>
                <Link to="/cart">Shopping Bag</Link>
              </li>
              <li>
                <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                  Boutique Concierge
                </a>
              </li>
            </ul>
          </div>

          {/* ATELIER & BOUTIQUE INFO */}
          <div className="gw-footer-col">
            <h4>Flagship Boutique</h4>
            <div className="gw-footer-contact-item">
              <i className="fa-solid fa-location-dot"></i>
              <span>{address}</span>
            </div>
            <div className="gw-footer-contact-item">
              <i className="fa-solid fa-clock"></i>
              <span>{openingHours}</span>
            </div>
            <div className="gw-footer-contact-item">
              <i className="fa-solid fa-phone"></i>
              <span>{phone}</span>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="gw-footer-bottom">
          <p className="gw-footer-copyright">
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved. Handcrafted with luxury excellence.
          </p>
          <div className="gw-footer-payments" title="Accepted Payment Methods">
            <i className="fa-brands fa-cc-visa" title="Visa"></i>
            <i className="fa-brands fa-cc-mastercard" title="Mastercard"></i>
            <i className="fa-solid fa-credit-card" title="Cards / UPI"></i>
            <i className="fa-solid fa-truck" title="Cash on Delivery Available"></i>
            <i className="fa-solid fa-shield-halved" title="Verified Checkout"></i>
          </div>
        </div>
      </div>
    </footer>
  );
}
