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

                const response = await fetch(
                    `${server}/settings`,
                    {
                        credentials: "include",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to fetch settings"
                    );
                }

                const settings = data.settings;

                if (!settings) {
                    return;
                }

                setForm({
                    storeName: settings.storeName || "",
                    phone: settings.phone || "",
                    whatsapp: settings.whatsapp || "",
                    about: settings.about || "",
                    address: settings.address || "",
                    googleMapsUrl:
                        settings.googleMapsUrl || "",
                    openingHours:
                        settings.openingHours || "",
                    instagram:
                        settings.instagram || "",
                });

                setLogoPreview(
                    settings.logo?.url || null
                );

                setStoreImages(
                    settings.storeImages || []
                );

            } catch (error) {
                console.error(
                    "Get settings error:",
                    error
                );

                setErrorMessage(error.message);

            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // --------------------------------
    // Form change
    // --------------------------------

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // --------------------------------
    // Logo
    // --------------------------------

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setLogo(file);
        setLogoPreview(
            URL.createObjectURL(file)
        );
    };

    // --------------------------------
    // Store images
    // --------------------------------

    const handleStoreImagesChange = (e) => {
        const files = Array.from(
            e.target.files || []
        );

        if (files.length === 0) return;

        setNewImages((prev) => [
            ...prev,
            ...files,
        ]);

        // Reset input so same file can
        // be selected again if needed
        e.target.value = "";
    };

    // --------------------------------
    // Remove existing image
    // --------------------------------

    const handleRemoveExistingImage = (imageId) => {
        setRemoveImages((prev) => [
            ...prev,
            imageId,
        ]);

        setStoreImages((prev) =>
            prev.filter(
                (image) => image._id !== imageId
            )
        );
    };

    // --------------------------------
    // Remove newly selected image
    // --------------------------------

    const handleRemoveNewImage = (index) => {
        setNewImages((prev) =>
            prev.filter(
                (_, imageIndex) =>
                    imageIndex !== index
            )
        );
    };

    // --------------------------------
    // Save
    // --------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setMessage("");
            setErrorMessage("");

            const formData = new FormData();

            Object.entries(form).forEach(
                ([key, value]) => {
                    formData.append(key, value);
                }
            );

            // New logo
            if (logo) {
                formData.append("logo", logo);
            }

            // New store images
            newImages.forEach((image) => {
                formData.append(
                    "storeImages",
                    image
                );
            });

            // Existing images to remove
            if (removeImages.length > 0) {
                formData.append(
                    "removeImages",
                    JSON.stringify(removeImages)
                );
            }

            const response = await fetch(
                `${server}/settings`,
                {
                    method: "PUT",
                    credentials: "include",
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update settings"
                );
            }

            // Update UI with backend response
            const settings = data.settings;

            setForm({
                storeName:
                    settings.storeName || "",
                phone:
                    settings.phone || "",
                whatsapp:
                    settings.whatsapp || "",
                about:
                    settings.about || "",
                address:
                    settings.address || "",
                googleMapsUrl:
                    settings.googleMapsUrl || "",
                openingHours:
                    settings.openingHours || "",
                instagram:
                    settings.instagram || "",
            });

            setLogoPreview(
                settings.logo?.url || null
            );

            setStoreImages(
                settings.storeImages || []
            );

            setLogo(null);
            setNewImages([]);
            setRemoveImages([]);

            setMessage(
                data.message ||
                "Settings updated successfully"
            );

        } catch (error) {
            console.error(
                "Update settings error:",
                error
            );

            setErrorMessage(error.message);

        } finally {
            setSaving(false);
        }
    };

    // --------------------------------
    // Loading
    // --------------------------------

    if (loading) {
        return (
            <div className="settings-page">
                <div className="settings-state">
                    Loading settings...
                </div>
            </div>
        );
    }

    return (
        <div className="settings-page">

            {/* HEADER */}

            <div className="settings-header">
                <div>
                    <h1>Store Settings</h1>

                    <p>
                        Manage your store information
                        and images.
                    </p>
                </div>
            </div>


            {/* SUCCESS MESSAGE */}

            {message && (
                <div className="settings-success">
                    {message}

                    <button
                        onClick={() =>
                            setMessage("")
                        }
                    >
                        ×
                    </button>
                </div>
            )}


            {/* ERROR MESSAGE */}

            {errorMessage && (
                <div className="settings-error">
                    {errorMessage}

                    <button
                        onClick={() =>
                            setErrorMessage("")
                        }
                    >
                        ×
                    </button>
                </div>
            )}


            <form
                className="settings-form"
                onSubmit={handleSubmit}
            >

                {/* STORE INFORMATION */}

                <section className="settings-section">

                    <div className="settings-section-header">
                        <h2>
                            Store Information
                        </h2>

                        <p>
                            Basic information displayed
                            on your website.
                        </p>
                    </div>


                    <div className="settings-fields">

                        <div className="settings-field">

                            <label>
                                Store Name
                            </label>

                            <input
                                type="text"
                                name="storeName"
                                value={form.storeName}
                                onChange={handleChange}
                                placeholder="Enter store name"
                                required
                            />

                        </div>


                        <div className="settings-field">

                            <label>
                                Phone
                            </label>

                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                            />

                        </div>


                        <div className="settings-field">

                            <label>
                                WhatsApp
                            </label>

                            <input
                                type="text"
                                name="whatsapp"
                                value={form.whatsapp}
                                onChange={handleChange}
                                placeholder="Enter WhatsApp number"
                            />

                        </div>


                        <div className="settings-field settings-field-full">

                            <label>
                                About Store
                            </label>

                            <textarea
                                name="about"
                                value={form.about}
                                onChange={handleChange}
                                placeholder="Tell customers about your store..."
                                rows={5}
                            />

                        </div>


                        <div className="settings-field settings-field-full">

                            <label>
                                Address
                            </label>

                            <textarea
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="Enter store address"
                                rows={3}
                            />

                        </div>


                        <div className="settings-field">

                            <label>
                                Google Maps URL
                            </label>

                            <input
                                type="url"
                                name="googleMapsUrl"
                                value={
                                    form.googleMapsUrl
                                }
                                onChange={handleChange}
                                placeholder="https://maps.google.com/..."
                            />

                        </div>


                        <div className="settings-field">

                            <label>
                                Instagram
                            </label>

                            <input
                                type="url"
                                name="instagram"
                                value={form.instagram}
                                onChange={handleChange}
                                placeholder="https://instagram.com/..."
                            />

                        </div>


                        <div className="settings-field settings-field-full">

                            <label>
                                Opening Hours
                            </label>

                            <textarea
                                name="openingHours"
                                value={
                                    form.openingHours
                                }
                                onChange={handleChange}
                                placeholder="Mon - Sat: 10 AM - 9 PM&#10;Sunday: 11 AM - 6 PM"
                                rows={3}
                            />

                        </div>

                    </div>

                </section>


                {/* LOGO */}

                <section className="settings-section">

                    <div className="settings-section-header">

                        <h2>
                            Store Logo
                        </h2>

                        <p>
                            Upload the logo displayed
                            throughout your store.
                        </p>

                    </div>


                    <div className="settings-logo-area">

                        <div className="settings-logo-preview">

                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Store logo"
                                />
                            ) : (
                                <span>
                                    No Logo
                                </span>
                            )}

                        </div>


                        <div>

                            <label
                                className="settings-upload-button"
                            >
                                Choose Logo

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={
                                        handleLogoChange
                                    }
                                    hidden
                                />

                            </label>

                            {logo && (
                                <p className="settings-file-name">
                                    {logo.name}
                                </p>
                            )}

                        </div>

                    </div>

                </section>


                {/* STORE IMAGES */}

                <section className="settings-section">

                    <div className="settings-section-header">

                        <h2>
                            Store Images
                        </h2>

                        <p>
                            Images displayed on your
                            store website.
                        </p>

                    </div>


                    {/* EXISTING IMAGES */}

                    {storeImages.length > 0 && (

                        <div className="settings-images-grid">

                            {storeImages.map(
                                (image) => (

                                    <div
                                        className="settings-image-item"
                                        key={image._id}
                                    >

                                        <img
                                            src={image.url}
                                            alt={
                                                image.alt ||
                                                "Store"
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="settings-image-remove"
                                            onClick={() =>
                                                handleRemoveExistingImage(
                                                    image._id
                                                )
                                            }
                                        >
                                            ×
                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                    )}


                    {/* NEW IMAGES */}

                    {newImages.length > 0 && (

                        <div className="settings-images-grid">

                            {newImages.map(
                                (image, index) => (

                                    <div
                                        className="settings-image-item"
                                        key={`${image.name}-${index}`}
                                    >

                                        <img
                                            src={
                                                URL.createObjectURL(
                                                    image
                                                )
                                            }
                                            alt={image.name}
                                        />

                                        <button
                                            type="button"
                                            className="settings-image-remove"
                                            onClick={() =>
                                                handleRemoveNewImage(
                                                    index
                                                )
                                            }
                                        >
                                            ×
                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                    )}


                    <label
                        className="settings-upload-button"
                    >
                        + Add Store Images

                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={
                                handleStoreImagesChange
                            }
                            hidden
                        />

                    </label>

                </section>


                {/* SAVE */}

                <div className="settings-actions">

                    <button
                        type="submit"
                        className="settings-save-button"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </button>

                </div>

            </form>

        </div>
    );
}