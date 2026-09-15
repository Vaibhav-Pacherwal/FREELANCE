import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import server from "../../Environment.js";

const slugify = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
};

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        isFeatured: false,
    });

    const [categories, setCategories] = useState([]);
    const [options, setOptions] = useState([]);
    const [variants, setVariants] = useState([]);

    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // --------------------------------------------------
    // Fetch product
    // --------------------------------------------------
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [productResponse, categoryResponse] = await Promise.all([
                    fetch(`${server}/products/${id}`, { credentials: "include" }),
                    fetch(`${server}/categories`, { credentials: "include" }),
                ]);

                const productData = await productResponse.json();
                const categoryData = await categoryResponse.json();

                if (!productResponse.ok) {
                    throw new Error(productData.message || "Failed to fetch product");
                }
                if (!categoryResponse.ok) {
                    throw new Error(categoryData.message || "Failed to fetch categories");
                }

                const product = productData.product;

                setFormData({
                    name: product.name || "",
                    description: product.description || "",
                    category: product.category?._id || product.category || "",
                    isFeatured: product.isFeatured ?? false,
                });

                setOptions(product.options || []);

                setVariants(
                    (product.variants || []).map((variant) => ({
                        _id: variant._id,
                        sku: variant.sku,
                        attributes: variant.attributes || [],
                        price: variant.price,
                        originalPrice: variant.originalPrice ?? "",
                        stock: variant.stock,
                        isActive: variant.isActive ?? true,
                    }))
                );

                setExistingImages(product.images || []);
                setCategories(categoryData.categories || []);
            } catch (err) {
                console.error("Edit product fetch error:", err);
                setError(err.message || "Failed to load product details");
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

    // --------------------------------------------------
    // Options
    // --------------------------------------------------
    const addOption = () => {
        setOptions((prev) => [
            ...prev,
            {
                name: "",
                values: [""],
            },
        ]);
    };

    const removeOption = (index) => {
        setOptions((prev) => prev.filter((_, i) => i !== index));
    };

    const updateOptionName = (index, value) => {
        setOptions((prev) =>
            prev.map((option, i) =>
                i === index ? { ...option, name: value } : option
            )
        );
    };

    const addOptionValue = (optionIndex) => {
        setOptions((prev) =>
            prev.map((option, i) =>
                i === optionIndex
                    ? { ...option, values: [...option.values, ""] }
                    : option
            )
        );
    };

    const updateOptionValue = (optionIndex, valueIndex, value) => {
        setOptions((prev) =>
            prev.map((option, i) =>
                i === optionIndex
                    ? {
                        ...option,
                        values: option.values.map((v, vi) =>
                            vi === valueIndex ? value : v
                        ),
                    }
                    : option
            )
        );
    };

    const removeOptionValue = (optionIndex, valueIndex) => {
        setOptions((prev) =>
            prev.map((option, i) =>
                i === optionIndex
                    ? {
                        ...option,
                        values: option.values.filter((_, vi) => vi !== valueIndex),
                    }
                    : option
            )
        );
    };

    // --------------------------------------------------
    // Variant Matrix
    // --------------------------------------------------
    const updateVariant = (index, field, value) => {
        setVariants((prev) =>
            prev.map((variant, i) =>
                i === index ? { ...variant, [field]: value } : variant
            )
        );
    };

    const toggleVariantStatus = (index) => {
        setVariants((prev) =>
            prev.map((variant, i) =>
                i === index ? { ...variant, isActive: !variant.isActive } : variant
            )
        );
    };

    const generateVariants = () => {
        const validOptions = options
            .map((option) => ({
                name: option.name.trim(),
                values: option.values.map((v) => v.trim()).filter(Boolean),
            }))
            .filter((option) => option.name && option.values.length > 0);

        if (!validOptions.length) {
            const existingVariant = variants[0];
            setVariants([
                existingVariant || {
                    sku: `${slugify(formData.name)}-1`,
                    attributes: [],
                    price: "",
                    originalPrice: "",
                    stock: 0,
                    isActive: true,
                },
            ]);
            setError("");
            return;
        }

        let combinations = [{}];

        validOptions.forEach((option) => {
            const newCombinations = [];
            combinations.forEach((combination) => {
                option.values.forEach((value) => {
                    newCombinations.push({
                        ...combination,
                        [option.name]: value,
                    });
                });
            });
            combinations = newCombinations;
        });

        const generatedVariants = combinations.map((combination, index) => {
            const attributes = Object.entries(combination).map(([name, value]) => ({
                name,
                value,
            }));

            const existingVariant = variants.find((variant) => {
                if (!variant.attributes || variant.attributes.length !== attributes.length) {
                    return false;
                }
                return attributes.every((attribute) =>
                    variant.attributes.some(
                        (existingAttr) =>
                            existingAttr.name === attribute.name &&
                            existingAttr.value === attribute.value
                    )
                );
            });

            if (existingVariant) {
                return {
                    ...existingVariant,
                    attributes,
                };
            }

            const skuAttributes = attributes
                .map((attr) => slugify(attr.value))
                .join("-");

            return {
                sku: `${slugify(formData.name) || "gw"}-${skuAttributes || index + 1}`,
                attributes,
                price: "",
                originalPrice: "",
                stock: 0,
                isActive: true,
            };
        });

        setVariants(generatedVariants);
        setError("");
    };

    // --------------------------------------------------
    // Images
    // --------------------------------------------------
    const removeExistingImage = (imageToRemove) => {
        setExistingImages((prev) =>
            prev.filter(
                (img) => (img.publicId || img.url) !== (imageToRemove.publicId || imageToRemove.url)
            )
        );
    };

    const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (!selectedFiles.length) return;

        const totalImages = existingImages.length + newImages.length;
        const remainingSlots = 5 - totalImages;

        if (remainingSlots <= 0) {
            setError("Maximum 5 images allowed per product");
            e.target.value = "";
            return;
        }

        const filesToAdd = selectedFiles.slice(0, remainingSlots);

        for (const file of filesToAdd) {
            if (!file.type.startsWith("image/")) {
                setError("Only JPG, PNG, and WebP images are allowed");
                e.target.value = "";
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError("Each image must be less than 5MB");
                e.target.value = "";
                return;
            }
        }

        setError("");
        const imageObjects = filesToAdd.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setNewImages((prev) => [...prev, ...imageObjects]);
        e.target.value = "";
    };

    const removeNewImage = (index) => {
        setNewImages((prev) => {
            const img = prev[index];
            if (img?.preview) URL.revokeObjectURL(img.preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    // --------------------------------------------------
    // Submit
    // --------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.name.trim()) {
            setError("Product name is required");
            return;
        }

        if (!formData.description.trim()) {
            setError("Product description is required");
            return;
        }

        if (!formData.category) {
            setError("Please select a valid store category");
            return;
        }

        if (existingImages.length + newImages.length === 0) {
            setError("At least one product image is required");
            return;
        }

        if (!variants.length) {
            setError("At least one product variant is required");
            return;
        }

        const skus = variants.map((variant) => variant.sku?.trim());
        if (new Set(skus).size !== skus.length) {
            setError("Variant SKUs must be unique");
            return;
        }

        for (const variant of variants) {
            if (!variant.sku?.trim()) {
                setError("Every variant must have a SKU code");
                return;
            }

            if (
                variant.price === "" ||
                variant.price === null ||
                variant.price === undefined ||
                !Number.isFinite(Number(variant.price)) ||
                Number(variant.price) < 0
            ) {
                setError("Every variant must have a valid non-negative selling price");
                return;
            }

            if (
                variant.stock === "" ||
                variant.stock === null ||
                variant.stock === undefined ||
                !Number.isFinite(Number(variant.stock)) ||
                Number(variant.stock) < 0
            ) {
                setError("Every variant must have a valid non-negative stock level");
                return;
            }

            if (
                variant.originalPrice !== "" &&
                variant.originalPrice !== null &&
                variant.originalPrice !== undefined &&
                (!Number.isFinite(Number(variant.originalPrice)) || Number(variant.originalPrice) < 0)
            ) {
                setError("Every variant must have a valid original/MRP price");
                return;
            }
        }

        try {
            setSaving(true);
            setError("");

            const data = new FormData();
            data.append("name", formData.name.trim());
            data.append("description", formData.description.trim());
            data.append("category", formData.category);
            data.append("isFeatured", formData.isFeatured);

            data.append(
                "options",
                JSON.stringify(
                    options
                        .filter((option) => option.name.trim())
                        .map((option) => ({
                            name: option.name.trim(),
                            values: option.values
                                .filter((val) => val.trim())
                                .map((val) => val.trim()),
                        }))
                )
            );

            data.append(
                "variants",
                JSON.stringify(
                    variants.map((variant) => ({
                        sku: variant.sku.trim(),
                        attributes: variant.attributes,
                        price: Number(variant.price),
                        originalPrice:
                            variant.originalPrice === "" || variant.originalPrice === null
                                ? null
                                : Number(variant.originalPrice),
                        stock: Number(variant.stock),
                        isActive: variant.isActive,
                    }))
                )
            );

            data.append("existingImages", JSON.stringify(existingImages));

            newImages.forEach((img) => {
                data.append("images", img.file);
            });

            const response = await fetch(`${server}/products/${id}`, {
                method: "PATCH",
                credentials: "include",
                body: data,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to update product");
            }

            navigate("/admin/products");
        } catch (err) {
            console.error("Update product error:", err);
            setError(err.message || "Failed to update product");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="gw-admin-page">
                <div className="gw-state-loading">
                    <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
                    <p>Loading product catalog details...</p>
                </div>
            </div>
        );
    }

    const totalImagesCount = existingImages.length + newImages.length;

    return (
        <div className="gw-admin-page">
            <div className="gw-form-page-container">
                {/* PAGE HEADER */}
                <div className="gw-page-header">
                    <div>
                        <div className="gw-back-link" onClick={() => navigate("/admin/products")}>
                            <i className="fa-solid fa-arrow-left"></i>
                            <span>Back to Products Catalog</span>
                        </div>
                        <h1 className="gw-page-title">Edit Product: {formData.name || "Product"}</h1>
                        <p className="gw-page-subtitle">
                            Update specifications, photography gallery, options, and variant inventory
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
                    {/* SECTION 1: BASIC INFORMATION */}
                    <div className="gw-form-card">
                        <div className="gw-form-card-header">
                            <div className="gw-form-header-icon">
                                <i className="fa-solid fa-shirt"></i>
                            </div>
                            <div>
                                <h3>Product Information</h3>
                                <p>Standard retail naming, categorization, and item description</p>
                            </div>
                        </div>

                        <div className="gw-form-card-body">
                            <div className="gw-form-group">
                                <label className="gw-label" htmlFor="name">
                                    Product Name <span className="req">*</span>
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    className="gw-input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Slim-Fit Stretch Cotton Shirt"
                                    maxLength={150}
                                    required
                                />
                            </div>

                            <div className="gw-form-row">
                                <div className="gw-form-group">
                                    <label className="gw-label" htmlFor="category">
                                        Store Category <span className="req">*</span>
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        className="gw-select"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">-- Select Store Category --</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>
                                                {cat.name} {cat.group ? `(${cat.group.toUpperCase()})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="gw-form-group">
                                    <label className="gw-label" htmlFor="isFeatured">
                                        Catalog Spotlight
                                    </label>
                                    <select
                                        id="isFeatured"
                                        name="isFeatured"
                                        className="gw-select"
                                        value={formData.isFeatured}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                isFeatured: e.target.value === "true",
                                            }))
                                        }
                                    >
                                        <option value="false">Standard Catalog Item</option>
                                        <option value="true">Featured Showcase (Home &amp; Highlights)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="gw-form-group">
                                <label className="gw-label" htmlFor="description">
                                    Product Description <span className="req">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    className="gw-textarea"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the fabric blend, styling details, fit type, care instructions, and customer benefits..."
                                    rows={4}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: IMAGES & PHOTOGRAPHY */}
                    <div className="gw-form-card">
                        <div className="gw-form-card-header">
                            <div className="gw-form-header-icon">
                                <i className="fa-solid fa-images"></i>
                            </div>
                            <div>
                                <h3>Product Photography ({totalImagesCount}/5)</h3>
                                <p>Manage uploaded high-resolution imagery. First image serves as primary storefront cover.</p>
                            </div>
                        </div>

                        <div className="gw-form-card-body">
                            {totalImagesCount > 0 && (
                                <div className="gw-thumbnails-gallery">
                                    {/* Existing Images */}
                                    {existingImages.map((img, index) => (
                                        <div key={img.publicId || img.url || index} className="gw-thumbnail-item">
                                            <img src={img.url} alt={img.alt || `Existing ${index + 1}`} />
                                            {index === 0 && <span className="gw-cover-tag">Primary Cover</span>}
                                            <button
                                                type="button"
                                                className="gw-thumbnail-remove-btn"
                                                onClick={() => removeExistingImage(img)}
                                                title="Remove image"
                                            >
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>
                                    ))}

                                    {/* Newly Added Images */}
                                    {newImages.map((img, index) => (
                                        <div key={img.preview} className="gw-thumbnail-item is-new">
                                            <img src={img.preview} alt={`New upload ${index + 1}`} />
                                            <span className="gw-new-tag">New</span>
                                            <button
                                                type="button"
                                                className="gw-thumbnail-remove-btn"
                                                onClick={() => removeNewImage(index)}
                                                title="Remove image"
                                            >
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {totalImagesCount < 5 && (
                                <label className="gw-dropzone">
                                    <i className="fa-solid fa-cloud-arrow-up fa-2x"></i>
                                    <span>Click to upload additional photography</span>
                                    <span className="gw-dropzone-sub">
                                        {5 - totalImagesCount} remaining slots • JPG, PNG, WebP up to 5MB
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        style={{ display: "none" }}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* SECTION 3: OPTIONS & ATTRIBUTES */}
                    <div className="gw-form-card">
                        <div className="gw-form-card-header">
                            <div className="gw-form-header-icon">
                                <i className="fa-solid fa-sliders"></i>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3>Product Options</h3>
                                <p>Define variable attributes like Size and Color to generate inventory combinations</p>
                            </div>
                            <button
                                type="button"
                                className="gw-secondary-btn small"
                                onClick={addOption}
                            >
                                <i className="fa-solid fa-plus"></i>
                                <span>Add Option</span>
                            </button>
                        </div>

                        <div className="gw-form-card-body">
                            <div className="gw-options-list">
                                {options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="gw-option-block">
                                        <div className="gw-option-header">
                                            <div className="gw-option-name-input">
                                                <label className="gw-label-sm">Option Name</label>
                                                <input
                                                    type="text"
                                                    className="gw-input small"
                                                    placeholder="e.g. Size, Color, Fit"
                                                    value={option.name}
                                                    onChange={(e) => updateOptionName(optionIndex, e.target.value)}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className="gw-btn-icon-danger"
                                                onClick={() => removeOption(optionIndex)}
                                                title="Remove this option"
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>

                                        <div className="gw-option-values-container">
                                            <label className="gw-label-sm">Option Values</label>
                                            <div className="gw-values-chips-wrap">
                                                {option.values.map((value, valueIndex) => (
                                                    <div key={valueIndex} className="gw-value-input-group">
                                                        <input
                                                            type="text"
                                                            className="gw-input small"
                                                            placeholder="Value (e.g. S, M, Navy)"
                                                            value={value}
                                                            onChange={(e) =>
                                                                updateOptionValue(optionIndex, valueIndex, e.target.value)
                                                            }
                                                        />
                                                        {option.values.length > 1 && (
                                                            <button
                                                                type="button"
                                                                className="gw-chip-delete"
                                                                onClick={() => removeOptionValue(optionIndex, valueIndex)}
                                                                title="Remove value"
                                                            >
                                                                <i className="fa-solid fa-xmark"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    className="gw-add-value-btn"
                                                    onClick={() => addOptionValue(optionIndex)}
                                                >
                                                    <i className="fa-solid fa-plus"></i> Value
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="gw-generate-variants-action">
                                <button
                                    type="button"
                                    className="gw-primary-btn outline"
                                    onClick={generateVariants}
                                >
                                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                                    <span>Sync / Re-Generate Variant Matrix</span>
                                </button>
                                <span className="gw-hint">
                                    Preserves existing prices and stock for unmodified attributes
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: VARIANTS & INVENTORY MATRIX */}
                    {variants.length > 0 && (
                        <div className="gw-form-card">
                            <div className="gw-form-card-header">
                                <div className="gw-form-header-icon">
                                    <i className="fa-solid fa-layer-group"></i>
                                </div>
                                <div>
                                    <h3>Inventory &amp; Pricing Matrix</h3>
                                    <p>{variants.length} variant combination{variants.length > 1 ? "s" : ""} configured</p>
                                </div>
                            </div>

                            <div className="gw-form-card-body" style={{ padding: 0 }}>
                                <div className="gw-table-wrap">
                                    <table className="gw-admin-table">
                                        <thead>
                                            <tr>
                                                <th>Variant Attributes</th>
                                                <th>SKU Code</th>
                                                <th>Selling Price (₹) <span className="req">*</span></th>
                                                <th>Original / MRP (₹)</th>
                                                <th>Stock Level <span className="req">*</span></th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {variants.map((variant, index) => (
                                                <tr key={variant._id || index}>
                                                    <td>
                                                        <div className="gw-variant-attr-badge">
                                                            {variant.attributes.length > 0
                                                                ? variant.attributes
                                                                    .map((attr) => `${attr.name}: ${attr.value}`)
                                                                    .join(" • ")
                                                                : "Standard"}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="gw-table-input"
                                                            value={variant.sku}
                                                            onChange={(e) => updateVariant(index, "sku", e.target.value)}
                                                            placeholder="SKU"
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="gw-table-input"
                                                            value={variant.price}
                                                            onChange={(e) => updateVariant(index, "price", e.target.value)}
                                                            placeholder="0"
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="gw-table-input"
                                                            value={variant.originalPrice}
                                                            onChange={(e) => updateVariant(index, "originalPrice", e.target.value)}
                                                            placeholder="Optional"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="gw-table-input"
                                                            value={variant.stock}
                                                            onChange={(e) => updateVariant(index, "stock", e.target.value)}
                                                            placeholder="0"
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className={`gw-status-toggle-btn ${variant.isActive ? "active" : "inactive"}`}
                                                            onClick={() => toggleVariantStatus(index)}
                                                        >
                                                            {variant.isActive ? "Active" : "Disabled"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FORM FOOTER ACTIONS */}
                    <div className="gw-form-actions">
                        <button
                            type="button"
                            className="gw-secondary-btn"
                            onClick={() => navigate("/admin/products")}
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
                                    <span>Update Product</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}