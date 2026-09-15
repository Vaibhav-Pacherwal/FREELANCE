import { useEffect, useState } from "react";
import server from "../../Environment.js";

export default function Settings() {
    const [form, setForm] = useState({
        storeName: "",
        phone: "",
        whatsapp: "",
        about: "",
        address: "",
        googleMapsUrl: "",
        openingHours: "",
        instagram: "",
    });

    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const [storeImages, setStoreImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [removeImages, setRemoveImages] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // --------------------------------
    // Fetch settings
    // --------------------------------
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);

                const response = await fetch(`${server}/settings`, {
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch settings");
                }

                const settings = data.settings;
                if (!settings) return;

                setForm({
                    storeName: settings.storeName || "",
                    phone: settings.phone || "",
                    whatsapp: settings.whatsapp || "",
                    about: settings.about || "",
                    address: settings.address || "",
                    googleMapsUrl: settings.googleMapsUrl || "",
                    openingHours: settings.openingHours || "",
                    instagram: settings.instagram || "",
                });

                setLogoPreview(settings.logo?.url || null);
                setStoreImages(settings.storeImages || []);
            } catch (error) {
                console.error("Get settings error:", error);
                setErrorMessage(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setErrorMessage("Only image files are allowed for logo");
            return;
        }

        setLogo(file);
        setLogoPreview(URL.createObjectURL(file));
        setErrorMessage("");
    };

    const handleRemoveLogo = () => {
        if (logoPreview && logo) {
            URL.revokeObjectURL(logoPreview);
        }
        setLogo(null);
        setLogoPreview(null);
    };

    const handleStoreImagesChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const invalidFile = files.find((f) => !f.type.startsWith("image/"));
        if (invalidFile) {
            setErrorMessage("Only image files are allowed for store gallery");
            e.target.value = "";
            return;
        }

        setNewImages((prev) => [...prev, ...files]);
        setErrorMessage("");
        e.target.value = "";
    };

    const handleRemoveExistingImage = (imageId) => {
        setRemoveImages((prev) => [...prev, imageId]);
        setStoreImages((prev) => prev.filter((img) => img._id !== imageId));
    };

    const handleRemoveNewImage = (index) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setMessage("");
            setErrorMessage("");

            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value);
            });

            if (logo) {
                formData.append("logo", logo);
            }

            newImages.forEach((image) => {
                formData.append("storeImages", image);
            });

            if (removeImages.length > 0) {
                formData.append("removeImages", JSON.stringify(removeImages));
            }

            const response = await fetch(`${server}/settings`, {
                method: "PUT",
                credentials: "include",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update settings");
            }

            const settings = data.settings;
            setForm({
                storeName: settings.storeName || "",
                phone: settings.phone || "",
                whatsapp: settings.whatsapp || "",
                about: settings.about || "",
                address: settings.address || "",
                googleMapsUrl: settings.googleMapsUrl || "",
                openingHours: settings.openingHours || "",
                instagram: settings.instagram || "",
            });

            setLogoPreview(settings.logo?.url || null);
            setStoreImages(settings.storeImages || []);
            setLogo(null);
            setNewImages([]);
            setRemoveImages([]);

            setMessage(data.message || "Store settings updated successfully");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            console.error("Update settings error:", error);
            setErrorMessage(error.message || "Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="gw-admin-page">
                <div className="gw-state-loading">
                    <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
                    <p>Loading store settings...</p>
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
                        <h1 className="gw-page-title">Store Settings</h1>
                        <p className="gw-page-subtitle">
                            Configure retail store profile, contact numbers, physical location, opening hours, and brand assets
                        </p>
                    </div>
                </div>

                {/* SUCCESS NOTIFICATION */}
                {message && (
                    <div className="gw-alert-toast success" style={{ marginBottom: "1.5rem" }}>
                        <div className="gw-alert-icon">
                            <i className="fa-solid fa-circle-check"></i>
                        </div>
                        <div className="gw-alert-text">
                            <strong>Success</strong>
                            <span>{message}</span>
                        </div>
                        <button type="button" className="gw-alert-close" onClick={() => setMessage("")}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                )}

                {/* ERROR NOTIFICATION */}
                {errorMessage && (
                    <div className="gw-alert-toast error" style={{ marginBottom: "1.5rem" }}>
                        <div className="gw-alert-icon">
                            <i className="fa-solid fa-circle-exclamation"></i>
                        </div>
                        <div className="gw-alert-text">
                            <strong>Error</strong>
                            <span>{errorMessage}</span>
                        </div>
                        <button type="button" className="gw-alert-close" onClick={() => setErrorMessage("")}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                )}

                <form className="gw-form-layout" onSubmit={handleSubmit}>
                    {/* SECTION 1: STORE PROFILE */}
                    <div className="gw-form-card">
                        <div className="gw-form-card-header">
                            <div className="gw-form-header-icon">
                                <i className="fa-solid fa-store"></i>
                            </div>
                            <div>
                                <h3>Store Identity &amp; Profile</h3>
                                <p>Public retail name and store bio displayed across storefront pages</p>
                            </div>
                        </div>

                        <div className="gw-form-card-body">
                            <div className="gw-form-group">
                                <label className="gw-label" htmlFor="storeName">
                                    Store Name <span className="req">*</span>
                                </label>
                                <input
                                    id="storeName"
                                    type="text"
                                    name="storeName"
                                    className="gw-input"
                                    value={form.storeName}
                                    onChange={handleChange}
                                    placeholder="e.g. Gupta Wears"
                                    required
                                />
                            </div>

                            <div className="gw-form-group">
                                <label className="gw-label" htmlFor="about">
                                    About / Retail Description
                                </label>
                                <textarea
                                    id="about"
                                    name="about"
                                    className="gw-textarea"
                                    value={form.about}
                                    onChange={handleChange}
                                    placeholder="Tell your customers about Gupta Wears, your heritage (founded 2019), and your focus on quality men's fashion..."
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: CONTACT & SOCIAL */}
                    <div className="gw-form-card">
                        <div className="gw-form-card-header">
                            <div className="gw-form-header-icon">
                                <i className="fa-solid fa-address-book"></i>
                            </div>
                            <div>
                                <h3>Direct Contact &amp; Social Channels</h3>
                                <p>Customer support channels, messaging links, and social discovery</p>
                            </div>
                        </div>

                        <div className="gw-form-card-body">
                            <div className="gw-form-row">
                                <div className="gw-form-group">
                                    <label className="gw-label" htmlFor="phone">
                                        Support Phone Number
                                    </label>
                                    <input
                                        id="phone"
                                        type="text"
                                        name="phone"
                                        className="gw-input"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="e.g. +91 98765 43210"
                                    />
                                </div>

                                <div className="gw-form-group">
                                    <label className="gw-label" htmlFor="whatsapp">
                                        WhatsApp Business Number
                                    </label>
                                    <input
                                        id="whatsapp"
                                        type="text"
                                        name="whatsapp"
                                        className="gw-input"
                                        value={form.whatsapp}
                                        onChange={handleChange}
                                        placeholder="e.g. +91 98765 43210"
                                    />
                                </div>
                            </div>

                            <div className="gw-form-row">
                                <div className="gw-form-group">
                                    <label className="gw-label" htmlFor="instagram">
                                        Instagram Profile Link
                                    </label>
                                    <input
                                        id="instagram"
                                        type="url"
                                        name="instagram"
                                        className="gw-input"
                                        value={form.instagram}
                                        onChange={handleChange}
                                        placeholder="https://instagram.com/guptawears"
                                    />
                                </div>

                                <div className="gw-form-group">
                                    <label className="gw-label" htmlFor="googleMapsUrl">
                                        Google Maps Location Link
                                    </label>
                                    <input
                                        id="googleMapsUrl"
                                        type="url"
                                        name="googleMapsUrl"
                                        className="gw-input"
                                        value={form.googleMapsUrl}
                                        onChange={handleChange}
                                        placeholder="https://maps.google.com/..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: LOCATION & BUSINESS HOURS */}
                    <div className="gw-form-card">
                        <div className="gw-form-card-header">
                            <div className="gw-form-header-icon">
                                <i className="fa-solid fa-clock"></i>
                            </div>
                            <div>
                                <h3>Location &amp; Business Hours</h3>
                                <p>Physical store address and retail working schedule</p>
                            </div>
                        </div>

                        <div className="gw-form-card-body">
                            <div className="gw-form-group">
                                <label className="gw-label" htmlFor="address">
                                    Physical Store Address
                                </label>
                                <textarea
                                    id="address"
                                    name="address"
                                    className="gw-textarea"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Enter full shop address, street, landmark, city, and pincode..."
                                    rows={3}
                                />
                            </div>

                            <div className="gw-form-group">
                                <label className="gw-label" htmlFor="openingHours">
                                    Operating / Opening Hours
                                </label>
                                <textarea
                                    id="openingHours"
                                    name="openingHours"
                                    className="gw-textarea"
                                    value={form.openingHours}
                                    onChange={handleChange}
                                    placeholder="Mon - Sat: 10:00 AM - 9:00 PM&#10;Sunday: 11:00 AM - 7:00 PM"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: BRAND ASSETS */}
                    <div className="gw-form-card">
                        <div className="gw-form-card-header">
                            <div className="gw-form-header-icon">
                                <i className="fa-solid fa-photo-film"></i>
                            </div>
                            <div>
                                <h3>Brand Assets &amp; Photography</h3>
                                <p>Store logo and storefront showcase photography</p>
                            </div>
                        </div>

                        <div className="gw-form-card-body">
                            {/* LOGO AREA */}
                            <div className="gw-form-group" style={{ marginBottom: "2rem" }}>
                                <label className="gw-label">Store Logo</label>
                                <div className="gw-settings-logo-box">
                                    <div className="gw-settings-logo-preview">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Store logo preview" />
                                        ) : (
                                            <div className="gw-settings-logo-empty">
                                                <i className="fa-solid fa-image"></i>
                                                <span>No Logo Uploaded</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="gw-settings-logo-controls">
                                        <label className="gw-primary-btn outline small" style={{ cursor: "pointer" }}>
                                            <i className="fa-solid fa-upload"></i>
                                            <span>{logoPreview ? "Replace Logo" : "Upload Logo"}</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                style={{ display: "none" }}
                                            />
                                        </label>
                                        {logo && (
                                            <button
                                                type="button"
                                                className="gw-action-btn delete"
                                                onClick={handleRemoveLogo}
                                            >
                                                <i className="fa-solid fa-xmark"></i> Remove Selected
                                            </button>
                                        )}
                                        <span className="gw-hint">Recommended: Square format (PNG or SVG) up to 2MB</span>
                                    </div>
                                </div>
                            </div>

                            {/* STORE IMAGES GALLERY */}
                            <div className="gw-form-group">
                                <label className="gw-label">Storefront Showcase Images</label>

                                {(storeImages.length > 0 || newImages.length > 0) && (
                                    <div className="gw-thumbnails-gallery">
                                        {/* Existing Images */}
                                        {storeImages.map((img) => (
                                            <div key={img._id} className="gw-thumbnail-item">
                                                <img src={img.url} alt={img.alt || "Store"} />
                                                <button
                                                    type="button"
                                                    className="gw-thumbnail-remove-btn"
                                                    onClick={() => handleRemoveExistingImage(img._id)}
                                                    title="Remove image"
                                                >
                                                    <i className="fa-solid fa-xmark"></i>
                                                </button>
                                            </div>
                                        ))}

                                        {/* Newly Added Images */}
                                        {newImages.map((file, idx) => (
                                            <div key={`${file.name}-${idx}`} className="gw-thumbnail-item is-new">
                                                <img src={URL.createObjectURL(file)} alt={file.name} />
                                                <span className="gw-new-tag">New</span>
                                                <button
                                                    type="button"
                                                    className="gw-thumbnail-remove-btn"
                                                    onClick={() => handleRemoveNewImage(idx)}
                                                    title="Remove image"
                                                >
                                                    <i className="fa-solid fa-xmark"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <label className="gw-dropzone">
                                    <i className="fa-solid fa-cloud-arrow-up fa-2x"></i>
                                    <span>Upload store showcase photos</span>
                                    <span className="gw-dropzone-sub">JPG, PNG, WebP up to 5MB each</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleStoreImagesChange}
                                        style={{ display: "none" }}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* FORM FOOTER ACTIONS */}
                    <div className="gw-form-actions">
                        <button
                            type="submit"
                            className="gw-primary-btn"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                                    <span>Saving Settings...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-check"></i>
                                    <span>Save Settings</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}