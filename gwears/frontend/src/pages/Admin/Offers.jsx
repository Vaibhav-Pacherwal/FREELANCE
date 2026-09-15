import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../../Environment.js";

export default function AdminOffers() {
    const navigate = useNavigate();

    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [offerToDelete, setOfferToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchOffers = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${server}/offers`, {
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch offers");
            }

            setOffers(data.offers || []);
        } catch (error) {
            console.error("Get offers error:", error);
        } finally {
            setLoading(false);
        }
    };

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
                throw new Error(data.message || "Failed to update offer status");
            }

            setOffers((prevOffers) =>
                prevOffers.map((offer) =>
                    offer._id === offerId ? data.offer : offer
                )
            );
        } catch (error) {
            console.error("Toggle offer status error:", error);
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
                throw new Error(data.message || "Failed to delete offer");
            }

            setOffers((prevOffers) =>
                prevOffers.filter((offer) => offer._id !== offerToDelete._id)
            );

            setOfferToDelete(null);
        } catch (error) {
            console.error("Delete offer error:", error);
            setErrorMessage(error.message);
            setOfferToDelete(null);
            setTimeout(() => {
                setErrorMessage("");
            }, 5000);
        } finally {
            setDeleting(false);
        }
    };

    const getDiscountBadge = (offer) => {
        if (offer.discountType === "percentage") {
            return `${offer.discountValue}% OFF`;
        }
        return `₹${Number(offer.discountValue).toLocaleString("en-IN")} OFF`;
    };

    const getAppliesToText = (offer) => {
        if (offer.appliesTo === "store") return "Entire Storewide Catalog";
        if (offer.appliesTo === "category") {
            return `Category: ${offer.category?.name || "Specified Category"}`;
        }
        if (offer.appliesTo === "product") {
            return `Product: ${offer.product?.name || "Specified Product"}`;
        }
        return "Special Selection";
    };

    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusState = (offer) => {
        const now = new Date();
        const end = new Date(offer.endDate);
        const start = new Date(offer.startDate);

        if (!offer.isActive) return { label: "Inactive", className: "inactive" };
        if (now > end) return { label: "Expired", className: "expired" };
        if (now < start) return { label: "Scheduled", className: "scheduled" };
        return { label: "Active", className: "active" };
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    return (
        <div className="gw-admin-page">
            {/* PAGE HEADER */}
            <div className="gw-page-header">
                <div>
                    <h1 className="gw-page-title">Promotions &amp; Special Offers</h1>
                    <p className="gw-page-subtitle">
                        Manage store discount campaigns, seasonal sales, and category-wide promotions
                    </p>
                </div>
                <button
                    type="button"
                    className="gw-primary-btn"
                    onClick={() => navigate("/admin/offers/new")}
                >
                    <i className="fa-solid fa-plus"></i>
                    <span>Create Offer</span>
                </button>
            </div>

            {/* ERROR NOTIFICATION TOAST */}
            {errorMessage && (
                <div className="gw-alert-toast error">
                    <div className="gw-alert-icon">
                        <i className="fa-solid fa-circle-exclamation"></i>
                    </div>
                    <div className="gw-alert-text">
                        <strong>Action Failed</strong>
                        <span>{errorMessage}</span>
                    </div>
                    <button
                        type="button"
                        className="gw-alert-close"
                        onClick={() => setErrorMessage("")}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            )}

            {/* OFFERS GRID */}
            {loading ? (
                <div className="gw-state-loading">
                    <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
                    <p>Loading promotions...</p>
                </div>
            ) : offers.length === 0 ? (
                <div className="gw-state-empty">
                    <i className="fa-solid fa-percent fa-3x"></i>
                    <h3>No Active Promotions</h3>
                    <p>
                        There are currently no offers or seasonal discount campaigns created. Create your first promotion to boost customer sales.
                    </p>
                    <button
                        type="button"
                        className="gw-primary-btn"
                        onClick={() => navigate("/admin/offers/new")}
                    >
                        <i className="fa-solid fa-plus"></i> Create Special Offer
                    </button>
                </div>
            ) : (
                <div className="gw-offers-grid">
                    {offers.map((offer) => {
                        const status = getStatusState(offer);

                        return (
                            <div className="gw-offer-card" key={offer._id}>
                                {/* IMAGE / BANNER WRAPPER */}
                                <div className="gw-offer-card-media">
                                    {offer.image?.url ? (
                                        <img
                                            src={offer.image.url}
                                            alt={offer.image.alt || offer.title}
                                            className="gw-offer-img"
                                        />
                                    ) : (
                                        <div className="gw-offer-no-image">
                                            <i className="fa-solid fa-tag"></i>
                                            <span>Seasonal Promotion</span>
                                        </div>
                                    )}

                                    <div className="gw-offer-badges">
                                        <span className="gw-offer-discount-badge">
                                            {getDiscountBadge(offer)}
                                        </span>

                                        <button
                                            type="button"
                                            className={`gw-status-pill ${status.className}`}
                                            onClick={() => handleToggleStatus(offer._id)}
                                            title="Click to toggle offer active status"
                                        >
                                            <span className="gw-status-dot"></span>
                                            <span>{status.label}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* CONTENT BODY */}
                                <div className="gw-offer-card-body">
                                    <h3 className="gw-offer-title">{offer.title}</h3>
                                    {offer.description && (
                                        <p className="gw-offer-desc">{offer.description}</p>
                                    )}

                                    <div className="gw-offer-meta-rows">
                                        <div className="gw-offer-meta-row">
                                            <span className="gw-offer-meta-key">
                                                <i className="fa-solid fa-bullseye"></i> Scope:
                                            </span>
                                            <span className="gw-offer-meta-val">
                                                {getAppliesToText(offer)}
                                            </span>
                                        </div>

                                        <div className="gw-offer-meta-row">
                                            <span className="gw-offer-meta-key">
                                                <i className="fa-regular fa-calendar-days"></i> Validity:
                                            </span>
                                            <span className="gw-offer-meta-val">
                                                {formatDate(offer.startDate)} &rarr; {formatDate(offer.endDate)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="gw-offer-card-actions">
                                    <button
                                        type="button"
                                        className="gw-action-btn edit"
                                        onClick={() => navigate(`/admin/offers/edit/${offer._id}`)}
                                    >
                                        <i className="fa-regular fa-pen-to-square"></i>
                                        <span>Edit</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="gw-action-btn delete"
                                        onClick={() => setOfferToDelete(offer)}
                                    >
                                        <i className="fa-regular fa-trash-can"></i>
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {offerToDelete && (
                <div className="gw-modal-backdrop" onClick={() => !deleting && setOfferToDelete(null)}>
                    <div className="gw-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="gw-confirm-modal-header">
                            <div className="gw-confirm-icon-wrap">
                                <i className="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <div>
                                <h3>Delete Offer</h3>
                                <p>Are you sure you want to permanently remove this promotion?</p>
                            </div>
                        </div>

                        <div className="gw-confirm-modal-body">
                            <div className="gw-confirm-target">
                                <strong>Offer:</strong> {offerToDelete.title} ({getDiscountBadge(offerToDelete)})
                            </div>
                            <div className="gw-confirm-alert">
                                <i className="fa-solid fa-circle-info"></i>
                                <span>Products currently applying this offer will immediately revert to standard pricing.</span>
                            </div>
                        </div>

                        <div className="gw-confirm-modal-actions">
                            <button
                                type="button"
                                className="gw-secondary-btn"
                                onClick={() => setOfferToDelete(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="gw-danger-btn"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <>
                                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-regular fa-trash-can"></i>
                                        <span>Confirm Delete</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}