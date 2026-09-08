import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../../Environment.js";

export default function AddOffer() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

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

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [categoryResponse, productResponse] =
                    await Promise.all([
                        fetch(`${server}/categories`, {
                            credentials: "include",
                        }),

                        fetch(`${server}/products?limit=1000`, {
                            credentials: "include",
                        }),
                    ]);

                const categoryData =
                    await categoryResponse.json();

                const productData =
                    await productResponse.json();

                if (!categoryResponse.ok) {
                    throw new Error(
                        categoryData.message ||
                        "Failed to fetch categories"
                    );
                }

                if (!productResponse.ok) {
                    throw new Error(
                        productData.message ||
                        "Failed to fetch products"
                    );
                }

                setCategories(
                    categoryData.categories || []
                );

                setProducts(
                    productData.products || []
                );

            } catch (error) {
                console.error(
                    "Add offer fetch error:",
                    error
                );

                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Only image files are allowed");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be less than 5MB");
            e.target.value = "";
            return;
        }

        setError("");

        setImage(file);

        const preview = URL.createObjectURL(file);
        setImagePreview(preview);

        e.target.value = "";
    };

    const removeImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setImage(null);
        setImagePreview("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            setError("Offer image is required");
            return;
        }

        if (
            formData.discountType === "percentage" &&
            Number(formData.discountValue) > 100
        ) {
            setError(
                "Percentage discount cannot be greater than 100"
            );
            return;
        }

        if (
            new Date(formData.startDate) >=
            new Date(formData.endDate)
        ) {
            setError(
                "End date must be after start date"
            );
            return;
        }

        if (
            formData.appliesTo === "category" &&
            !formData.category
        ) {
            setError("Please select a category");
            return;
        }

        if (
            formData.appliesTo === "product" &&
            !formData.product
        ) {
            setError("Please select a product");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const data = new FormData();

            data.append("title", formData.title);
            data.append(
                "description",
                formData.description
            );
            data.append(
                "discountType",
                formData.discountType
            );
            data.append(
                "discountValue",
                formData.discountValue
            );
            data.append(
                "appliesTo",
                formData.appliesTo
            );

            data.append(
                "category",
                formData.appliesTo === "category"
                    ? formData.category
                    : ""
            );

            data.append(
                "product",
                formData.appliesTo === "product"
                    ? formData.product
                    : ""
            );

            data.append(
                "startDate",
                formData.startDate
            );

            data.append(
                "endDate",
                formData.endDate
            );

            data.append(
                "imageAlt",
                formData.imageAlt
            );

            data.append("image", image);

            const response = await fetch(
                `${server}/offers`,
                {
                    method: "POST",
                    credentials: "include",
                    body: data,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Failed to create offer"
                );
            }

            navigate("/admin/offers");

        } catch (error) {
            console.error(
                "Create offer error:",
                error
            );

            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="add-offer-page">

            <h1>Add Offer</h1>

            {error && (
                <p className="error-message">
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Title</label>

                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        maxLength={150}
                        required
                    />
                </div>

                <div>
                    <label>Description</label>

                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        maxLength={1000}
                        rows={4}
                    />
                </div>

                {/* IMAGE */}

                <div>
                    <label>Offer Image</label>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />

                    {imagePreview && (
                        <div className="image-item">
                            <img
                                src={imagePreview}
                                alt="Offer preview"
                            />

                            <button
                                type="button"
                                onClick={removeImage}
                            >
                                ×
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    <label>Image Alt Text</label>

                    <input
                        type="text"
                        name="imageAlt"
                        value={formData.imageAlt}
                        onChange={handleChange}
                    />
                </div>

                {/* DISCOUNT */}

                <div>
                    <label>Discount Type</label>

                    <select
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleChange}
                    >
                        <option value="percentage">
                            Percentage
                        </option>

                        <option value="fixed">
                            Fixed Amount
                        </option>
                    </select>
                </div>

                <div>
                    <label>Discount Value</label>

                    <input
                        type="number"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleChange}
                        min="0"
                        max={
                            formData.discountType ===
                            "percentage"
                                ? "100"
                                : undefined
                        }
                        step="0.01"
                        required
                    />
                </div>

                {/* APPLIES TO */}

                <div>
                    <label>Applies To</label>

                    <select
                        value={formData.appliesTo}
                        onChange={handleAppliesToChange}
                    >
                        <option value="store">
                            Entire Store
                        </option>

                        <option value="category">
                            Category
                        </option>

                        <option value="product">
                            Product
                        </option>
                    </select>
                </div>

                {formData.appliesTo === "category" && (
                    <div>
                        <label>Category</label>

                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Select category
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category._id}
                                    value={category._id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {formData.appliesTo === "product" && (
                    <div>
                        <label>Product</label>

                        <select
                            name="product"
                            value={formData.product}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Select product
                            </option>

                            {products.map((product) => (
                                <option
                                    key={product._id}
                                    value={product._id}
                                >
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* DATES */}

                <div>
                    <label>Start Date</label>

                    <input
                        type="datetime-local"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>End Date</label>

                    <input
                        type="datetime-local"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/offers")
                        }
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Creating..."
                            : "Create Offer"}
                    </button>
                </div>

            </form>
        </div>
    );
}