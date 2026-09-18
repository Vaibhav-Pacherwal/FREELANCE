import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API from "../ApiEndpoints.js";
import "./OrderDetails.css";

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [retryingPayment, setRetryingPayment] = useState(false);

    const canCancelOrder = ["pending", "confirmed", "processing"].includes(
        order?.orderStatus
    );

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`${API.orders}/${id}`, {
                    credentials: "include",
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data.message || "Failed to fetch order"
                    );
                }

                setOrder(data.order);
            } catch (error) {
                console.error("Fetch order error:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="orderDetailsPage">
                <p>Loading order...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orderDetailsPage">
                <div className="orderError">
                    <h2>Unable to load order</h2>
                    <p>{error}</p>

                    <button onClick={() => navigate("/orders")}>
                        View Orders
                    </button>
                </div>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const handleCancelOrder = async () => {
        try {
            setCancelling(true);
            setError("");

            const response = await fetch(
                `${API.orders}/${order._id}/cancel`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to cancel order"
                );
            }

            setOrder(data.order);
            setShowCancelModal(false);
        } catch (error) {
            console.error("Cancel order error:", error);
            setError(error.message || "Failed to cancel order");
        } finally {
            setCancelling(false);
        }
    };

    const handleRetryPayment = async () => {
        try {
            setRetryingPayment(true);
            setError("");

            const res = await fetch(API.razorpayCreate, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ orderId: order._id }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to initiate payment retry");
            }

            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency || "INR",
                name: "GWears",
                description: "Order Payment",
                order_id: data.razorpayOrderId,
                prefill: {
                    name: order.shippingAddress?.fullName || "",
                    contact: order.shippingAddress?.phone || "",
                },
                theme: { color: "#111111" },
                handler: async function (paymentResponse) {
                    try {
                        const verifyRes = await fetch(API.razorpayVerify, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({
                                orderId: order._id,
                                razorpayOrderId: paymentResponse.razorpay_order_id,
                                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                                razorpaySignature: paymentResponse.razorpay_signature,
                            }),
                        });
                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok && verifyData.success) {
                            setOrder(verifyData.order);
                        } else {
                            setError(verifyData.message || "Payment verification failed");
                        }
                    } catch (err) {
                        setError(err.message || "Payment verification failed");
                    }
                },
                modal: {
                    ondismiss: function () {
                        setRetryingPayment(false);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            setError(err.message || "Failed to retry payment");
        } finally {
            setRetryingPayment(false);
        }
    };

    return (
        <div className="orderDetailsPage">

            <div className="orderDetailsHeader">
                <div>
                    <p className="orderEyebrow">
                        GWears / Order
                    </p>

                    <h1>Order Details</h1>

                    <p>
                        Order #{order._id}
                    </p>
                </div>

                <button
                    className="backButton"
                    onClick={() => navigate("/orders")}
                >
                    Back to Orders
                </button>
            </div>

            <div className="orderStatusSection">

                <div>
                    <span>Order Status</span>
                    <strong>{order.orderStatus}</strong>
                </div>

                <div>
                    <span>Payment</span>
                    <strong>{order.paymentStatus}</strong>
                </div>

                <div>
                    <span>Payment Method</span>
                    <strong>
                        {order.paymentMethod === "cod"
                            ? "Cash on Delivery"
                            : "Razorpay"}
                    </strong>
                </div>

                <div>
                    <span>Placed On</span>
                    <strong>
                        {formatDate(order.createdAt)}
                    </strong>
                </div>

            </div>

            <div className="order-actions-row" style={{ display: "flex", gap: "12px", marginBottom: "25px", flexWrap: "wrap" }}>
                {order.paymentMethod === "razorpay" && order.paymentStatus === "pending" && order.orderStatus === "pending" && (
                    <button
                        type="button"
                        style={{
                            background: "#111111",
                            color: "#FFFFFF",
                            border: "none",
                            padding: "12px 24px",
                            fontSize: "13px",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            cursor: "pointer",
                        }}
                        onClick={handleRetryPayment}
                        disabled={retryingPayment}
                    >
                        {retryingPayment ? "Opening Payment..." : "Complete Payment Now"}
                    </button>
                )}

                {canCancelOrder && (
                    <button
                        type="button"
                        className="cancel-order-button"
                        onClick={() => setShowCancelModal(true)}
                        disabled={cancelling}
                    >
                        Cancel Order
                    </button>
                )}
            </div>

            <div className="orderDetailsGrid">

                <section className="orderItemsCard">

                    <h2>Items</h2>

                    {order.items.map((item) => (
                        <div
                            className="orderItem"
                            key={item._id}
                        >

                            <div className="orderItemImage">
                                <img
                                    src={
                                        item.product?.images?.[0]?.url ||
                                        "/images/placeholder.jpg"
                                    }
                                    alt={item.name}
                                />
                            </div>

                            <div className="orderItemInfo">

                                <h3>{item.name}</h3>

                                <p>
                                    SKU: {item.sku}
                                </p>

                                {item.attributes?.length > 0 && (
                                    <div className="orderItemAttributes">
                                        {item.attributes.map(
                                            (attribute, index) => (
                                                <span
                                                    key={index}
                                                >
                                                    {attribute.name}:{" "}
                                                    {attribute.value}
                                                </span>
                                            )
                                        )}
                                    </div>
                                )}

                                <p>
                                    Quantity: {item.quantity}
                                </p>

                            </div>

                            <div className="orderItemPrice">

                                {item.discountAmount > 0 && (
                                    <span className="orderItemOriginalPrice">
                                        ₹
                                        {item.originalPrice.toLocaleString(
                                            "en-IN"
                                        )}
                                    </span>
                                )}

                                <strong>
                                    ₹
                                    {item.finalPrice.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>

                                <span>
                                    ₹
                                    {item.subtotal.toLocaleString(
                                        "en-IN"
                                    )}
                                </span>

                            </div>

                        </div>
                    ))}

                </section>

                <aside>

                    <section className="shippingCard">

                        <h2>Shipping Address</h2>

                        <p className="shippingName">
                            {order.shippingAddress.fullName}
                        </p>

                        <p>
                            {order.shippingAddress.addressLine1}
                        </p>

                        {order.shippingAddress.addressLine2 && (
                            <p>
                                {order.shippingAddress.addressLine2}
                            </p>
                        )}

                        {order.shippingAddress.landmark && (
                            <p>
                                {order.shippingAddress.landmark}
                            </p>
                        )}

                        <p>
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state}
                        </p>

                        <p>
                            {order.shippingAddress.pincode}
                        </p>

                        <p>
                            Phone: {order.shippingAddress.phone}
                        </p>

                    </section>

                    <section className="orderSummaryCard">

                        <h2>Order Summary</h2>

                        <div>
                            <span>Subtotal</span>
                            <span>
                                ₹
                                {order.subtotal.toLocaleString(
                                    "en-IN"
                                )}
                            </span>
                        </div>

                        <div>
                            <span>Discount</span>
                            <span>
                                - ₹
                                {order.discount.toLocaleString(
                                    "en-IN"
                                )}
                            </span>
                        </div>

                        <div>
                            <span>Shipping</span>
                            <span>
                                {order.shippingFee === 0
                                    ? "FREE"
                                    : `₹${order.shippingFee.toLocaleString(
                                        "en-IN"
                                    )}`}
                            </span>
                        </div>

                        <div className="orderTotal">
                            <strong>Total</strong>
                            <strong>
                                ₹
                                {order.total.toLocaleString(
                                    "en-IN"
                                )}
                            </strong>
                        </div>

                    </section>

                </aside>

            </div>

            {showCancelModal && (
                <div
                    className="cancel-modal-overlay"
                    onClick={() => {
                        if (!cancelling) {
                            setShowCancelModal(false);
                        }
                    }}
                >
                    <div
                        className="cancel-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2>Cancel this order?</h2>

                        <p>
                            Are you sure you want to cancel this order?
                            This action cannot be undone.
                        </p>

                        <div className="cancel-modal-actions">
                            <button
                                type="button"
                                className="keep-order-button"
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelling}
                            >
                                Keep Order
                            </button>

                            <button
                                type="button"
                                className="confirm-cancel-button"
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                            >
                                {cancelling
                                    ? "Cancelling..."
                                    : "Cancel Order"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OrderDetails;