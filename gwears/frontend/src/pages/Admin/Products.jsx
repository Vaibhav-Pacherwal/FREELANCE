import { useEffect, useState } from "react";
import server from "../../Environment.js";
import { useNavigate } from "react-router-dom";

export default function AdminProducts() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("");

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const [loading, setLoading] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const limit = 12;

    const getPriceDisplay = (product) => {
        const variants = product.variants || [];
        const prices = variants
            .map((variant) => Number(variant.price))
            .filter((price) => !isNaN(price));

        if (!prices.length) {
            return "Price unavailable";
        }

        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (minPrice === maxPrice) {
            return `₹${minPrice.toLocaleString("en-IN")}`;
        }

        return `₹${minPrice.toLocaleString("en-IN")} - ₹${maxPrice.toLocaleString("en-IN")}`;
    };

    const getTotalStock = (product) => {
        return (product.variants || []).reduce(
            (total, variant) => total + Number(variant.stock || 0),
            0
        );
    };

    const handleToggleStatus = async (productId) => {
        try {
            const response = await fetch(
                `${server}/products/${productId}/status`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update product status");
            }

            setProducts((prevProducts) =>
                prevProducts.map((product) =>
                    product._id === productId ? data.product : product
                )
            );
        } catch (error) {
            console.error("Toggle product status error:", error);
        }
    };

    const handleDelete = async () => {
        if (!productToDelete) return;

        try {
            setDeleting(true);

            const response = await fetch(
                `${server}/products/${productToDelete._id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete product");
            }

            setProducts((prevProducts) =>
                prevProducts.filter(
                    (product) => product._id !== productToDelete._id
                )
            );

            setProductToDelete(null);
        } catch (error) {
            console.error("Delete product error:", error);
            alert(error.message || "Failed to delete product");
            setProductToDelete(null);
        } finally {
            setDeleting(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            if (search.trim()) params.append("search", search.trim());
            if (category) params.append("category", category);
            if (status) params.append("status", status);

            params.append("page", page);
            params.append("limit", limit);

            const response = await fetch(
                `${server}/products?${params.toString()}`,
                {
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch products");
            }

            setProducts(data.products || []);
            const pageData = data.pagination || {};
            setPagination({
                totalProducts: pageData.totalProducts ?? data.totalProducts ?? (data.products?.length || 0),
                totalPages: pageData.totalPages ?? data.totalPages ?? 1,
                currentPage: pageData.currentPage ?? data.currentPage ?? page,
                hasNextPage: pageData.hasNextPage ?? (page < (pageData.totalPages || 1)),
                hasPreviousPage: pageData.hasPreviousPage ?? (page > 1),
            });
        } catch (error) {
            console.error("Get products error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchProducts();
        }, 250);

        return () => clearTimeout(timeout);
    }, [search, category, status, page]);

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
            } catch (error) {
                console.error("Get categories error:", error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className="gw-admin-page">
            {/* PAGE HEADER */}
            <div className="gw-page-header">
                <div>
                    <h1 className="gw-page-title">Product Catalog</h1>
                    <p className="gw-page-subtitle">
                        Manage store inventory, variant specifications, retail pricing, and catalog visibility
                    </p>
                </div>
                <button
                    type="button"
                    className="gw-primary-btn"
                    onClick={() => navigate("/admin/products/new")}
                >
                    <i className="fa-solid fa-plus"></i>
                    <span>Add Product</span>
                </button>
            </div>

            {/* FILTERS & SEARCH BAR */}
            <div className="gw-filter-bar">
                <div className="gw-search-box">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                        type="text"
                        className="gw-search-input"
                        placeholder="Search products by name or SKU..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                    {search && (
                        <button
                            type="button"
                            className="gw-search-clear"
                            onClick={() => {
                                setSearch("");
                                setPage(1);
                            }}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    )}
                </div>

                <div className="gw-filter-dropdowns">
                    <select
                        className="gw-select"
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="gw-select"
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Visibility</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>

                <div className="gw-filter-count">
                    <span>Showing</span>
                    <strong>{products.length}</strong>
                    <span>of {pagination.totalProducts || products.length} products</span>
                </div>
            </div>

            {/* PRODUCT CARDS GRID */}
            {loading ? (
                <div className="gw-state-loading">
                    <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
                    <p>Loading products...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="gw-state-empty">
                    <i className="fa-solid fa-box-open fa-3x"></i>
                    <h3>No Products Found</h3>
                    <p>
                        {search || category || status
                            ? "No products match the selected filters. Try broadening your search or resetting filters."
                            : "Your store catalog does not have any products yet. Add your first product to begin."}
                    </p>
                    {search || category || status ? (
                        <button
                            type="button"
                            className="gw-secondary-btn"
                            onClick={() => {
                                setSearch("");
                                setCategory("");
                                setStatus("");
                                setPage(1);
                            }}
                        >
                            Reset All Filters
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="gw-primary-btn"
                            onClick={() => navigate("/admin/products/new")}
                        >
                            <i className="fa-solid fa-plus"></i> Add First Product
                        </button>
                    )}
                </div>
            ) : (
                <div className="gw-products-grid">
                    {products.map((product) => {
                        const totalStock = getTotalStock(product);
                        const variantCount = product.variants?.length || 0;
                        const mainImage = product.images?.[0]?.url;

                        return (
                            <div className="gw-admin-product-card" key={product._id}>
                                {/* IMAGE WRAPPER */}
                                <div className="gw-admin-prod-media">
                                    {mainImage ? (
                                        <img
                                            src={mainImage}
                                            alt={product.images?.[0]?.alt || product.name}
                                            className="gw-admin-prod-img"
                                        />
                                    ) : (
                                        <div className="gw-admin-prod-no-img">
                                            <i className="fa-regular fa-image"></i>
                                            <span>No Image</span>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        className={`gw-status-pill ${product.isActive ? "active" : "inactive"}`}
                                        onClick={() => handleToggleStatus(product._id)}
                                        title="Click to toggle product visibility"
                                    >
                                        <span className="gw-status-dot"></span>
                                        <span>{product.isActive ? "Active" : "Inactive"}</span>
                                    </button>
                                </div>

                                {/* CONTENT BODY */}
                                <div className="gw-admin-prod-body">
                                    <span className="gw-admin-prod-cat">
                                        {product.category?.name || "General Catalog"}
                                    </span>

                                    <h3 className="gw-admin-prod-title" title={product.name}>
                                        {product.name}
                                    </h3>

                                    <div className="gw-admin-prod-price">
                                        {getPriceDisplay(product)}
                                    </div>

                                    <div className="gw-admin-prod-meta">
                                        <span className="gw-meta-badge">
                                            <i className="fa-solid fa-layer-group"></i>
                                            <span>
                                                {variantCount} {variantCount === 1 ? "Variant" : "Variants"}
                                            </span>
                                        </span>

                                        <span className={`gw-stock-badge ${totalStock <= 5 ? (totalStock === 0 ? "out" : "low") : "ok"}`}>
                                            {totalStock === 0
                                                ? "Out of Stock"
                                                : totalStock <= 5
                                                ? `Only ${totalStock} left`
                                                : `${totalStock} in stock`}
                                        </span>
                                    </div>
                                </div>

                                {/* ACTIONS FOOTER */}
                                <div className="gw-admin-prod-actions">
                                    <button
                                        type="button"
                                        className="gw-action-btn edit"
                                        onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                    >
                                        <i className="fa-regular fa-pen-to-square"></i>
                                        <span>Edit</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="gw-action-btn delete"
                                        onClick={() => setProductToDelete(product)}
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

            {/* UNIFIED PAGINATION CONTROL */}
            {products.length > 0 && pagination.totalPages !== undefined && (
                <div className="gw-admin-pagination">
                    <button
                        type="button"
                        className="gw-page-btn"
                        disabled={!pagination.hasPreviousPage}
                        onClick={() => {
                            setPage((prev) => Math.max(1, prev - 1));
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>Previous</span>
                    </button>

                    <div className="gw-page-indicator">
                        <span>Page</span>
                        <strong>{pagination.currentPage || 1}</strong>
                        <span>of</span>
                        <strong>{pagination.totalPages || 1}</strong>
                    </div>

                    <button
                        type="button"
                        className="gw-page-btn"
                        disabled={!pagination.hasNextPage}
                        onClick={() => {
                            setPage((prev) => prev + 1);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                    >
                        <span>Next</span>
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {productToDelete && (
                <div className="gw-modal-backdrop" onClick={() => !deleting && setProductToDelete(null)}>
                    <div className="gw-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="gw-confirm-modal-header">
                            <div className="gw-confirm-icon-wrap">
                                <i className="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <div>
                                <h3>Delete Product</h3>
                                <p>Are you sure you want to permanently remove this product?</p>
                            </div>
                        </div>

                        <div className="gw-confirm-modal-body">
                            <div className="gw-confirm-target">
                                <strong>Product:</strong> {productToDelete.name}
                            </div>
                            <div className="gw-confirm-alert">
                                <i className="fa-solid fa-circle-info"></i>
                                <span>This will remove all associated variants and images from your catalog.</span>
                            </div>
                        </div>

                        <div className="gw-confirm-modal-actions">
                            <button
                                type="button"
                                className="gw-secondary-btn"
                                onClick={() => setProductToDelete(null)}
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