import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../../Environment.js";

export default function Categories() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchCategories = async () => {
        try {
            setLoading(true);

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

            setCategories(data.categories);
        } catch (error) {
            console.error("Get categories error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (categoryId) => {
        try {
            const response = await fetch(
                `${server}/categories/${categoryId}/status`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update category status"
                );
            }

            setCategories((prevCategories) =>
                prevCategories.map((category) =>
                    category._id === categoryId
                        ? data.category
                        : category
                )
            );

        } catch (error) {
            console.error(
                "Toggle category status error:",
                error
            );
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        try {
            setDeleting(true);

            const response = await fetch(
                `${server}/categories/${categoryToDelete._id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete category"
                );
            }

            setCategoryToDelete(null);

            fetchCategories();
        } catch (error) {
            console.error("Delete category error:", error);

            setErrorMessage(error.message);

            setCategoryToDelete(null);

            setTimeout(() => {
                setErrorMessage("");
            }, 4000);
        }
        finally {
            setDeleting(false);
        }
    };

    const filteredCategories = categories.filter((category) =>
        category.name
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="categories-page">

            <div className="categories-header">
                <h1>Categories</h1>

                <button
                    onClick={() =>
                        navigate("/admin/categories/new")
                    }
                >
                    + Add Category
                </button>
            </div>

            <div className="categories-filters">

                <input
                    type="text"
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

            </div>

            <div className="categories-grid">

                {loading ? (
                    <div className="categories-state">
                        Loading categories...
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="categories-state">
                        No categories found.
                    </div>
                ) : (
                    filteredCategories.map((category) => (
                        <div
                            className="category-card"
                            key={category._id}
                        >

                            <div className="category-card-content">

                                <div className="category-card-top">

                                    <h3>{category.name}</h3>

                                    <button
                                        className={
                                            category.isActive
                                                ? "status-active"
                                                : "status-inactive"
                                        }
                                        onClick={() => handleToggleStatus(category._id)}
                                        title="Click to toggle status"
                                    >
                                        {category.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </button>

                                </div>

                                <p className="category-card-description">
                                    {category.description ||
                                        "No description available."}
                                </p>

                                <div className="category-card-actions">

                                    <button
                                        className="edit-btn"
                                        onClick={() =>
                                            navigate(
                                                `/admin/categories/edit/${category._id}`
                                            )
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="delete-btn"
                                        onClick={() =>
                                            setCategoryToDelete(category)
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        </div>
                    ))
                )}

            </div>
            {categoryToDelete && (
                <div className="delete-modal-overlay">

                    <div className="delete-modal">

                        <h3>Delete Category?</h3>

                        <p>
                            Are you sure you want to delete
                            <strong>
                                {" "}
                                {categoryToDelete.name}
                            </strong>
                            ?
                        </p>

                        <p className="delete-warning">
                            Categories containing products
                            cannot be deleted.
                        </p>

                        <div className="delete-modal-actions">

                            <button
                                onClick={() =>
                                    setCategoryToDelete(null)
                                }
                                disabled={deleting}
                            >
                                Cancel
                            </button>

                            <button
                                className="delete-confirm-btn"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting
                                    ? "Deleting..."
                                    : "Delete Category"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {errorMessage && (
                <div className="category-error-message">
                    <span>{errorMessage}</span>

                    <button
                        onClick={() => setErrorMessage("")}
                    >
                        ×
                    </button>
                </div>
            )}

        </div>
    );
}