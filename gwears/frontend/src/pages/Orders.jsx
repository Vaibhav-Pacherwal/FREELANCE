import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../ApiEndpoints.js";
import "./Orders.css";

export default function Orders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(API.orders, {
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch orders");
            }

            setOrders(data.orders || []);
        } catch (error) {
            console.error("Fetch orders error:", error);
            setError(error.message || "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const getStatusClass = (status) => {
        return `order-status status-${status}`;
    };

    if (loading) {
        return (
            <div className="orders-page">
                <div className="orders-container">
                    <div className="orders-loading">
                        Loading your orders...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="orders-container">

                <div className="orders-header">
                    <p className="orders-eyebrow">GWears</p>
                    <h1>My Orders</h1>
                    <p className="orders-subtitle">
                        View and track your recent orders.
                    </p>
                </div>

                {error && (
                    <div className="orders-error">
                        <span>{error}</span>
                        <button onClick={fetchOrders}>
                            Try again
                        </button>
                    </div>
                )}

                {!error && orders.length === 0 && (
                    <div className="orders-empty">
                        <h2>No orders yet</h2>
                        <p>
                            You haven't placed any orders yet.
                        </p>

                        <button
                            onClick={() => navigate("/products")}
                        >
                            Start Shopping
                        </button>
                    </div>
                )}

                {!error && orders.length > 0 && (
                    <div className="orders-list">
                        {orders.map((order) => {
                            const firstItem = order.items?.[0];

                            return (
                                <article
                                    className="order-card"
                                    key={order._id}
                                >
                                    <div className="order-card-top">

                                        <div>
                                            <p className="order-number">
                                                #{order._id}
                                            </p>

                                            <p className="order-date">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>

                                        <div className="order-meta">
                                            <span
                                                className={getStatusClass(
                                                    order.orderStatus
                                                )}
                                            >
                                                {order.orderStatus}
                                            </span>

                                            <span className="payment-method">
                                                {order.paymentMethod === "cod"
                                                    ? "COD"
                                                    : "Online Payment"}
                                            </span>
                                        </div>

                                    </div>

                                    <div className="order-card-middle">

                                        <div className="order-product-info">

                                            <div className="order-product-image">
                                                {firstItem?.product?.images?.[0]?.url ? (
                                                    <img
                                                        src={
                                                            firstItem.product
                                                                .images[0].url
                                                        }
                                                        alt={
                                                            firstItem.name ||
                                                            "Product"
                                                        }
                                                    />
                                                ) : (
                                                    <span>GW</span>
                                                )}
                                            </div>

                                            <div>
                                                <h3>
                                                    {firstItem?.name ||
                                                        "Product"}
                                                </h3>

                                                <p>
                                                    Qty:{" "}
                                                    {firstItem?.quantity || 0}
                                                </p>

                                                {order.items?.length > 1 && (
                                                    <p className="more-items">
                                                        +{" "}
                                                        {order.items.length - 1}{" "}
                                                        more item
                                                        {order.items.length - 1 >
                                                        1
                                                            ? "s"
                                                            : ""}
                                                    </p>
                                                )}
                                            </div>

                                        </div>

                                        <div className="order-price">
                                            ₹{formatPrice(order.total)}
                                        </div>

                                    </div>

                                    <div className="order-card-bottom">

                                        <div className="order-payment">
                                            Payment:{" "}
                                            <strong>
                                                {order.paymentStatus}
                                            </strong>
                                        </div>

                                        <button
                                            className="view-order-button"
                                            onClick={() =>
                                                navigate(
                                                    `/orders/${order._id}`
                                                )
                                            }
                                        >
                                            View Order
                                        </button>

                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
}