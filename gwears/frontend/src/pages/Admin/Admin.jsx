import { useState, useEffect } from "react";
import "./Admin.css";
import { useNavigate, useLocation, Outlet, NavLink } from "react-router-dom";
import server from "../../Environment.js";
import { useAuth } from "../../utils/AuthContext.jsx";

export default function Admin() {
  const [showAcc, setShowAcc] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
    setShowAcc(false);
  }, [location.pathname]);

  // Contextual breadcrumb / page title mapping
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/") return "Store Overview";
    if (path.startsWith("/admin/products/new")) return "Create New Product";
    if (path.startsWith("/admin/products/edit")) return "Edit Product";
    if (path.startsWith("/admin/products")) return "Product Catalog";
    if (path.startsWith("/admin/categories/new")) return "Create Category";
    if (path.startsWith("/admin/categories/edit")) return "Edit Category";
    if (path.startsWith("/admin/categories")) return "Categories";
    if (path.startsWith("/admin/offers/new")) return "Create Offer";
    if (path.startsWith("/admin/offers/edit")) return "Edit Offer";
    if (path.startsWith("/admin/offers")) return "Special Offers & Sales";
    if (path.startsWith("/admin/orders/")) return "Order Details";
    if (path.startsWith("/admin/orders")) return "Order Management";
    if (path.startsWith("/admin/settings")) return "Store Settings";
    return "Admin Console";
  };

  const handleLogout = async () => {
    try {
      await fetch(`${server}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/auth");
    }
  };

  return (
    <div className="gw-admin-shell">
      {/* MOBILE BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div
          className="gw-admin-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* FIXED / COLLAPSIBLE SIDEBAR */}
      <aside className={`gw-admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* BRAND HEADER */}
        <div className="gw-admin-brand">
          <div className="gw-admin-brand-main" onClick={() => navigate("/admin")}>
            <div className="gw-admin-logo-mark">GW</div>
            <div className="gw-admin-brand-text">
              <span className="gw-admin-brand-title">GWEARS</span>
              <span className="gw-admin-brand-sub">RETAIL STORE (Est. 2019)</span>
            </div>
          </div>
          <button
            className="gw-admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* NAVIGATION SECTIONS */}
        <div className="gw-admin-nav-scroll">
          {/* SECTION 1: OVERVIEW */}
          <div className="gw-admin-nav-group">
            <span className="gw-admin-nav-label">OVERVIEW</span>
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `gw-admin-nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="fa-solid fa-chart-pie"></i>
              <span>Dashboard</span>
            </NavLink>
          </div>

          {/* SECTION 2: STORE MANAGEMENT */}
          <div className="gw-admin-nav-group">
            <span className="gw-admin-nav-label">CATALOG &amp; STORE</span>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `gw-admin-nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="fa-solid fa-boxes-stacked"></i>
              <span>Products</span>
            </NavLink>
            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                `gw-admin-nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="fa-solid fa-tags"></i>
              <span>Categories</span>
            </NavLink>
            <NavLink
              to="/admin/offers"
              className={({ isActive }) =>
                `gw-admin-nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="fa-solid fa-percent"></i>
              <span>Offers &amp; Sales</span>
            </NavLink>
          </div>

          {/* SECTION 3: SALES & OPS */}
          <div className="gw-admin-nav-group">
            <span className="gw-admin-nav-label">SALES &amp; ORDERS</span>
            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                `gw-admin-nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="fa-solid fa-bag-shopping"></i>
              <span>Customer Orders</span>
            </NavLink>
          </div>

          {/* SECTION 4: SYSTEM */}
          <div className="gw-admin-nav-group">
            <span className="gw-admin-nav-label">PREFERENCES</span>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `gw-admin-nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="fa-solid fa-sliders"></i>
              <span>Store Settings</span>
            </NavLink>
          </div>
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="gw-admin-sidebar-footer">
          <button
            type="button"
            className="gw-admin-storefront-btn"
            onClick={() => window.open("/", "_blank")}
          >
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
            <span>View Storefront</span>
          </button>

          <div className="gw-admin-user-card" onClick={() => setShowAcc(!showAcc)}>
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Admin"
                className="gw-admin-user-avatar"
                onError={(e) => {
                  e.target.style.display = "none";
                  const fallback = e.target.parentElement.querySelector(".gw-admin-user-avatar-fallback");
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="gw-admin-user-avatar-fallback"
              style={{ display: user?.avatar ? "none" : "flex" }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="gw-admin-user-info">
              <span className="gw-admin-user-name">{user?.name || "Admin User"}</span>
              <span className="gw-admin-user-role">Store Administrator</span>
            </div>
            <i className="fa-solid fa-ellipsis-vertical gw-admin-user-dots"></i>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="gw-admin-main-wrapper">
        {/* TOP BAR - CLEAN & CONTEXT-FOCUSED */}
        <header className="gw-admin-topbar">
          <div className="gw-admin-topbar-left">
            <button
              type="button"
              className="gw-admin-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Sidebar"
            >
              <i className="fa-solid fa-bars"></i>
            </button>
            <div className="gw-admin-breadcrumbs">
              <span className="gw-admin-breadcrumb-root">Admin</span>
              <span className="gw-admin-breadcrumb-sep">/</span>
              <h1 className="gw-admin-page-heading">{getPageTitle()}</h1>
            </div>
          </div>

          <div className="gw-admin-topbar-right">
            <div className="gw-admin-retail-status" title="Gupta Wears Retail Administration">
              <span className="gw-retail-dot"></span>
              <span className="gw-retail-status-text">Store Management</span>
            </div>
          </div>
        </header>

        {/* OUTLET CONTENT */}
        <main className="gw-admin-content">
          <Outlet />
        </main>
      </div>

      {/* ACCOUNT DETAILS MODAL / POPOVER */}
      {showAcc && (
        <>
          <div className="gw-modal-backdrop" onClick={() => setShowAcc(false)} />
          <div className="gw-admin-account-modal">
            <div className="gw-admin-account-header">
              <div className="gw-admin-account-user-meta">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Admin"
                    className="gw-admin-modal-avatar"
                    onError={(e) => {
                      e.target.style.display = "none";
                      const fallback = e.target.parentElement.querySelector(".gw-admin-modal-avatar-fallback");
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="gw-admin-modal-avatar-fallback"
                  style={{ display: user?.avatar ? "none" : "flex" }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div>
                  <h3 className="gw-admin-modal-name">{user?.name || "Administrator"}</h3>
                  <p className="gw-admin-modal-email">{user?.email || "admin@gwears.com"}</p>
                  <span className="gw-admin-modal-badge">
                    <i className="fa-solid fa-shield-check"></i> Super Administrator
                  </span>
                </div>
              </div>
              <button
                className="gw-admin-modal-close"
                onClick={() => setShowAcc(false)}
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="gw-admin-account-body">
              <div className="gw-admin-account-row">
                <span className="gw-admin-account-key">Store Location:</span>
                <span className="gw-admin-account-val">New Delhi, India (Est. 2019)</span>
              </div>
              <div className="gw-admin-account-row">
                <span className="gw-admin-account-key">Platform Role:</span>
                <span className="gw-admin-account-val">Retail Store Owner</span>
              </div>
            </div>

            <div className="gw-admin-account-actions">
              <button
                type="button"
                className="gw-admin-action-btn secondary"
                onClick={() => {
                  setShowAcc(false);
                  navigate("/");
                }}
              >
                <i className="fa-solid fa-store"></i>
                Visit Storefront
              </button>
              <button
                type="button"
                className="gw-admin-action-btn danger"
                onClick={handleLogout}
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}