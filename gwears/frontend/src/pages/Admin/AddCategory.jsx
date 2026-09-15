import { useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../../Environment.js";

export default function AddCategory() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        group: "",
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setSaving(true);

            const response = await fetch(`${server}/categories`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    group: formData.group,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create category");
            }

            navigate("/admin/categories");
        } catch (err) {
            console.error("Create category error:", err);
            setError(err.message || "Failed to create category");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="gw-admin-page">
            <div className="gw-form-page-container">
                {/* FORM PAGE HEADER */}
                <div className="gw-page-header">
                    <div>
                        <div className="gw-back-link" onClick={() => navigate("/admin/categories")}>
                            <i className="fa-solid fa-arrow-left"></i>
                            <span>Back to Categories</span>
                        </div>
                        <h1 className="gw-page-title">Add New Category</h1>
                        <p className="gw-page-subtitle">
                            Define a new product classification group for the GWears retail store catalog
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

                {/* MAIN FORM CARD */}
                <form className="gw-form-card" onSubmit={handleSubmit}>
                    <div className="gw-form-card-header">
                        <div className="gw-form-header-icon">
                            <i className="fa-solid fa-tags"></i>
                        </div>
                        <div>
                            <h3>Category Details</h3>
                            <p>Enter the classification name, parent category group, and catalog description</p>
                        </div>
                    </div>

                    <div className="gw-form-card-body">
                        <div className="gw-form-row">
                            <div className="gw-form-group">
                                <label className="gw-label" htmlFor="name">
                                    Category Name <span className="req">*</span>
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    className="gw-input"
                                    placeholder="e.g. Graphic T-Shirts, Denim Jeans, Sneakers"
                                    value={formData.name}
                                    onChange={handleChange}
                                    maxLength={100}
                                    required
                                />
                                <span className="gw-helper-text">
                                    The customer-facing display name across storefront navigation and filters.
                                </span>
                            </div>

                            <div className="gw-form-group">
                                <label className="gw-label" htmlFor="group">
                                    Store Category Group <span className="req">*</span>
                                </label>
                                <select
                                    id="group"
                                    name="group"
                                    className="gw-select"
                                    value={formData.group}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Category Group</option>
                                    <option value="clothing">Clothing / Apparel</option>
                                    <option value="footwear">Footwear &amp; Shoes</option>
                                    <option value="accessories">Accessories &amp; Headwear</option>
                                </select>
                                <span className="gw-helper-text">
                                    Maps this category to primary departmental navigation.
                                </span>
                            </div>
                        </div>

                        <div className="gw-form-group">
                            <label className="gw-label" htmlFor="description">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                className="gw-textarea"
                                placeholder="Describe the styles and collection characteristics of products in this category..."
                                value={formData.description}
                                onChange={handleChange}
                                maxLength={500}
                                rows={4}
                            />
                            <span className="gw-helper-text">
                                Optional catalog description for internal management and SEO categorization.
                            </span>
                        </div>
                    </div>

                    <div className="gw-form-card-footer">
                        <button
                            type="button"
                            className="gw-secondary-btn"
                            onClick={() => navigate("/admin/categories")}
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
                                    <span>Creating Category...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-check"></i>
                                    <span>Create Category</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}