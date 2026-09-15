import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../ApiEndpoints.js";
import "./Orders.css";

export default function AdminOrders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            if (search.trim()) {
                params.append("search", search.trim());
            }

            if (status) {
                params.append("status", status);
            }

            if (paymentStatus) {
                params.append("paymentStatus", paymentStatus);
            }

            params.append("page", page);
            params.append("limit", 20);

            const response = await fetch(
                `${API.adminOrders}?${params.toString()}`,
                {
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch orders"
                );
            }

            setOrders(data.orders || []);
            setPagination(data.pagination || null);
        } catch (error) {
            console.error("Fetch admin orders error:", error);
            setError(
                error.message || "Failed to fetch orders"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, status, paymentStatus]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchOrders();
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatStatus = (value) => {
        if (!value) return "";

        return value
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );
    };

    return (
        <div className="gw-admin-page admin-orders-page">
            {/* PAGE HEADER */}
            <div className="gw-page-header">
                <div>
                    <h1 className="gw-page-title">Orders</h1>
                    <p className="gw-page-subtitle">
                        Manage customer purchases, payment verification, and fulfillment logistics
                    </p>
                </div>
            </div>

            {/* FILTER & SEARCH TOOLBAR */}
            <div className="gw-filter-bar">
                <div className="gw-search-box">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                        type="text"
                        className="gw-search-input"
                        placeholder="Search order ID, customer name or phone..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    {search && (
                        <button
                            type="button"
                            className="gw-search-clear"
                            onClick={() => setSearch("")}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    )}
                </div>

                <div className="gw-filter-dropdowns">
                    <select
                        className="gw-select"
                        value={status}
                        onChange={(event) => {
                            setStatus(event.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <select
                        className="gw-select"
                        value={paymentStatus}
                        onChange={(event) => {
                            setPaymentStatus(event.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Payments</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>

                {pagination && (
                    <div className="gw-filter-count">
                        <span>Total Orders:</span>
                        <strong>{pagination.totalOrders ?? orders.length}</strong>
                    </div>
                )}
            </div>

            {error && (
                <div className="gw-alert-banner error" style={{ marginBottom: "1.5rem" }}>
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span style={{ flex: 1 }}>{error}</span>
                    <button
                        type="button"
                        className="gw-secondary-btn"
                        style={{ height: "32px", padding: "0 0.85rem", fontSize: "0.78rem" }}
                        onClick={fetchOrders}
                    >
                        Retry
                    </button>
                </div>
            )}

            {loading ? (
                <div className="gw-state-loading">
                    <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
                    <p>Loading customer orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="gw-state-empty">
                    <i className="fa-solid fa-receipt fa-3x"></i>
                    <h3>No Orders Found</h3>
                    <p>
                        {search || status || paymentStatus
                            ? "No orders match your active search or filter criteria. Try resetting your filters."
                            : "Your store does not have any customer orders yet."}
                    </p>
                    {(search || status || paymentStatus) && (
                        <button
                            type="button"
                            className="gw-secondary-btn"
                            onClick={() => {
                                setSearch("");
                                setStatus("");
                                setPaymentStatus("");
                                setPage(1);
                            }}
                        >
                            Reset All Filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="gw-admin-card" style={{ padding: 0, overflow: "hidden" }}>
                        <div className="gw-table-responsive">
                            <table className="gw-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Payment</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order._id}>
                                            <td>
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <strong style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--gw-admin-text)" }}>
                                                        #{order._id.slice(-8).toUpperCase()}
                                                    </strong>
                                                    <span style={{ fontSize: "0.7rem", color: "#94A3B8" }} title={order._id}>
                                                        {order._id}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="admin-customer">
                                                    <strong style={{ color: "var(--gw-admin-text)", fontWeight: 600 }}>
                                                        {order.user?.name ||
                                                            order.shippingAddress?.fullName ||
                                                            "Customer"}
                                                    </strong>
                                                    <span style={{ color: "var(--gw-admin-muted)", fontSize: "0.75rem" }}>
                                                        {order.user?.email ||
                                                            order.shippingAddress?.phone ||
                                                            "-"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                <span style={{ fontSize: "0.8rem", color: "#475569" }}>
                                                    {formatDate(order.createdAt)}
                                                </span>
                                            </td>

                                            <td>
                                                <span style={{
                                                    display: "inline-block",
                                                    padding: "2px 7px",
                                                    borderRadius: "4px",
                                                    background: "#F1F5F9",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 600,
                                                    color: "#475569"
                                                }}>
                                                    {order.items?.reduce(
                                                        (total, item) => total + item.quantity,
                                                        0
                                                    ) || 0} items
                                                </span>
                                            </td>

                                            <td>
                                                <strong style={{ fontSize: "0.88rem", color: "var(--gw-admin-text)", fontWeight: 700 }}>
                                                    ₹{formatPrice(order.total)}
                                                </strong>
                                            </td>

                                            <td>
                                                <span className={`gw-badge ${order.paymentStatus}`}>
                                                    {formatStatus(order.paymentStatus)}
                                                </span>
                                            </td>

                                            <td>
                                                <span className={`gw-badge ${order.orderStatus}`}>
                                                    {formatStatus(order.orderStatus)}
                                                </span>
                                            </td>

                                            <td style={{ textAlign: "right" }}>
                                                <button
                                                    type="button"
                                                    className="gw-action-btn view"
                                                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                                                >
                                                    <i className="fa-regular fa-eye"></i>
                                                    <span>View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <div className="gw-admin-pagination">
                            <button
                                type="button"
                                className="gw-page-btn"
                                disabled={!pagination.hasPreviousPage}
                                onClick={() => {
                                    setPage((previous) => Math.max(1, previous - 1));
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                                <span>Previous</span>
                            </button>

                            <span className="gw-page-indicator">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>

                            <button
                                type="button"
                                className="gw-page-btn"
                                disabled={!pagination.hasNextPage}
                                onClick={() => {
                                    setPage((previous) => previous + 1);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                            >
                                <span>Next</span>
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}