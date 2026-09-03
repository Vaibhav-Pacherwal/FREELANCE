import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../../Environment.js";

export default function AddProduct() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [categories, setCategories] = useState([]);

    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(
                    `${server}/categories`,
                    {
                        credentials: "include",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to fetch categories"
                    );
                }

                setCategories(data.categories || data);

            } catch (error) {
                console.error("Category fetch error:", error);
            }
        };

        fetchCategories();
    }, []);

    const handleImagesChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        if (selectedFiles.length === 0) return;

        // Maximum 5 images
        if (images.length + selectedFiles.length > 5) {
            setError("Maximum 5 images allowed");
            return;
        }

        for (const file of selectedFiles) {
            if (!file.type.startsWith("image/")) {
                setError("Only image files are allowed");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError("Each image must be less than 5 MB");
                return;
            }
        }

        setError("");

        setImages((prev) => [...prev, ...selectedFiles]);

        const newPreviews = selectedFiles.map((file) =>
            URL.createObjectURL(file)
        );

        setPreviews((prev) => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(previews[index]);

        setImages((prev) =>
            prev.filter((_, i) => i !== index)
        );

        setPreviews((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!name.trim()) {
            setError("Product name is required");
            return;
        }

        if (!description.trim()) {
            setError("Description is required");
            return;
        }

        if (!price || Number(price) < 0) {
            setError("Please enter a valid price");
            return;
        }

        if (!category) {
            setError("Please select a category");
            return;
        }

        if (images.length === 0) {
            setError("Please select at least one image");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();

            formData.append("name", name);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("category", category);
            formData.append("isActive", isActive);

            images.forEach((image) => {
                formData.append("images", image);
            });

            const response = await fetch(
                `${server}/products`,
                {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to create product"
                );
            }

            navigate("/admin/products");

        } catch (error) {
            console.error("Create product error:", error);
            setError(error.message);

        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="add-product-page">

            <div className="add-product-header">
                <div>
                    <h1>Add Product</h1>
                    <p>Create a new product for your store.</p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/admin/products")}
                >
                    Cancel
                </button>
            </div>


            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}


            <form
                className="add-product-form"
                onSubmit={handleSubmit}
            >

                <div className="form-group">
                    <label>Product Name *</label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter product name"
                    />
                </div>


                <div className="form-group">
                    <label>Description *</label>

                    <textarea
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                        placeholder="Enter product description"
                        rows="5"
                    />
                </div>


                <div className="form-group">
                    <label>Price *</label>

                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Enter price"
                        min="0"
                    />
                </div>


                <div className="form-group">
                    <label>Category *</label>

                    <select
                        value={category}
                        onChange={(e) =>
                            setCategory(e.target.value)
                        }
                    >
                        <option value="">
                            Select category
                        </option>

                        {categories.map((cat) => (
                            <option
                                key={cat._id}
                                value={cat._id}
                            >
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>


                <div className="form-group">
                    <label>Product Images *</label>

                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesChange}
                    />

                    <small>
                        Maximum 5 images • Maximum 5 MB each
                    </small>


                    <div className="image-previews">
                        {previews.map((preview, index) => (
                            <div
                                className="image-preview"
                                key={preview}
                            >
                                <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeImage(index)
                                    }
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>


                <div className="form-group">
                    <label>Status</label>

                    <select
                        value={isActive}
                        onChange={(e) =>
                            setIsActive(e.target.value === "true")
                        }
                    >
                        <option value="true">
                            Active
                        </option>

                        <option value="false">
                            Inactive
                        </option>
                    </select>
                </div>


                <div className="form-actions">

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/products")
                        }
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create Product"}
                    </button>

                </div>

            </form>
        </div>
    );
}