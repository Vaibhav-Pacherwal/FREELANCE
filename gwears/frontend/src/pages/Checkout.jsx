import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import API from "../ApiEndpoints";

import "./Checkout.css";


export default function Checkout() {

    const navigate =
        useNavigate();


    const [addresses, setAddresses] =
        useState([]);

    const [cart, setCart] =
        useState(null);

    const [selectedAddress, setSelectedAddress] =
        useState("");

    const [paymentMethod, setPaymentMethod] =
        useState("cod");

    const [loading, setLoading] =
        useState(true);

    const [placingOrder, setPlacingOrder] =
        useState(false);

    const [error, setError] =
        useState("");


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


    const handlePlaceOrder = async () => {

        if (!selectedAddress) {

            setError(
                "Please select a delivery address"
            );

            return;

        }


        try {

            setPlacingOrder(true);

            setError("");


            const response =
                await fetch(
                    API.orders,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        credentials:
                            "include",

                        body: JSON.stringify({

                            addressId:
                                selectedAddress,

                            paymentMethod,

                        }),

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to place order"
                );

            }


            /*
             * COD is immediately confirmed.
             *
             * Razorpay will be handled
             * separately later.
             */
            navigate(
                `/orders/${data.order._id}`
            );


        } catch (error) {

            console.error(
                "Place order error:",
                error
            );

            setError(
                error.message ||
                "Failed to place order"
            );

        } finally {

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

                    <h2>
                        Payment method
                    </h2>


                    <label className="payment-option">

                        <input
                            type="radio"
                            name="payment"
                            value="cod"
                            checked={
                                paymentMethod ===
                                "cod"
                            }
                            onChange={() =>
                                setPaymentMethod(
                                    "cod"
                                )
                            }
                        />

                        <span>
                            Cash on Delivery
                        </span>

                    </label>


                    <label className="payment-option">

                        <input
                            type="radio"
                            name="payment"
                            value="razorpay"
                            checked={
                                paymentMethod ===
                                "razorpay"
                            }
                            onChange={() =>
                                setPaymentMethod(
                                    "razorpay"
                                )
                            }
                        />

                        <span>
                            Online Payment
                        </span>

                    </label>

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
                        ? "Placing order..."
                        : "Place order"}

                </button>

            </div>

        </div>
    );
}