import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import server from "../../Environment.js";

export default function EditOffer() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        appliesTo: "store",
        category: "",
        product: "",
        startDate: "",
        endDate: "",
        imageAlt: "",
    });

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    const [existingImage, setExistingImage] = useState(null);
    const [newImage, setNewImage] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // -----------------------------
    // Format MongoDB date for datetime-local input
    // -----------------------------
    const formatDateForInput = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // -----------------------------
    // Fetch offer, categories, products
    // -----------------------------
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [offerResponse, categoryResponse, productResponse] = await Promise.all([
                    fetch(`${server}/offers/${id}`, { credentials: "include" }),
                    fetch(`${server}/categories`, { credentials: "include" }),
                    fetch(`${server}/products?limit=1000`, { credentials: "include" }),
                ]);

                const offerData = await offerResponse.json();
                const categoryData = await categoryResponse.json();
                const productData = await productResponse.json();

                if (!offerResponse.ok) {
                    throw new Error(offerData.message || "Failed to fetch offer");
                }
                if (!categoryResponse.ok) {
                    throw new Error(categoryData.message || "Failed to fetch categories");
                }
                if (!productResponse.ok) {
                    throw new Error(productData.message || "Failed to fetch products");
                }

                const offer = offerData.offer;

                setFormData({
                    title: offer.title || "",
                    description: offer.description || "",
                    discountType: offer.discountType || "percentage",
                    discountValue: offer.discountValue ?? "",
                    appliesTo: offer.appliesTo || "store",
                    category: offer.category?._id || offer.category || "",
                    product: offer.product?._id || offer.product || "",
                    startDate: formatDateForInput(offer.startDate),
                    endDate: formatDateForInput(offer.endDate),
                    imageAlt: offer.image?.alt || "",
                });

                setExistingImage(offer.image?.url ? offer.image : null);
                setCategories(categoryData.categories || []);
                setProducts(productData.products || []);
            } catch (err) {
                console.error("Edit offer fetch error:", err);
                setError(err.message || "Failed to fetch offer details");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAppliesToChange = (e) => {
        const value = e.target.value;
        setFormData((prev) => ({
            ...prev,
            appliesTo: value,
            category: "",
            product: "",
        }));
    };

    const removeExistingImage = () => {
        setExistingImage(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Only image files (JPG, PNG, WebP) are allowed");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be less than 5MB");
            e.target.value = "";
            return;
        }

        setError("");

        if (newImage?.preview) {
            URL.revokeObjectURL(newImage.preview);
        }

        const imageObject = {
            file,
            preview: URL.createObjectURL(file),
        };

        setNewImage(imageObject);
        setExistingImage(null);
        e.target.value = "";
    };

    const removeNewImage = () => {
        if (newImage?.preview) {
            URL.revokeObjectURL(newImage.preview);
        }
        setNewImage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!existingImage && !newImage) {
            setError("Offer campaign image is required");
            return;
        }

        if (formData.discountType === "percentage" && Number(formData.discountValue) > 100) {
            setError("Percentage discount cannot exceed 100%");
            return;
        }

        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            setError("Campaign End Date must be after the Start Date");
            return;
        }

        if (formData.appliesTo === "category" && !formData.category) {
            setError("Please select the target category for this promotion");
            return;
        }

        if (formData.appliesTo === "product" && !formData.product) {
            setError("Please select the target product for this promotion");
            return;
        }

        try {
            setSaving(true);

            const data = new FormData();
            data.append("title", formData.title.trim());
            data.append("description", formData.description.trim());
            data.append("discountType", formData.discountType);
            data.append("discountValue", formData.discountValue);
            data.append("appliesTo", formData.appliesTo);
            data.append("category", formData.appliesTo === "category" ? formData.category : "");
            data.append("product", formData.appliesTo === "product" ? formData.product : "");
            data.append("startDate", formData.startDate);
            data.append("endDate", formData.endDate);
            data.append("imageAlt", formData.imageAlt.trim() || formData.title.trim());
            data.append("keepExistingImage", existingImage ? "true" : "false");

            if (newImage) {
                data.append("image", newImage.file);
            }

            const response = await fetch(`${server}/offers/${id}`, {
                method: "PUT",
                credentials: "include",
                body: data,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to update offer");
            }

            navigate("/admin/offers");
        } catch (err) {
            console.error("Update offer error:", err);
            setError(err.message || "Failed to update offer");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="gw-admin-page">
                <div className="gw-state-loading">
                    <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
                    <p>Loading offer details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="gw-admin-page">
            <div className="gw-form-page-container">
                {/* PAGE HEADER */}
                <div className="gw-page-header">
                    <div>
                        <div className="gw-back-link" onClick={() => navigate("/admin/offers")}>
                            <i className="fa-solid fa-arrow-left"></i>
                            <span>Back to Offers</span>
                        </div>
                        <h1 className="gw-page-title">Edit Special Offer</h1>
                        <p className="gw-page-subtitle">
                            Update campaign details, discount parameters, and catalog scope rules
                        </p>
                    </div>
                </div>

                {/* ERROR ALERT */}
                {error && (
                    <div className="gw-alert-toast error" style={{ marginBottom: "1.5rem" }}>
                        <div className="gw-alert-icon">
                            <i className="fa-solid fa-circle-exclamation"></i>
                        </div>
                        <div className="gw-alert-text">
                            <strong>Validation Error</strong>
                            <span>{error}</span>
                        </div>
                        <button type="button" className="gw-alert-close" onClick={() => setError("")}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                )}

                <form className="gw-form-layout" onSubmit={handleSubmit}>
                    {/* SECTION 1: PROMOTION OVERVIEW */}
                    <div className="gw-form-card">
                        <div className="gw-form-card-header">
                            <div className="gw-form-header-icon">
                                <i className="fa-solid fa-bullhorn"></i>
                            </div>
                            <div>
                                <h3>Promotion Overview</h3>
                                <p>Campaign title, description, and promotional banner</p>
                            </div>
                        </div>

                        <div className="gw-form-card-body">
                            <div className="gw-form-group">
                                <label className="gw-label" htmlFor="title">
                                    Offer Title <span className="req">*</span>
                                </label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    className="gw-input"
                                    placeholder="e.g. End of Season Sale, Festive Flat 20% Off"
                                    value={formData.title}
                                    onChange={handleChange}
                                    maxLength={150}
                                    required
                                />
                            </div>

                            <div className="gw-form-group">
                                <label className="gw-label" htmlFor="description">
                                    Campaign Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    className="gw-textarea"
                                    placeholder="Add details about terms, highlights, and promotional highlights..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    maxLength={500}
                                    rows={3}
                                />
                            </div>

                            {/* BANNER PREVIEW / UPLOAD */}
                            <div className="gw-form-group">
                                <label className="gw-label">
                                    Campaign Banner Image <span className="req">*</span>
                                </label>

                                {existingImage && !newImage && (
                                    <div className="gw-image-preview-box">
                                        <img
                                            src={existingImage.url}
                                            alt={existingImage.alt || formData.title}
                                            className="gw-offer-form-preview"
                                        />
                                        <div className="gw-image-preview-actions">
                                            <label className="gw-img-replace-btn">
                                                <i className="fa-solid fa-arrows-rotate"></i> Replace Banner
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    style={{ display: "none" }}
                                                />
                                            </label>
                                            <button
                                                type="button"
                                                className="gw-img-remove-btn"
                                                onClick={removeExistingImage}
                                            >
                                                <i className="fa-solid fa-trash"></i> Remove
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {newImage && (
                                    <div className="gw-image-preview-box">
                                        <img
                                            src={newImage.preview}
                                            alt="New offer preview"
                                            className="gw-offer-form-preview"
                                        />
                                        <div className="gw-image-preview-actions">
                                            <button
                                                type="button"
                                                className="gw-img-remove-btn"
                                                onClick={removeNewImage}
                                            >
                                                <i className="fa-solid fa-trash"></i> Remove New Image
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!existingImage && !newImage && (
                                    <label className="gw-dropzone">
                                        <i className="fa-solid fa-cloud-arrow-up fa-2x"></i>
                                        <span>Click or drag image to upload banner</span>
                                        <span className="gw-dropzone-sub">JPG, PNG, or WebP up to 5MB</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{ display: "none" }}
                                        />
                                    </label>
                                )}
                            </div>

                            <div className="gw-form-group">
                                <label className="gw-label" htmlFor="imageAlt">
                                    Banner Image Alt Text
                                </label>
                                <input
                                    id="imageAlt"
                                    name="imageAlt"
                                    type="text"
                                    className="gw-input"
                                    placeholder="e.g. End of Season festive promotion banner"
                                    value={formData.imageAlt}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: DISCOUNT & SCOPE */}
                    <div className="gw-form-card">
                        <div className="gw-form-card-header">
                            <div className="gw-form-header-icon">
                                <i className="fa-solid fa-percent"></i>
                            </div>
                            <div>
                                <h3>Discount &amp; Scope Rules</h3>
                                <p>Set the discount rate and define which catalog items qualify</p>
                            </div>
                        </div>

                        <div className="gw-form-card-body">
                            <div className="gw-form-row">
                                <div className="gw-form-group">
                                    <label className="gw-label" htmlFor="discountType">
                                        Discount Type <span className="req">*</span>
                                    </label>
                                    <select
                                        id="discountType"
                                        name="discountType"
                                        className="gw-select"
                                        value={formData.discountType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="percentage">Percentage Discount (% Off)</option>
                                        <option value="fixed">Fixed Price Discount (₹ Off)</option>
                                    </select>
                                </div>

                                <div className="gw-form-group">
                                    <label className="gw-label" htmlFor="discountValue">
                                        Discount Value <span className="req">*</span>
                                    </label>
                                    <input
                                        id="discountValue"
                                        name="discountValue"
                                        type="number"
                                        min="1"
                                        className="gw-input"
                                        placeholder={formData.discountType === "percentage" ? "e.g. 15 (for 15%)" : "e.g. 500 (for ₹500)"}
                                        value={formData.discountValue}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="gw-form-group">
                                <label className="gw-label">
                                    Catalog Scope (Applies To) <span className="req">*</span>
                                </label>
                                <div className="gw-radio-pills">
                                    <label className={`gw-radio-pill ${formData.appliesTo === "store" ? "active" : ""}`}>
                                        <input
                                            type="radio"
                                            name="appliesTo"
                                            value="store"
                                            checked={formData.appliesTo === "store"}
                                            onChange={handleAppliesToChange}
                                        />
                                        <i className="fa-solid fa-store"></i>
                                        <span>Entire Storewide Catalog</span>
                                    </label>

                                    <label className={`gw-radio-pill ${formData.appliesTo === "category" ? "active" : ""}`}>
                                        <input
                                            type="radio"
                                            name="appliesTo"
                                            value="category"
                                            checked={formData.appliesTo === "category"}
                                            onChange={handleAppliesToChange}
                                        />
                                        <i className="fa-solid fa-tags"></i>
                                        <span>Specific Category</span>
                                    </label>

                                    <label className={`gw-radio-pill ${formData.appliesTo === "product" ? "active" : ""}`}>
                                        <input
                                            type="radio"
                                            name="appliesTo"
                                            value="product"
                                            checked={formData.appliesTo === "product"}
                                            onChange={handleAppliesToChange}
                                        />
                                        <i className="fa-solid fa-box"></i>
                                        <span>Single Specific Product</span>
                                    </label>
                                </div>
                            </div>

                            {formData.appliesTo === "category" && (
                                <div className="gw-form-group">
                                    <label className="gw-label" htmlFor="category">
                                        Target Category <span className="req">*</span>
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        className="gw-select"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">-- Choose Category --</option>
                                        {categories.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.name} {c.group ? `(${c.group.toUpperCase()})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {formData.appliesTo === "product" && (
                                <div className="gw-form-group">
                                    <label className="gw-label" htmlFor="product">
                                        Target Product <span className="req">*</span>
                                    </label>
                                    <select
                                        id="product"
                                        name="product"
                                        className="gw-select"
                                        value={formData.product}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">-- Choose Product --</option>
                                        {products.map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION 3: SCHEDULE */}
                    <div className="gw-form-card">
                        <div className="gw-form-card-header">
                            <div className="gw-form-header-icon">
                                <i className="fa-solid fa-calendar-days"></i>
                            </div>
                            <div>
                                <h3>Campaign Schedule</h3>
                                <p>Set promotional active window dates and validity duration</p>
                            </div>
                        </div>

                        <div className="gw-form-card-body">
                            <div className="gw-form-row">
                                <div className="gw-form-group">
                                    <label className="gw-label" htmlFor="startDate">
                                        Start Date &amp; Time <span className="req">*</span>
                                    </label>
                                    <input
                                        id="startDate"
                                        name="startDate"
                                        type="datetime-local"
                                        className="gw-input"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="gw-form-group">
                                    <label className="gw-label" htmlFor="endDate">
                                        End Date &amp; Time <span className="req">*</span>
                                    </label>
                                    <input
                                        id="endDate"
                                        name="endDate"
                                        type="datetime-local"
                                        className="gw-input"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FORM FOOTER ACTIONS */}
                    <div className="gw-form-actions">
                        <button
                            type="button"
                            className="gw-secondary-btn"
                            onClick={() => navigate("/admin/offers")}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="gw-primary-btn"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                                    <span>Saving Changes...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-check"></i>
                                    <span>Update Offer</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}