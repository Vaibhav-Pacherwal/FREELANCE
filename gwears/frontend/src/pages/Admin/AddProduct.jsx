import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../../Environment.js";

const createCombinations = (options) => {
    if (!options.length) return [];

    const validOptions = options.filter(
        (option) => option.name.trim() && option.values.length > 0
    );

    if (!validOptions.length) return [];

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

    return combinations;
};

const slugify = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
};

export default function AddProduct() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);

    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    const [options, setOptions] = useState([
        {
            name: "Size",
            values: ["S", "M", "L", "XL"],
        },
        {
            name: "Color",
            values: ["Black"],
        },
    ]);

    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${server}/categories`, {
                    credentials: "include",
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch categories");
                }
                setCategories(data.categories || []);
            } catch (err) {
                console.error("Category fetch error:", err);
            }
        };

        fetchCategories();
    }, []);

    // Pre-generate initial variants once on mount if options exist
    useEffect(() => {
        if (options.length > 0 && variants.length === 0) {
            generateVariants();
        }
    }, [options]);

    const generateVariants = () => {
        const combinations = createCombinations(options);

        if (!combinations.length) {
            setVariants([]);
            return;
        }

        const generated = combinations.map((combination, index) => {
            const attributes = Object.entries(combination).map(([optName, value]) => ({
                name: optName,
                value,
            }));

            const skuAttributes = attributes
                .map((attribute) => slugify(attribute.value))
                .join("-");

            return {
                sku: `${slugify(name) || "gw"}-${skuAttributes || index + 1}`,
                attributes,
                price: "",
                originalPrice: "",
                stock: 0,
                isActive: true,
            };
        });

        setVariants(generated);
    };

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

    const handleImagesChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (!selectedFiles.length) return;

        if (images.length + selectedFiles.length > 5) {
            setError("Maximum 5 images allowed per product");
            e.target.value = "";
            return;
        }

        for (const file of selectedFiles) {
            if (!file.type.startsWith("image/")) {
                setError("Only JPG, PNG, and WebP image files are allowed");
                e.target.value = "";
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError("Each image file must be less than 5 MB");
                e.target.value = "";
                return;
            }
        }

        setError("");
        setImages((prev) => [...prev, ...selectedFiles]);
        const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
        setPreviews((prev) => [...prev, ...newPreviews]);
        e.target.value = "";
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(previews[index]);
        setImages((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Product name is required");
            return;
        }

        if (!description.trim()) {
            setError("Product description is required");
            return;
        }

        if (!category) {
            setError("Please select a valid category");
            return;
        }

        if (!images.length) {
            setError("Please upload at least one product image");
            return;
        }

        if (!variants.length) {
            setError("Generate at least one variant for this product");
            return;
        }

        for (const variant of variants) {
            if (!variant.sku.trim()) {
                setError("Every variant must have a unique SKU code");
                return;
            }

            if (variant.price === "" || Number(variant.price) < 0) {
                setError("Every variant must have a valid non-negative selling price");
                return;
            }

            if (variant.stock === "" || Number(variant.stock) < 0) {
                setError("Every variant must have a valid non-negative stock count");
                return;
            }
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("description", description.trim());
            formData.append("category", category);

            formData.append(
                "options",
                JSON.stringify(
                    options
                        .filter(
                            (option) =>
                                option.name.trim() &&
                                option.values.some((val) => val.trim())
                        )
                        .map((option) => ({
                            name: option.name.trim(),
                            values: option.values
                                .filter((val) => val.trim())
                                .map((val) => val.trim()),
                        }))
                )
            );

            formData.append(
                "variants",
                JSON.stringify(
                    variants.map((variant) => ({
                        ...variant,
                        price: Number(variant.price),
                        originalPrice:
                            variant.originalPrice === ""
                                ? null
                                : Number(variant.originalPrice),
                        stock: Number(variant.stock),
                    }))
                )
            );

            formData.append("isFeatured", isFeatured);

            images.forEach((img) => {
                formData.append("images", img);
            });

            const response = await fetch(`${server}/products`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create product");
            }

            navigate("/admin/products");
        } catch (err) {
            console.error("Create product error:", err);
            setError(err.message || "Failed to create product");
        } finally {
            setLoading(false);
        }
    };

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
                        <h1 className="gw-page-title">Add New Product</h1>
                        <p className="gw-page-subtitle">
                            Create a new retail item, upload photography, define sizes/colors, and set pricing
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
                                    type="text"
                                    className="gw-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Slim-Fit Stretch Cotton Shirt, Casual Oxford Hoodie"
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
                                        className="gw-select"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
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
                                        className="gw-select"
                                        value={isFeatured}
                                        onChange={(e) => setIsFeatured(e.target.value === "true")}
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
                                    className="gw-textarea"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
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
                                <h3>Product Photography</h3>
                                <p>Upload high-resolution images (up to 5 images, max 5MB each). First image is cover.</p>
                            </div>
                        </div>

                        <div className="gw-form-card-body">
                            {previews.length > 0 && (
                                <div className="gw-thumbnails-gallery">
                                    {previews.map((preview, index) => (
                                        <div key={preview} className="gw-thumbnail-item">
                                            <img src={preview} alt={`Upload preview ${index + 1}`} />
                                            {index === 0 && <span className="gw-cover-tag">Primary Cover</span>}
                                            <button
                                                type="button"
                                                className="gw-thumbnail-remove-btn"
                                                onClick={() => removeImage(index)}
                                                title="Remove image"
                                            >
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {images.length < 5 && (
                                <label className="gw-dropzone">
                                    <i className="fa-solid fa-cloud-arrow-up fa-2x"></i>
                                    <span>Click to upload product photography</span>
                                    <span className="gw-dropzone-sub">
                                        {5 - images.length} remaining slots • JPG, PNG, WebP up to 5MB
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImagesChange}
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
                                    Updates the inventory table below with all combination permutations
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
                                    <p>{variants.length} variant combination{variants.length > 1 ? "s" : ""} generated</p>
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
                                                <tr key={index}>
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
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="gw-primary-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                                    <span>Saving Product...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-check"></i>
                                    <span>Create Product</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}