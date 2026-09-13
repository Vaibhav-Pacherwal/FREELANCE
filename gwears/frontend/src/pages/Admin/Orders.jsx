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
        <div className="admin-orders-page">

            <div className="admin-orders-header">
                <div>
                    <p className="admin-orders-eyebrow">
                        GWears Admin
                    </p>

                    <h1>Orders</h1>

                    <p>
                        Manage customer orders and
                        fulfillment status.
                    </p>
                </div>
            </div>

            <div className="admin-orders-filters">

                <input
                    type="text"
                    placeholder="Search order, customer or phone..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                />

                <select
                    value={status}
                    onChange={(event) => {
                        setStatus(event.target.value);
                        setPage(1);
                    }}
                >
                    <option value="">
                        All statuses
                    </option>
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

                <select
                    value={paymentStatus}
                    onChange={(event) => {
                        setPaymentStatus(
                            event.target.value
                        );
                        setPage(1);
                    }}
                >
                    <option value="">
                        All payments
                    </option>
                    <option value="pending">
                        Pending
                    </option>
                    <option value="paid">
                        Paid
                    </option>
                    <option value="failed">
                        Failed
                    </option>
                    <option value="refunded">
                        Refunded
                    </option>
                </select>

            </div>

            {error && (
                <div className="admin-orders-error">
                    <span>{error}</span>

                    <button onClick={fetchOrders}>
                        Retry
                    </button>
                </div>
            )}

            {loading ? (
                <div className="admin-orders-loading">
                    Loading orders...
                </div>
            ) : orders.length === 0 ? (
                <div className="admin-orders-empty">
                    <h2>No orders found</h2>
                    <p>
                        Try changing your search or filters.
                    </p>
                </div>
            ) : (
                <>
                    <div className="admin-orders-table-wrapper">

                        <table className="admin-orders-table">

                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id}>

                                        <td>
                                            <strong>
                                                #{order._id}
                                            </strong>
                                        </td>

                                        <td>
                                            <div className="admin-customer">
                                                <strong>
                                                    {order.user?.name ||
                                                        order.shippingAddress
                                                            ?.fullName ||
                                                        "Customer"}
                                                </strong>

                                                <span>
                                                    {order.user?.email ||
                                                        order.shippingAddress
                                                            ?.phone ||
                                                        "-"}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            {formatDate(
                                                order.createdAt
                                            )}
                                        </td>

                                        <td>
                                            {order.items?.reduce(
                                                (total, item) =>
                                                    total +
                                                    item.quantity,
                                                0
                                            ) || 0}
                                        </td>

                                        <td>
                                            <strong>
                                                ₹
                                                {formatPrice(
                                                    order.total
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                            <span
                                                className={`admin-payment-status payment-${order.paymentStatus}`}
                                            >
                                                {formatStatus(
                                                    order.paymentStatus
                                                )}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`admin-order-status status-${order.orderStatus}`}
                                            >
                                                {formatStatus(
                                                    order.orderStatus
                                                )}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                className="admin-view-order-button"
                                                onClick={() =>
                                                    navigate(
                                                        `/admin/orders/${order._id}`
                                                    )
                                                }
                                            >
                                                View
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>

                    </div>

                    {pagination &&
                        pagination.totalPages > 1 && (
                            <div className="admin-orders-pagination">

                                <button
                                    disabled={
                                        !pagination.hasPreviousPage
                                    }
                                    onClick={() =>
                                        setPage(
                                            (previous) =>
                                                previous - 1
                                        )
                                    }
                                >
                                    Previous
                                </button>

                                <span>
                                    Page{" "}
                                    {pagination.currentPage}{" "}
                                    of{" "}
                                    {pagination.totalPages}
                                </span>

                                <button
                                    disabled={
                                        !pagination.hasNextPage
                                    }
                                    onClick={() =>
                                        setPage(
                                            (previous) =>
                                                previous + 1
                                        )
                                    }
                                >
                                    Next
                                </button>

                            </div>
                        )}
                </>
            )}

        </div>
    );
}