import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../../Environment.js";

export default function Offers() {
    const navigate = useNavigate();

    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [offerToDelete, setOfferToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");

    const fetchOffers = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${server}/offers`,
                {
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch offers"
                );
            }

            setOffers(data.offers);
        } catch (error) {
            console.error("Get offers error:", error);
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const handleToggleStatus = async (offerId) => {
        try {
            const response = await fetch(
                `${server}/offers/${offerId}/status`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update offer status"
                );
            }

            setOffers((prevOffers) =>
                prevOffers.map((offer) =>
                    offer._id === offerId
                        ? data.offer
                        : offer
                )
            );
        } catch (error) {
            console.error(
                "Toggle offer status error:",
                error
            );

            setErrorMessage(error.message);
        }
    };

    const handleDelete = async () => {
        if (!offerToDelete) return;

        try {
            setDeleting(true);

            const response = await fetch(
                `${server}/offers/${offerToDelete._id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to delete offer"
                );
            }

            setOffers((prevOffers) =>
                prevOffers.filter(
                    (offer) =>
                        offer._id !== offerToDelete._id
                )
            );

            setOfferToDelete(null);

        } catch (error) {
            console.error(
                "Delete offer error:",
                error
            );

            setErrorMessage(error.message);
            setOfferToDelete(null);

        } finally {
            setDeleting(false);
        }
    };

    const getDiscountText = (offer) => {
        if (offer.discountType === "percentage") {
            return `${offer.discountValue}% OFF`;
        }

        return `₹${offer.discountValue} OFF`;
    };


    const getAppliesToText = (offer) => {
        if (offer.appliesTo === "store") {
            return "Entire Store";
        }

        if (offer.appliesTo === "category") {
            return offer.category?.name || "Category";
        }

        if (offer.appliesTo === "product") {
            return offer.product?.name || "Product";
        }

        return "—";
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


    return (
        <div className="offers-page">

            {/* HEADER */}

            <div className="offers-header">
                <h1>Offers</h1>

                <button
                    onClick={() =>
                        navigate("/admin/offers/new")
                    }
                >
                    + Add Offer
                </button>
            </div>

            <div className="offers-grid">

                {loading ? (

                    <div className="offers-loading">
                        Loading offers...
                    </div>

                ) : offers.length === 0 ? (

                    <div className="offers-empty">
                        No offers found.
                    </div>

                ) : (

                    offers.map((offer) => (

                        <div
                            className="offer-card"
                            key={offer._id}
                        >

                            {/* IMAGE */}

                            <div className="offer-card-image">

                                {offer.image?.url ? (

                                    <img
                                        src={offer.image.url}
                                        alt={
                                            offer.image.alt ||
                                            offer.title
                                        }
                                    />

                                ) : (

                                    <div className="offer-card-no-image">
                                        No Image
                                    </div>

                                )}

                                {/* STATUS */}

                                <button
                                    className={
                                        offer.isActive
                                            ? "offer-status active"
                                            : "offer-status inactive"
                                    }
                                    onClick={() =>
                                        handleToggleStatus(
                                            offer._id
                                        )
                                    }
                                >
                                    {offer.isActive
                                        ? "Active"
                                        : "Inactive"}
                                </button>

                            </div>


                            {/* CARD CONTENT */}

                            <div className="offer-card-content">

                                <h2>
                                    {offer.title}
                                </h2>

                                {offer.description && (
                                    <p className="offer-description">
                                        {offer.description}
                                    </p>
                                )}


                                {/* DISCOUNT */}

                                <div className="offer-discount">

                                    {getDiscountText(offer)}

                                </div>


                                {/* APPLIES TO */}

                                <div className="offer-detail">

                                    <span className="offer-detail-label">
                                        Applies To
                                    </span>

                                    <span className="offer-detail-value">
                                        {getAppliesToText(offer)}
                                    </span>

                                </div>


                                {/* VALIDITY */}

                                <div className="offer-detail">

                                    <span className="offer-detail-label">
                                        Validity
                                    </span>

                                    <span className="offer-detail-value offer-validity">

                                        <span>
                                            {formatDate(
                                                offer.startDate
                                            )}
                                        </span>

                                        <span>→</span>

                                        <span>
                                            {formatDate(
                                                offer.endDate
                                            )}
                                        </span>

                                    </span>

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="offer-card-actions">

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/admin/offers/edit/${offer._id}`
                                        )
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() =>
                                        setOfferToDelete(offer)
                                    }
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))

                )}

            </div>

            {errorMessage && (

                <div className="offer-error-message">

                    <span>
                        {errorMessage}
                    </span>

                    <button
                        onClick={() =>
                            setErrorMessage("")
                        }
                    >
                        ×
                    </button>

                </div>

            )}

            {offerToDelete && (

                <div className="delete-modal-overlay">

                    <div className="delete-modal">

                        <h3>Delete Offer?</h3>

                        <p>
                            Are you sure you want to delete
                            <strong>
                                {" "}
                                {offerToDelete.title}
                            </strong>
                            ?
                        </p>

                        <p className="delete-warning">
                            This action cannot be undone.
                        </p>

                        <div className="delete-modal-actions">

                            <button
                                onClick={() =>
                                    setOfferToDelete(null)
                                }
                                disabled={deleting}
                            >
                                Cancel
                            </button>

                            <button
                                className="delete-confirm-btn"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting
                                    ? "Deleting..."
                                    : "Delete Offer"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}