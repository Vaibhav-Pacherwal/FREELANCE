import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../ApiEndpoints";
import { useCart } from "../utils/CartContext";
import { useUserAuth } from "../utils/UserAuthContext";
import "./Checkout.css";

export default function Checkout() {
    const navigate = useNavigate();
    const { fetchCart } = useCart();
    const { user } = useUserAuth();

    const [addresses, setAddresses] = useState([]);
    const [cart, setCart] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState("");


    useEffect(() => {

        loadCheckout();

    }, []);


    const loadCheckout = async () => {

        try {

            setLoading(true);

            setError("");


            const [
                addressResponse,
                cartResponse,
            ] = await Promise.all([

                fetch(API.addresses, {
                    credentials: "include",
                }),

                fetch(API.cart, {
                    credentials: "include",
                }),

            ]);


            const addressData =
                await addressResponse.json();

            const cartData =
                await cartResponse.json();


            if (!addressResponse.ok) {

                throw new Error(
                    addressData.message ||
                    "Failed to load addresses"
                );

            }


            if (!cartResponse.ok) {

                throw new Error(
                    cartData.message ||
                    "Failed to load cart"
                );

            }


            const userAddresses =
                addressData.addresses || [];


            const userCart =
                cartData.cart;


            if (
                !userCart ||
                !userCart.items ||
                userCart.items.length === 0
            ) {

                navigate("/cart");

                return;

            }


            setAddresses(
                userAddresses
            );

            setCart(
                userCart
            );


            const defaultAddress =
                userAddresses.find(
                    (address) =>
                        address.isDefault
                );


            if (defaultAddress) {

                setSelectedAddress(
                    defaultAddress._id
                );

            } else if (
                userAddresses.length > 0
            ) {

                setSelectedAddress(
                    userAddresses[0]._id
                );

            }


        } catch (error) {

            console.error(
                "Checkout loading error:",
                error
            );

            setError(
                error.message ||
                "Failed to load checkout"
            );

        } finally {

            setLoading(false);

        }

    };


    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                return resolve(true);
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            setError("Please select a delivery address to proceed.");
            return;
        }

        try {
            setPlacingOrder(true);
            setError("");

            const isLoaded = await loadRazorpayScript();
            if (!isLoaded || !window.Razorpay) {
                throw new Error("Unable to load secure payment gateway. Please check your internet connection.");
            }

            const response = await fetch(API.razorpayCreate, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    addressId: selectedAddress,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to initiate payment");
            }

            const selectedAddressObj = addresses.find(
                (addr) => addr._id === selectedAddress
            );

            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency || "INR",
                name: "GWears",
                description: "Luxury Fashion & Footwear Order",
                order_id: data.razorpayOrderId,
                prefill: {
                    name: selectedAddressObj?.fullName || user?.name || "",
                    email: user?.email || "",
                    contact: selectedAddressObj?.phone || user?.phone || "",
                },
                theme: {
                    color: "#111111",
                },
                modal: {
                    ondismiss: function () {
                        setPlacingOrder(false);
                        setError("Payment was cancelled or closed. Your cart remains intact.");
                    },
                },
                handler: async function (paymentResponse) {
                    try {
                        setPlacingOrder(true);
                        setError("");

                        const verifyResponse = await fetch(API.razorpayVerify, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                orderId: data.orderId,
                                razorpayOrderId: paymentResponse.razorpay_order_id,
                                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                                razorpaySignature: paymentResponse.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyResponse.json();

                        if (!verifyResponse.ok || !verifyData.success) {
                            throw new Error(
                                verifyData.message || "Payment verification failed. Please contact support."
                            );
                        }

                        // Synchronize cart state across the application
                        await fetchCart();

                        // Navigate to order confirmation
                        navigate(`/orders/${data.orderId}`);
                    } catch (verifyError) {
                        console.error("Verification error:", verifyError);
                        setError(
                            verifyError.message ||
                            "Payment verification failed. If your money was debited, it will be refunded or please contact support."
                        );
                        setPlacingOrder(false);
                    }
                },
            };

            const razorpayInstance = new window.Razorpay(options);

            razorpayInstance.on("payment.failed", function (failureResponse) {
                console.error("Payment failed:", failureResponse.error);
                setError(
                    failureResponse.error?.description ||
                    "Payment failed. Your cart has been saved. Please try again."
                );
                setPlacingOrder(false);
            });

            razorpayInstance.open();

        } catch (error) {
            console.error("Payment initiation error:", error);
            setError(
                error.message ||
                "Failed to initiate payment. Please try again."
            );
            setPlacingOrder(false);
        }
    };


    if (loading) {

        return (
            <div className="checkout-page">

                <p>
                    Loading checkout...
                </p>

            </div>
        );

    }


    return (
        <div className="checkout-page">

            <div className="checkout-container">

                <h1>
                    Checkout
                </h1>


                {error && (

                    <div className="checkout-error">
                        {error}
                    </div>

                )}


                {/* ADDRESS */}

                <section className="checkout-section">

                    <div className="checkout-section-header">

                        <h2>
                            Delivery address
                        </h2>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/addresses/new"
                                )
                            }
                        >
                            + Add address
                        </button>

                    </div>


                    {addresses.length === 0 ? (

                        <div className="no-address">

                            <p>
                                You don't have a
                                saved address.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/addresses/new"
                                    )
                                }
                            >
                                Add delivery address
                            </button>

                        </div>

                    ) : (

                        <div className="address-list">

                            {addresses.map(
                                (address) => (

                                    <label
                                        key={
                                            address._id
                                        }
                                        className="address-card"
                                    >

                                        <input
                                            type="radio"
                                            name="address"
                                            value={
                                                address._id
                                            }
                                            checked={
                                                selectedAddress ===
                                                address._id
                                            }
                                            onChange={
                                                (event) =>
                                                    setSelectedAddress(
                                                        event.target.value
                                                    )
                                            }
                                        />

                                        <div>

                                            <strong>
                                                {
                                                    address.fullName
                                                }
                                            </strong>

                                            <p>
                                                {
                                                    address.addressLine1
                                                }
                                            </p>

                                            {address.addressLine2 && (

                                                <p>
                                                    {
                                                        address.addressLine2
                                                    }
                                                </p>

                                            )}

                                            <p>
                                                {
                                                    address.city
                                                }
                                                ,{" "}
                                                {
                                                    address.state
                                                }{" "}
                                                -{" "}
                                                {
                                                    address.pincode
                                                }
                                            </p>

                                            <p>
                                                Phone:{" "}
                                                {
                                                    address.phone
                                                }
                                            </p>

                                            {address.isDefault && (

                                                <span>
                                                    Default
                                                </span>

                                            )}

                                        </div>

                                    </label>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* ORDER SUMMARY */}

                <section className="checkout-section">

                    <h2>
                        Order summary
                    </h2>


                    <div className="checkout-items">

                        {cart.items.map(
                            (item) => (

                                <div
                                    className="checkout-item"
                                    key={
                                        item._id
                                    }
                                >

                                    <div>

                                        <strong>
                                            {
                                                item.product?.name
                                            }
                                        </strong>

                                        <p>
                                            Qty:{" "}
                                            {
                                                item.quantity
                                            }
                                        </p>

                                    </div>


                                    <div>

                                        <span>
                                            ₹
                                            {
                                                item.subtotal?.toLocaleString(
                                                    "en-IN"
                                                )
                                            }
                                        </span>

                                    </div>

                                </div>

                            )
                        )}

                    </div>


                    <div className="checkout-total-row">

                        <span>
                            Subtotal
                        </span>

                        <strong>
                            ₹
                            {
                                cart.subtotal?.toLocaleString(
                                    "en-IN"
                                )
                            }
                        </strong>

                    </div>


                    <div className="checkout-total-row">

                        <span>
                            Shipping
                        </span>

                        <strong>
                            FREE
                        </strong>

                    </div>


                    <div className="checkout-total-row checkout-grand-total">

                        <span>
                            Total
                        </span>

                        <strong>
                            ₹
                            {
                                cart.subtotal?.toLocaleString(
                                    "en-IN"
                                )
                            }
                        </strong>

                    </div>

                </section>


                {/* PAYMENT */}
                <section className="checkout-section">
                    <h2>Payment method</h2>

                    <div className="payment-options">
                        <div className="payment-card active">
                            <input
                                type="radio"
                                id="payment-razorpay"
                                name="payment"
                                value="razorpay"
                                checked={true}
                                readOnly
                            />
                            <div className="payment-card-content">
                                <div className="payment-title-row">
                                    <strong>Online Payment</strong>
                                    <span className="secure-badge">
                                        <i className="fa-solid fa-lock"></i> 100% Secure
                                    </span>
                                </div>
                                <p>Pay securely via UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking or Wallets.</p>
                                <div className="payment-methods-logos">
                                    <span className="payment-pill">UPI</span>
                                    <span className="payment-pill">Cards</span>
                                    <span className="payment-pill">NetBanking</span>
                                    <span className="payment-pill">Wallets</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PLACE ORDER */}
                <button
                    className="place-order-button"
                    type="button"
                    disabled={
                        placingOrder ||
                        !selectedAddress
                    }
                    onClick={
                        handlePlaceOrder
                    }
                >
                    {placingOrder
                        ? "Opening Payment..."
                        : `Pay ₹${cart?.subtotal?.toLocaleString("en-IN")}`}
                </button>

            </div>

        </div>
    );
}