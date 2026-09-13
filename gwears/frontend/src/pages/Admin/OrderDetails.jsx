import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../ApiEndpoints.js";
import "./OrderDetails.css";

export default function AdminOrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(false);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API.adminOrders}/${id}`,
                {
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch order"
                );
            }

            setOrder(data.order);
        } catch (error) {
            console.error(
                "Fetch admin order error:",
                error
            );

            setError(
                error.message ||
                "Failed to fetch order"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const updateStatus = async (newStatus) => {
        try {
            setUpdating(true);
            setError("");

            const response = await fetch(
                `${API.adminOrders}/${id}/status`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status: newStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update order status"
                );
            }

            setOrder(data.order);
        } catch (error) {
            console.error(
                "Update order status error:",
                error
            );

            setError(
                error.message ||
                "Failed to update order status"
            );
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            }
        );
    };

    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    };

    const formatStatus = (status) => {
        if (!status) return "";

        return status
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );
    };

    if (loading) {
        return (
            <div className="admin-order-details-page">
                <div className="admin-order-loading">
                    Loading order...
                </div>
            </div>
        );
    }

    if (error && !order) {
        return (
            <div className="admin-order-details-page">
                <button
                    className="admin-back-button"
                    onClick={() =>
                        navigate("/admin/orders")
                    }
                >
                    ← Back to Orders
                </button>

                <div className="admin-order-error">
                    <h2>Unable to load order</h2>
                    <p>{error}</p>

                    <button onClick={fetchOrder}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="admin-order-details-page">

            <div className="admin-order-details-header">

                <div>
                    <button
                        className="admin-back-button"
                        onClick={() =>
                            navigate("/admin/orders")
                        }
                    >
                        ← Back to Orders
                    </button>

                    <p className="admin-order-eyebrow">
                        GWears Admin
                    </p>

                    <h1>
                        Order #{order._id}
                    </h1>

                    <p>
                        Placed on{" "}
                        {formatDate(order.createdAt)}
                    </p>
                </div>

                <div className="admin-order-status-control">

                    <label>
                        Order Status
                    </label>

                    <select
                        value={order.orderStatus}
                        disabled={
                            updating ||
                            order.orderStatus ===
                                "cancelled"
                        }
                        onChange={(event) =>
                            updateStatus(
                                event.target.value
                            )
                        }
                    >
                        <option value="pending">
                            Pending
                        </option>

                        <option value="confirmed">
                            Confirmed
                        </option>

                        <option value="processing">
                            Processing
                        </option>

                        <option value="shipped">
                            Shipped
                        </option>

                        <option value="delivered">
                            Delivered
                        </option>

                        <option value="cancelled">
                            Cancelled
                        </option>
                    </select>

                    {updating && (
                        <span>
                            Updating...
                        </span>
                    )}

                </div>

            </div>

            {error && (
                <div className="admin-order-inline-error">
                    {error}
                </div>
            )}

            <div className="admin-order-grid">

                <section className="admin-order-card">

                    <div className="admin-order-card-header">
                        <h2>Customer</h2>
                    </div>

                    <div className="admin-order-card-content">

                        <div className="admin-detail-row">
                            <span>Name</span>
                            <strong>
                                {order.user?.name ||
                                    order.shippingAddress
                                        ?.fullName ||
                                    "—"}
                            </strong>
                        </div>

                        <div className="admin-detail-row">
                            <span>Email</span>
                            <strong>
                                {order.user?.email ||
                                    "—"}
                            </strong>
                        </div>

                        <div className="admin-detail-row">
                            <span>Phone</span>
                            <strong>
                                {order.shippingAddress
                                    ?.phone || "—"}
                            </strong>
                        </div>

                    </div>

                </section>

                <section className="admin-order-card">

                    <div className="admin-order-card-header">
                        <h2>Payment</h2>
                    </div>

                    <div className="admin-order-card-content">

                        <div className="admin-detail-row">
                            <span>Method</span>
                            <strong>
                                {order.paymentMethod ===
                                "cod"
                                    ? "Cash on Delivery"
                                    : "Razorpay"}
                            </strong>
                        </div>

                        <div className="admin-detail-row">
                            <span>Status</span>
                            <strong>
                                {formatStatus(
                                    order.paymentStatus
                                )}
                            </strong>
                        </div>

                        {order.paymentId && (
                            <div className="admin-detail-row">
                                <span>Payment ID</span>
                                <strong>
                                    {order.paymentId}
                                </strong>
                            </div>
                        )}

                    </div>

                </section>

                <section className="admin-order-card admin-order-full-width">

                    <div className="admin-order-card-header">
                        <h2>Items</h2>
                    </div>

                    <div className="admin-order-items">

                        {order.items.map((item) => (
                            <div
                                className="admin-order-item"
                                key={item._id}
                            >

                                <div className="admin-item-main">

                                    <div className="admin-item-placeholder">
                                        GW
                                    </div>

                                    <div>
                                        <h3>
                                            {item.name}
                                        </h3>

                                        <p>
                                            SKU:{" "}
                                            {item.sku}
                                        </p>

                                        <div className="admin-item-attributes">
                                            {item.attributes?.map(
                                                (
                                                    attribute,
                                                    index
                                                ) => (
                                                    <span
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        {
                                                            attribute.name
                                                        }
                                                        :{" "}
                                                        {
                                                            attribute.value
                                                        }
                                                    </span>
                                                )
                                            )}
                                        </div>

                                    </div>

                                </div>

                                <div className="admin-item-pricing">

                                    <span>
                                        Qty:{" "}
                                        {item.quantity}
                                    </span>

                                    <strong>
                                        ₹
                                        {formatPrice(
                                            item.subtotal
                                        )}
                                    </strong>

                                </div>

                            </div>
                        ))}

                    </div>

                </section>

                <section className="admin-order-card">

                    <div className="admin-order-card-header">
                        <h2>Shipping Address</h2>
                    </div>

                    <div className="admin-shipping-address">

                        <strong>
                            {
                                order.shippingAddress
                                    ?.fullName
                            }
                        </strong>

                        <p>
                            {
                                order.shippingAddress
                                    ?.addressLine1
                            }
                        </p>

                        {order.shippingAddress
                            ?.addressLine2 && (
                            <p>
                                {
                                    order.shippingAddress
                                        .addressLine2
                                }
                            </p>
                        )}

                        <p>
                            {
                                order.shippingAddress
                                    ?.city
                            }
                            ,{" "}
                            {
                                order.shippingAddress
                                    ?.state
                            }{" "}
                            -{" "}
                            {
                                order.shippingAddress
                                    ?.pincode
                            }
                        </p>

                        {order.shippingAddress
                            ?.landmark && (
                            <p>
                                Landmark:{" "}
                                {
                                    order.shippingAddress
                                        .landmark
                                }
                            </p>
                        )}

                        <p>
                            Phone:{" "}
                            {
                                order.shippingAddress
                                    ?.phone
                            }
                        </p>

                    </div>

                </section>

                <section className="admin-order-card">

                    <div className="admin-order-card-header">
                        <h2>Order Summary</h2>
                    </div>

                    <div className="admin-order-summary">

                        <div>
                            <span>Subtotal</span>
                            <strong>
                                ₹
                                {formatPrice(
                                    order.subtotal
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Discount</span>
                            <strong>
                                - ₹
                                {formatPrice(
                                    order.discount
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Shipping</span>
                            <strong>
                                {order.shippingFee === 0
                                    ? "FREE"
                                    : `₹${formatPrice(
                                          order.shippingFee
                                      )}`}
                            </strong>
                        </div>

                        <div className="admin-summary-total">
                            <span>Total</span>
                            <strong>
                                ₹
                                {formatPrice(
                                    order.total
                                )}
                            </strong>
                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}