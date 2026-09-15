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

            const response = await fetch(`${server}/categories`, {
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch categories");
            }

            setCategories(data.categories || []);
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
                throw new Error(data.message || "Failed to update category status");
            }

            setCategories((prevCategories) =>
                prevCategories.map((cat) =>
                    cat._id === categoryId ? data.category : cat
                )
            );
        } catch (error) {
            console.error("Toggle category status error:", error);
        }
    };

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
                throw new Error(data.message || "Failed to delete category");
            }

            setCategoryToDelete(null);
            fetchCategories();
        } catch (error) {
            console.error("Delete category error:", error);
            setErrorMessage(error.message);
            setCategoryToDelete(null);
            setTimeout(() => {
                setErrorMessage("");
            }, 5000);
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        (cat.group && cat.group.toLowerCase().includes(search.toLowerCase()))
    );

    const getGroupIcon = (group) => {
        const g = (group || "").toLowerCase();
        if (g === "footwear") return "fa-solid fa-shoe-prints";
        if (g === "accessories") return "fa-solid fa-hat-cowboy";
        return "fa-solid fa-shirt";
    };

    return (
        <div className="gw-admin-page">
            {/* PAGE HEADER */}
            <div className="gw-page-header">
                <div>
                    <h1 className="gw-page-title">Product Categories</h1>
                    <p className="gw-page-subtitle">
                        Organize and structure store catalog across apparel, footwear, and accessories
                    </p>
                </div>
                <button
                    type="button"
                    className="gw-primary-btn"
                    onClick={() => navigate("/admin/categories/new")}
                >
                    <i className="fa-solid fa-plus"></i>
                    <span>Add Category</span>
                </button>
            </div>

            {/* FILTER & STATS BAR */}
            <div className="gw-filter-bar">
                <div className="gw-search-box">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                        type="text"
                        className="gw-search-input"
                        placeholder="Search categories or groups..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            type="button"
                            className="gw-search-clear"
                            onClick={() => setSearch("")}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    )}
                </div>

                <div className="gw-filter-count">
                    <span>Showing</span>
                    <strong>{filteredCategories.length}</strong>
                    <span>of {categories.length} categories</span>
                </div>
            </div>

            {/* ERROR NOTIFICATION TOAST */}
            {errorMessage && (
                <div className="gw-alert-toast error">
                    <div className="gw-alert-icon">
                        <i className="fa-solid fa-circle-exclamation"></i>
                    </div>
                    <div className="gw-alert-text">
                        <strong>Action Failed</strong>
                        <span>{errorMessage}</span>
                    </div>
                    <button
                        type="button"
                        className="gw-alert-close"
                        onClick={() => setErrorMessage("")}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            )}

            {/* CATEGORIES GRID */}
            {loading ? (
                <div className="gw-state-loading">
                    <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
                    <p>Loading categories...</p>
                </div>
            ) : filteredCategories.length === 0 ? (
                <div className="gw-state-empty">
                    <i className="fa-solid fa-tags fa-3x"></i>
                    <h3>No Categories Found</h3>
                    <p>
                        {search
                            ? `No categories matching "${search}". Try searching with a different keyword.`
                            : "Your store does not have any categories yet. Create your first category to begin organizing products."}
                    </p>
                    {search ? (
                        <button
                            type="button"
                            className="gw-secondary-btn"
                            onClick={() => setSearch("")}
                        >
                            Clear Search
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="gw-primary-btn"
                            onClick={() => navigate("/admin/categories/new")}
                        >
                            <i className="fa-solid fa-plus"></i> Add Category
                        </button>
                    )}
                </div>
            ) : (
                <div className="gw-categories-grid">
                    {filteredCategories.map((category) => {
                        const groupIcon = getGroupIcon(category.group);
                        const groupLabel = (category.group || "clothing").toUpperCase();

                        return (
                            <div className="gw-category-card" key={category._id}>
                                <div className="gw-category-card-top">
                                    <span className={`gw-group-pill ${category.group || "clothing"}`}>
                                        <i className={groupIcon}></i>
                                        <span>{groupLabel}</span>
                                    </span>

                                    <button
                                        type="button"
                                        className={`gw-status-pill ${category.isActive ? "active" : "inactive"}`}
                                        onClick={() => handleToggleStatus(category._id)}
                                        title="Click to toggle category visibility"
                                    >
                                        <span className="gw-status-dot"></span>
                                        <span>{category.isActive ? "Active" : "Inactive"}</span>
                                    </button>
                                </div>

                                <div className="gw-category-card-body">
                                    <h3 className="gw-category-title">{category.name}</h3>
                                    <p className="gw-category-desc">
                                        {category.description || "No description provided for this category."}
                                    </p>
                                </div>

                                <div className="gw-category-card-actions">
                                    <button
                                        type="button"
                                        className="gw-action-btn edit"
                                        onClick={() => navigate(`/admin/categories/edit/${category._id}`)}
                                    >
                                        <i className="fa-regular fa-pen-to-square"></i>
                                        <span>Edit</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="gw-action-btn delete"
                                        onClick={() => setCategoryToDelete(category)}
                                    >
                                        <i className="fa-regular fa-trash-can"></i>
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {categoryToDelete && (
                <div className="gw-modal-backdrop" onClick={() => !deleting && setCategoryToDelete(null)}>
                    <div className="gw-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="gw-confirm-modal-header">
                            <div className="gw-confirm-icon-wrap">
                                <i className="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <div>
                                <h3>Delete Category</h3>
                                <p>Are you sure you want to permanently delete this category?</p>
                            </div>
                        </div>

                        <div className="gw-confirm-modal-body">
                            <div className="gw-confirm-target">
                                <strong>Category:</strong> {categoryToDelete.name}
                            </div>
                            <div className="gw-confirm-alert">
                                <i className="fa-solid fa-circle-info"></i>
                                <span>Categories with active products assigned to them cannot be deleted.</span>
                            </div>
                        </div>

                        <div className="gw-confirm-modal-actions">
                            <button
                                type="button"
                                className="gw-secondary-btn"
                                onClick={() => setCategoryToDelete(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="gw-danger-btn"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <>
                                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-regular fa-trash-can"></i>
                                        <span>Confirm Delete</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}