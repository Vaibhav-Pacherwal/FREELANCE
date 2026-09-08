import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import server from "../../Environment.js";

export default function EditCategory() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        // isActive: true,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await fetch(
                    `${server}/categories/${id}`,
                    {
                        credentials: "include",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to fetch category"
                    );
                }

                setFormData({
                    name: data.category.name || "",
                    description: data.category.description || "",
                    // isActive: data.category.isActive,
                });
            } catch (error) {
                console.error("Get category error:", error);
                alert(error.message);
                navigate("/admin/categories");
            } finally {
                setLoading(false);
            }
        };

        fetchCategory();
    }, [id, navigate]);

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
            setSaving(true);

            const response = await fetch(
                `${server}/categories/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        name: formData.name,
                        description: formData.description,
                        // isActive: formData.isActive,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update category"
                );
            }

            navigate("/admin/categories");
        } catch (error) {
            console.error("Update category error:", error);
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div>Loading category...</div>;
    }

    return (
        <div className="category-form-page">

            <div className="category-form-header">
                <h1>Edit Category</h1>

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
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : "Save Changes"}
                </button>

            </form>

        </div>
    );
}