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

        </div>
    );
};

export default OrderDetails;