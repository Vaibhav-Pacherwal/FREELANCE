import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserAuth } from "../utils/UserAuthContext.jsx";
import { useSnackbar } from "../utils/SnackbarContext.jsx";
import API from "../ApiEndpoints.js";
import "./Account.css";

export default function Account() {
  const { user, logout } = useUserAuth();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("addresses"); // 'profile' | 'addresses' | 'orders'
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchAddresses();
    fetchOrders();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await fetch(API.addresses, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.addresses) {
        setAddresses(data.addresses);
      }
    } catch (err) {
      console.error("Failed to load addresses:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch(API.orders, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const res = await fetch(`${API.addresses}/${addressId}/default`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showSnackbar("Default delivery address updated", "success");
        fetchAddresses();
      } else {
        showSnackbar(data.message || "Failed to set default address", "error");
      }
    } catch (err) {
      showSnackbar("Failed to update address", "error");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you wish to remove this address from your book?")) {
      return;
    }
    try {
      const res = await fetch(`${API.addresses}/${addressId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showSnackbar("Address removed", "success");
        setAddresses((prev) => prev.filter((a) => a._id !== addressId));
      } else {
        showSnackbar(data.message || "Failed to delete address", "error");
      }
    } catch (err) {
      showSnackbar("Failed to delete address", "error");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) return null;

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "G";

  return (
    <div className="gw-account-page">
      {/* HEADER BANNER */}
      <div className="gw-account-header">
        <div className="gw-account-user-meta">
          <div className="gw-account-avatar">{userInitial}</div>
          <div>
            <h1 className="gw-account-name">{user.name}</h1>
            <p className="gw-account-email">{user.email}</p>
            <span className="gw-account-tier">GWears Atelier Member</span>
          </div>
        </div>

        <button className="gw-account-logout-btn" onClick={handleLogout}>
          <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginRight: "8px" }}></i>
          Sign Out
        </button>
      </div>

      {/* TABS NAVIGATION */}
      <div className="gw-account-nav">
        <button
          className={`gw-account-tab ${activeTab === "addresses" ? "active" : ""}`}
          onClick={() => setActiveTab("addresses")}
        >
          Saved Addresses ({addresses.length})
        </button>
        <button
          className={`gw-account-tab ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          My Orders ({orders.length})
        </button>
        <button
          className={`gw-account-tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Account Details
        </button>
      </div>

      {/* TAB 1: SAVED ADDRESSES */}
      {activeTab === "addresses" && (
        <div>
          <div className="gw-account-section-title">
            <span>Shipping &amp; Delivery Addresses</span>
            <button
              className="gw-btn gw-btn-primary"
              onClick={() => navigate("/addresses/new", { state: { from: "/account" } })}
              style={{ fontSize: "0.75rem", padding: "8px 18px" }}
            >
              + ADD NEW ADDRESS
            </button>
          </div>

          {loadingAddresses ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
              <p style={{ marginTop: "1rem", color: "#737373" }}>Loading address book...</p>
            </div>
          ) : (
            <div className="gw-address-grid">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`gw-address-card ${addr.isDefault ? "is-default" : ""}`}
                >
                  <div>
                    {addr.isDefault && <span className="gw-default-tag">DEFAULT ADDRESS</span>}
                    <h3 className="gw-address-name">{addr.fullName}</h3>
                    <div className="gw-address-lines">
                      <p style={{ margin: "0 0 4px 0" }}>{addr.addressLine1}</p>
                      {addr.addressLine2 && (
                        <p style={{ margin: "0 0 4px 0" }}>{addr.addressLine2}</p>
                      )}
                      {addr.landmark && (
                        <p style={{ margin: "0 0 4px 0", color: "#737373" }}>
                          Landmark: {addr.landmark}
                        </p>
                      )}
                      <p style={{ margin: "0", fontWeight: 600 }}>
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                    <div className="gw-address-phone">
                      <i className="fa-solid fa-phone" style={{ marginRight: "6px", color: "#888" }}></i>
                      {addr.phone}
                    </div>
                  </div>

                  <div className="gw-address-actions">
                    {!addr.isDefault && (
                      <button
                        className="gw-addr-btn"
                        onClick={() => handleSetDefault(addr._id)}
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      className="gw-addr-btn gw-addr-btn-danger"
                      onClick={() => handleDeleteAddress(addr._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div
                className="gw-add-address-card"
                onClick={() => navigate("/addresses/new", { state: { from: "/account" } })}
              >
                <i className="fa-solid fa-plus"></i>
                <span>Add New Address</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY ORDERS */}
      {activeTab === "orders" && (
        <div>
          <div className="gw-account-section-title">
            <span>Order History</span>
            <Link
              to="/orders"
              style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}
            >
              Full Order Archive &rarr;
            </Link>
          </div>

          {loadingOrders ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
              <p style={{ marginTop: "1rem", color: "#737373" }}>Retrieving orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 2rem", border: "1px dashed #E0E0E0", borderRadius: "4px" }}>
              <i className="fa-solid fa-bag-shopping fa-3x" style={{ color: "#CCCCCC", marginBottom: "1rem" }}></i>
              <h3>No Orders Placed Yet</h3>
              <p style={{ color: "#737373", margin: "0.5rem 0 1.5rem 0" }}>
                Explore our latest silhouettes and indulge in atelier craftsmanship.
              </p>
              <button className="gw-btn gw-btn-primary" onClick={() => navigate("/products")}>
                START BROWSING
              </button>
            </div>
          ) : (
            <div className="gw-account-orders-list">
              {orders.slice(0, 5).map((ord) => {
                const statusClass = `gw-status-${(ord.orderStatus || "pending").toLowerCase()}`;
                return (
                  <div key={ord._id} className="gw-account-order-card">
                    <div>
                      <div className="gw-order-meta-number">ORDER #{ord.orderNumber || ord._id.slice(-8).toUpperCase()}</div>
                      <p className="gw-order-meta-date">
                        Placed on {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div>
                      <span className={`gw-order-status-pill ${statusClass}`}>
                        {ord.orderStatus || "PLACED"}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                        ₹{Number(ord.totalAmount || 0).toLocaleString("en-IN")}
                      </span>
                      <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "#737373" }}>
                        {ord.items?.length || 1} item{ord.items?.length === 1 ? "" : "s"} &bull; {ord.paymentMethod?.toUpperCase() || "COD"}
                      </p>
                    </div>

                    <div>
                      <button
                        className="gw-btn gw-btn-outline"
                        style={{ padding: "8px 18px", fontSize: "0.75rem" }}
                        onClick={() => navigate(`/orders/${ord._id}`)}
                      >
                        VIEW DETAILS
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROFILE */}
      {activeTab === "profile" && (
        <div style={{ maxWidth: "600px" }}>
          <div className="gw-account-section-title">
            <span>Personal Information</span>
          </div>

          <div style={{ background: "#FFFFFF", border: "1px solid #E5E5E5", padding: "2rem", borderRadius: "4px" }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#737373", display: "block", marginBottom: "6px" }}>
                Full Name
              </label>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#111111" }}>{user.name}</div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#737373", display: "block", marginBottom: "6px" }}>
                Email Address
              </label>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#111111" }}>{user.email}</div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#737373", display: "block", marginBottom: "6px" }}>
                Membership Tier
              </label>
              <div style={{ fontSize: "0.95rem", color: "#B45309", fontWeight: 600 }}>
                GWears Private Atelier Client (VIP)
              </div>
            </div>

            <div style={{ borderTop: "1px solid #EEEEEE", paddingTop: "1.5rem", marginTop: "1.5rem" }}>
              <p style={{ fontSize: "0.85rem", color: "#737373", margin: "0 0 1rem 0" }}>
                Need to update your account email or credentials? Please connect with our concierge.
              </p>
              <button
                className="gw-btn gw-btn-outline"
                style={{ fontSize: "0.75rem", padding: "8px 18px" }}
                onClick={() => navigate("/wishlist")}
              >
                VIEW SAVED WISHLIST
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}