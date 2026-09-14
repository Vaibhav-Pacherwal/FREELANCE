import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import API from "../ApiEndpoints.js";
import { useUserAuth } from "../utils/UserAuthContext.jsx";
import { useCart } from "../utils/CartContext.jsx";
import { useWishlist } from "../utils/WishlistContext.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, loading } = useUserAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [categories, setCategories] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActiveGroup, setMobileActiveGroup] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [settings, setSettings] = useState(null);

  // Close mobile drawer and search on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setActiveMenu(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(API.categories);
        const data = await response.json();
        if (response.ok) {
          setCategories(
            (data.categories || []).filter((category) => category.isActive)
          );
        }
      } catch (error) {
        console.error("Navbar categories error:", error);
      }
    };

    const fetchSettings = async () => {
      try {
        const response = await fetch(API.settings);
        const data = await response.json();
        if (response.ok && data.settings) {
          setSettings(data.settings);
        }
      } catch (error) {
        // silent fallback
      }
    };

    fetchCategories();
    fetchSettings();
  }, []);

  const getCategoriesByGroup = (group) => {
    return categories.filter((category) => category.group === group);
  };

  const handleUserClick = () => {
    if (loading) return;
    if (user) {
      navigate("/account");
    } else {
      navigate("/login");
    }
  };

  const handleWishlistClick = () => {
    if (loading) return;
    if (user) {
      navigate("/wishlist");
    } else {
      navigate("/login");
    }
  };

  const handleCategoryClick = (categoryId) => {
    setActiveMenu(null);
    setMobileMenuOpen(false);
    navigate(`/products?category=${categoryId}`);
  };

  const handleGroupClick = (group) => {
    setActiveMenu(null);
    setMobileMenuOpen(false);
    navigate(`/products?group=${group}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setSearchTerm("");
    }
  };

  const renderCategoryMenu = (group, title) => {
    const groupCategories = getCategoriesByGroup(group);

    return (
      <div
        className="navMenu"
        onMouseEnter={() => setActiveMenu(group)}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <button
          className="navLink"
          onClick={() => handleGroupClick(group)}
        >
          {title}
        </button>

        {activeMenu === group && (
          <div className="megaMenu">
            <div className="megaMenuContent">
              <div className="megaMenuColumn">
                <h4>SHOP {title}</h4>
                <button
                  className="shopAllButton"
                  onClick={() => handleGroupClick(group)}
                >
                  Explore All {title}
                </button>
                {groupCategories.length > 0 ? (
                  groupCategories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => handleCategoryClick(category._id)}
                    >
                      {category.name}
                    </button>
                  ))
                ) : (
                  <span className="no-cat-item">New collection arriving soon</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const brandName = settings?.storeName || "GWEARS";

  return (
    <>
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="gw-announcement-bar">
        <p>
          COMPLIMENTARY SHIPPING ON ORDERS OVER ₹1,999 &bull; ESTABLISHED 2019
        </p>
      </div>

      <header className="nav">
        {/* MOBILE HAMBURGER BUTTON */}
        <button
          className="mobileMenuToggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <i className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"}`}></i>
        </button>

        {/* BRAND */}
        <div className="brand" onClick={() => navigate("/")}>
          <h2 className="gw-brand-title">{brandName.toUpperCase()}</h2>
        </div>

        {/* DESKTOP MAIN NAVIGATION */}
        <nav className="mainNavigation">
          <button className="navLink" onClick={() => navigate("/products")}>
            NEW IN
          </button>
          {renderCategoryMenu("clothing", "CLOTHING")}
          {renderCategoryMenu("footwear", "FOOTWEAR")}
          {renderCategoryMenu("accessories", "ACCESSORIES")}
          <button className="navLink navLinkOffer" onClick={() => navigate("/offers")}>
            OFFERS
          </button>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="navOptions">
          {/* SEARCH TOGGLE */}
          <button
            className="navIconButton"
            title="Search creations"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
          >
            <i className={`fa-solid ${searchOpen ? "fa-xmark" : "fa-magnifying-glass"}`}></i>
          </button>

          {/* WISHLIST */}
          <button
            className="navIconButton navBadgeWrapper"
            title={user ? "Private Wishlist" : "Login to view wishlist"}
            onClick={handleWishlistClick}
            aria-label="Wishlist"
          >
            <i className="fa-regular fa-heart"></i>
            {user && wishlistCount > 0 && (
              <span className="navCount">{wishlistCount}</span>
            )}
          </button>

          {/* ACCOUNT */}
          <button
            className="navIconButton"
            title={user ? `Account (${user.name || "Customer"})` : "Login / Register"}
            onClick={handleUserClick}
            aria-label="Account"
          >
            <i className="fa-regular fa-user"></i>
          </button>

          {/* CART */}
          <button
            className="navIconButton navBadgeWrapper"
            title="Shopping Bag"
            onClick={() => navigate("/cart")}
            aria-label="Shopping Bag"
          >
            <i className="fa-solid fa-bag-shopping"></i>
            {cartCount > 0 && <span className="navCount">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* EXPANDABLE LUXURY SEARCH BAR */}
      {searchOpen && (
        <div className="gw-nav-search-tray">
          <div className="gw-container">
            <form onSubmit={handleSearchSubmit} className="gw-nav-search-form">
              <i className="fa-solid fa-magnifying-glass gw-search-icon"></i>
              <input
                type="text"
                placeholder="Search products (e.g. Shoes, Hoodie, Shirt, Jeans, Jacket, Cap)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              <button type="submit" className="gw-btn gw-btn-primary gw-search-submit">
                SEARCH
              </button>
              <button
                type="button"
                className="gw-search-close"
                onClick={() => setSearchOpen(false)}
              >
                &times;
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE SLIDE-OVER DRAWER */}
      {mobileMenuOpen && (
        <div className="gw-mobile-drawer-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <div className="gw-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="gw-drawer-header">
              <span className="gw-drawer-brand">{brandName.toUpperCase()}</span>
              <button
                className="gw-drawer-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                &times;
              </button>
            </div>

            <div className="gw-drawer-body">
              <button
                className="gw-drawer-link"
                onClick={() => {
                  navigate("/products");
                  setMobileMenuOpen(false);
                }}
              >
                <span>NEW ARRIVALS</span>
                <i className="fa-solid fa-chevron-right"></i>
              </button>

              {/* CLOTHING ACCORDION */}
              <div className="gw-drawer-accordion">
                <button
                  className="gw-drawer-link"
                  onClick={() =>
                    setMobileActiveGroup(mobileActiveGroup === "clothing" ? null : "clothing")
                  }
                >
                  <span>CLOTHING</span>
                  <i
                    className={`fa-solid fa-chevron-down ${
                      mobileActiveGroup === "clothing" ? "rotated" : ""
                    }`}
                  ></i>
                </button>
                {mobileActiveGroup === "clothing" && (
                  <div className="gw-drawer-sublinks">
                    <button onClick={() => handleGroupClick("clothing")}>
                      View All Clothing
                    </button>
                    {getCategoriesByGroup("clothing").map((cat) => (
                      <button key={cat._id} onClick={() => handleCategoryClick(cat._id)}>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* FOOTWEAR ACCORDION */}
              <div className="gw-drawer-accordion">
                <button
                  className="gw-drawer-link"
                  onClick={() =>
                    setMobileActiveGroup(mobileActiveGroup === "footwear" ? null : "footwear")
                  }
                >
                  <span>FOOTWEAR</span>
                  <i
                    className={`fa-solid fa-chevron-down ${
                      mobileActiveGroup === "footwear" ? "rotated" : ""
                    }`}
                  ></i>
                </button>
                {mobileActiveGroup === "footwear" && (
                  <div className="gw-drawer-sublinks">
                    <button onClick={() => handleGroupClick("footwear")}>
                      View All Footwear
                    </button>
                    {getCategoriesByGroup("footwear").map((cat) => (
                      <button key={cat._id} onClick={() => handleCategoryClick(cat._id)}>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ACCESSORIES ACCORDION */}
              <div className="gw-drawer-accordion">
                <button
                  className="gw-drawer-link"
                  onClick={() =>
                    setMobileActiveGroup(mobileActiveGroup === "accessories" ? null : "accessories")
                  }
                >
                  <span>ACCESSORIES</span>
                  <i
                    className={`fa-solid fa-chevron-down ${
                      mobileActiveGroup === "accessories" ? "rotated" : ""
                    }`}
                  ></i>
                </button>
                {mobileActiveGroup === "accessories" && (
                  <div className="gw-drawer-sublinks">
                    <button onClick={() => handleGroupClick("accessories")}>
                      View All Accessories
                    </button>
                    {getCategoriesByGroup("accessories").map((cat) => (
                      <button key={cat._id} onClick={() => handleCategoryClick(cat._id)}>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="gw-drawer-link gw-drawer-link-offer"
                onClick={() => {
                  navigate("/offers");
                  setMobileMenuOpen(false);
                }}
              >
                <span>CURATED OFFERS</span>
                <span className="gw-badge-accent">VIP</span>
              </button>

              <hr className="gw-drawer-divider" />

              <div className="gw-drawer-client-links">
                {user ? (
                  <>
                    <button
                      className="gw-drawer-sublink"
                      onClick={() => {
                        navigate("/account");
                        setMobileMenuOpen(false);
                      }}
                    >
                      <i className="fa-regular fa-user"></i> My Account ({user.name})
                    </button>
                    <button
                      className="gw-drawer-sublink"
                      onClick={() => {
                        navigate("/orders");
                        setMobileMenuOpen(false);
                      }}
                    >
                      <i className="fa-solid fa-box"></i> Order History
                    </button>
                  </>
                ) : (
                  <button
                    className="gw-drawer-sublink"
                    onClick={() => {
                      navigate("/login");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <i className="fa-regular fa-user"></i> Sign In / Register
                  </button>
                )}

                <button
                  className="gw-drawer-sublink"
                  onClick={() => {
                    navigate(user ? "/wishlist" : "/login");
                    setMobileMenuOpen(false);
                  }}
                >
                  <i className="fa-regular fa-heart"></i> Wishlist ({wishlistCount})
                </button>

                <button
                  className="gw-drawer-sublink"
                  onClick={() => {
                    navigate("/cart");
                    setMobileMenuOpen(false);
                  }}
                >
                  <i className="fa-solid fa-bag-shopping"></i> Shopping Bag ({cartCount})
                </button>
              </div>
            </div>

            {settings?.phone && (
              <div className="gw-drawer-footer">
                <p>Store Customer Support</p>
                <a href={`tel:${settings.phone}`}>{settings.phone}</a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}