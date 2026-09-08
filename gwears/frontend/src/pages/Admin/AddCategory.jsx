import { useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../../Environment.js";

export default function AddCategory() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        // isActive: true,
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert("Category name is required");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${server}/categories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    // isActive: formData.isActive,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to create category"
                );
            }

            navigate("/admin/categories");
        } catch (error) {
            console.error("Create category error:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="category-form-page">

            <div className="category-form-header">
                <h1>Add Category</h1>

                <button
                    type="button"
                    onClick={() => navigate("/admin/categories")}
                >
                    Cancel
                </button>
            </div>

            <form
                className="category-form"
                onSubmit={handleSubmit}
            >

                <div className="form-group">
                    <label htmlFor="name">
                        Category Name
                    </label>

                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter category name"
                        maxLength={100}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">
                        Description
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter category description"
                        maxLength={500}
                        rows={5}
                    />
                </div>

                {/* <div className="form-checkbox">
                    <input
                        id="isActive"
                        name="isActive"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={handleChange}
                    />

                    <label htmlFor="isActive">
                        Active
                    </label>
                </div> */}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Creating..."
                        : "Create Category"}
                </button>

            </form>

        </div>
    );
}