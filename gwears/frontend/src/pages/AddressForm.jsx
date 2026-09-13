import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../ApiEndpoints.js";
import "./AddressForm.css";

export default function AddressForm() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
        isDefault: false,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const response = await fetch(API.addresses, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to save address"
                );
            }

            navigate("/checkout", {
                state: {
                    addressCreated: true,
                    addressId: data.address?._id,
                },
            });

        } catch (error) {
            console.error(
                "Create address error:",
                error
            );

            setError(
                error.message ||
                "Failed to save address"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="address-form-page">

            <div className="address-form-container">

                <div className="address-form-header">

                    <button
                        type="button"
                        className="address-back-button"
                        onClick={() => navigate("/checkout")}
                    >
                        ← Back to checkout
                    </button>

                    <p className="address-eyebrow">
                        GWears
                    </p>

                    <h1>
                        Add delivery address
                    </h1>

                    <p>
                        Enter the address where you'd
                        like your order delivered.
                    </p>

                </div>

                {error && (
                    <div className="address-form-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="address-form-grid">

                        <div className="address-field full-width">
                            <label>
                                Full name
                            </label>

                            <input
                                type="text"
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                required
                            />
                        </div>

                        <div className="address-field">
                            <label>
                                Phone number
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="10-digit mobile number"
                                maxLength={10}
                                required
                            />
                        </div>

                        <div className="address-field">
                            <label>
                                Pincode
                            </label>

                            <input
                                type="text"
                                name="pincode"
                                value={form.pincode}
                                onChange={handleChange}
                                placeholder="6-digit pincode"
                                maxLength={6}
                                required
                            />
                        </div>

                        <div className="address-field full-width">
                            <label>
                                Address line 1
                            </label>

                            <input
                                type="text"
                                name="addressLine1"
                                value={form.addressLine1}
                                onChange={handleChange}
                                placeholder="House / flat / street"
                                required
                            />
                        </div>

                        <div className="address-field full-width">
                            <label>
                                Address line 2
                            </label>

                            <input
                                type="text"
                                name="addressLine2"
                                value={form.addressLine2}
                                onChange={handleChange}
                                placeholder="Apartment, area, locality (optional)"
                            />
                        </div>

                        <div className="address-field">
                            <label>
                                City
                            </label>

                            <input
                                type="text"
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                placeholder="City"
                                required
                            />
                        </div>

                        <div className="address-field">
                            <label>
                                State
                            </label>

                            <input
                                type="text"
                                name="state"
                                value={form.state}
                                onChange={handleChange}
                                placeholder="State"
                                required
                            />
                        </div>

                        <div className="address-field full-width">
                            <label>
                                Landmark
                            </label>

                            <input
                                type="text"
                                name="landmark"
                                value={form.landmark}
                                onChange={handleChange}
                                placeholder="Nearby landmark (optional)"
                            />
                        </div>

                    </div>

                    <label className="default-address-option">

                        <input
                            type="checkbox"
                            name="isDefault"
                            checked={form.isDefault}
                            onChange={handleChange}
                        />

                        <span>
                            Save as default address
                        </span>

                    </label>

                    <button
                        className="save-address-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Saving address..."
                            : "Save address"}
                    </button>

                </form>

            </div>

        </div>
    );
}