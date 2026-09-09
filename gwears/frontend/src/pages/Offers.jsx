import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../ApiEndpoints.js";
import "./Offers.css";

export default function Offers() {
    const navigate = useNavigate();

    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    API.storeOffers
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to fetch offers"
                    );
                }

                setOffers(data.offers || []);

            } catch (error) {
                console.error(
                    "Fetch store offers error:",
                    error
                );

                setError(
                    error.message ||
                    "Failed to load offers"
                );

            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    const getDiscountText = (offer) => {
        if (offer.discountType === "percentage") {
            return `${offer.discountValue}% OFF`;
        }

        return `₹${Number(
            offer.discountValue
        ).toLocaleString("en-IN")} OFF`;
    };

    const getTargetText = (offer) => {
        if (offer.appliesTo === "store") {
            return "Across the entire store";
        }

        if (offer.appliesTo === "category") {
            return (
                `On ${offer.category?.name || "selected category"}`
            );
        }

        if (offer.appliesTo === "product") {
            return (
                `On ${offer.product?.name || "selected product"}`
            );
        }

        return "";
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };

    const handleShopNow = (offer) => {
        if (offer.appliesTo === "category") {
            if (offer.category?._id) {
                navigate(
                    `/products?category=${offer.category._id}`
                );
            } else {
                navigate("/products");
            }

            return;
        }

        if (offer.appliesTo === "product") {
            if (offer.product?._id) {
                navigate(
                    `/products/${offer.product._id}`
                );
            } else {
                navigate("/products");
            }

            return;
        }

        navigate("/products");
    };

    if (loading) {
        return (
            <main className="store-offers-page">
                <section className="offers-page-heading">
                    <p className="offers-eyebrow">
                        GWears
                    </p>

                    <h1>Offers</h1>

                    <p>
                        Exclusive offers, made for you.
                    </p>
                </section>

                <div className="store-offers-loading">
                    <span>Loading offers...</span>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="store-offers-page">
                <section className="offers-page-heading">
                    <p className="offers-eyebrow">
                        GWears
                    </p>

                    <h1>Offers</h1>
                </section>

                <div className="store-offers-state">
                    <h2>Something went wrong</h2>

                    <p>{error}</p>

                    <button
                        onClick={() =>
                            window.location.reload()
                        }
                    >
                        TRY AGAIN
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="store-offers-page">

            {/* PAGE HEADER */}

            <section className="offers-page-heading">

                <p className="offers-eyebrow">
                    GWears
                </p>

                <h1>Offers</h1>

                <p>
                    Exclusive offers on styles you love.
                </p>

            </section>


            {/* OFFERS */}

            {offers.length === 0 ? (

                <section className="store-offers-state">

                    <h2>
                        No offers at the moment
                    </h2>

                    <p>
                        Check back soon for exclusive
                        GWears deals.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/products")
                        }
                    >
                        SHOP COLLECTION
                    </button>

                </section>

            ) : (

                <section className="store-offers-grid">

                    {offers.map((offer) => (

                        <article
                            className="store-offer-card"
                            key={offer._id}
                        >

                            {/* IMAGE */}

                            <div className="store-offer-image">

                                {offer.image?.url ? (

                                    <img
                                        src={offer.image.url}
                                        alt={
                                            offer.image.alt ||
                                            offer.title
                                        }
                                    />

                                ) : (

                                    <div className="store-offer-image-placeholder">
                                        <span>
                                            GWears
                                        </span>
                                    </div>

                                )}

                                <div className="store-offer-discount">

                                    {getDiscountText(
                                        offer
                                    )}

                                </div>

                            </div>


                            {/* CONTENT */}

                            <div className="store-offer-content">

                                <p className="store-offer-target">
                                    {getTargetText(
                                        offer
                                    )}
                                </p>

                                <h2>
                                    {offer.title}
                                </h2>

                                {offer.description && (
                                    <p className="store-offer-description">
                                        {offer.description}
                                    </p>
                                )}

                                <div className="store-offer-validity">

                                    Valid until{" "}
                                    {formatDate(
                                        offer.endDate
                                    )}

                                </div>

                                <button
                                    className="store-offer-button"
                                    onClick={() =>
                                        handleShopNow(
                                            offer
                                        )
                                    }
                                >
                                    SHOP NOW
                                    <span>→</span>
                                </button>

                            </div>

                        </article>

                    ))}

                </section>

            )}

        </main>
    );
}