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

    const [productToDelete, setProductToDelete] =
        useState(null);

    const [deleting, setDeleting] = useState(false);

    const limit = 10;


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

        return `₹${minPrice.toLocaleString(
            "en-IN"
        )} - ₹${maxPrice.toLocaleString("en-IN")}`;
    };


    const getTotalStock = (product) => {
        return (product.variants || []).reduce(
            (total, variant) =>
                total + Number(variant.stock || 0),
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
                throw new Error(
                    data.message ||
                    "Failed to update product status"
                );
            }

            setProducts((prevProducts) =>
                prevProducts.map((product) =>
                    product._id === productId
                        ? data.product
                        : product
                )
            );

        } catch (error) {
            console.error(
                "Toggle product status error:",
                error
            );
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
                throw new Error(
                    data.message ||
                    "Failed to delete product"
                );
            }

            setProductToDelete(null);

            fetchProducts();

        } catch (error) {
            console.error(
                "Delete product error:",
                error
            );
        } finally {
            setDeleting(false);
        }
    };


    const fetchProducts = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page,
                limit,
            });

            if (search.trim()) {
                params.append(
                    "search",
                    search.trim()
                );
            }

            if (category) {
                params.append("category", category);
            }

            if (status) {
                params.append("status", status);
            }

            const response = await fetch(
                `${server}/products?${params.toString()}`,
                {
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to fetch products"
                );
            }

            setProducts(data.products || []);
            setPagination(data.pagination || {});

        } catch (error) {
            console.error(
                "Get products error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 400);

        return () => clearTimeout(timer);
    }, [
        search,
        page,
        category,
        status,
    ]);


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
                        data.message ||
                        "Failed to fetch categories"
                    );
                }

                setCategories(
                    data.categories || []
                );

            } catch (error) {
                console.error(
                    "Get categories error:",
                    error
                );
            }
        };

        fetchCategories();
    }, []);


    return (
        <div className="products-page">

            <div className="products-header">
                <h1>Products</h1>

                <button
                    onClick={() =>
                        navigate(
                            "/admin/products/new"
                        )
                    }
                >
                    + Add Product
                </button>
            </div>


            <div className="products-filters">

                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />


                <select
                    value={category}
                    onChange={(e) => {
                        setCategory(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="">
                        Category
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


                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="">
                        Status
                    </option>

                    <option value="active">
                        Active
                    </option>

                    <option value="inactive">
                        Inactive
                    </option>
                </select>

            </div>


            <div className="products-grid">

                {loading ? (
                    <div className="products-state">
                        Loading products...
                    </div>

                ) : products.length === 0 ? (
                    <div className="products-state">
                        No products found.
                    </div>

                ) : (
                    products.map((product) => {

                        const totalStock =
                            getTotalStock(product);

                        const variantCount =
                            product.variants?.length || 0;

                        return (
                            <div
                                className="product-card"
                                key={product._id}
                            >

                                <div className="product-card-image">
                                    <img
                                        src={
                                            product
                                                .images?.[0]?.url
                                        }
                                        alt={
                                            product
                                                .images?.[0]?.alt ||
                                            product.name
                                        }
                                    />
                                </div>


                                <div className="product-card-content">

                                    <div className="product-card-top">

                                        <h3>
                                            {product.name}
                                        </h3>

                                        <button
                                            className={
                                                product.isActive
                                                    ? "status-active"
                                                    : "status-inactive"
                                            }
                                            onClick={() =>
                                                handleToggleStatus(
                                                    product._id
                                                )
                                            }
                                        >
                                            {product.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </button>

                                    </div>


                                    <p className="product-card-category">
                                        {product.category?.name ||
                                            "No category"}
                                    </p>


                                    <p className="product-card-price">
                                        {getPriceDisplay(
                                            product
                                        )}
                                    </p>


                                    <div className="product-card-meta">

                                        <span>
                                            {variantCount}{" "}
                                            {variantCount === 1
                                                ? "Variant"
                                                : "Variants"}
                                        </span>

                                        <span>
                                            {totalStock} in stock
                                        </span>

                                    </div>


                                    <div className="product-card-actions">

                                        <button
                                            className="edit-btn"
                                            onClick={() =>
                                                navigate(
                                                    `/admin/products/edit/${product._id}`
                                                )
                                            }
                                        >
                                            Edit
                                        </button>


                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                setProductToDelete(
                                                    product
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </div>
                        );
                    })
                )}

            </div>


            <div className="products-pagination">

                <button
                    disabled={
                        !pagination.hasPreviousPage
                    }
                    onClick={() =>
                        setPage(
                            (prev) => prev - 1
                        )
                    }
                >
                    Previous
                </button>


                <span>
                    Page{" "}
                    {pagination.currentPage || 1}{" "}
                    of{" "}
                    {pagination.totalPages || 1}
                </span>


                <button
                    disabled={
                        !pagination.hasNextPage
                    }
                    onClick={() =>
                        setPage(
                            (prev) => prev + 1
                        )
                    }
                >
                    Next
                </button>

            </div>


            {productToDelete && (

                <div className="delete-modal-overlay">

                    <div className="delete-modal">

                        <h3>
                            Delete Product?
                        </h3>

                        <p>
                            Are you sure you want to
                            delete
                            <strong>
                                {" "}
                                {productToDelete.name}
                            </strong>?
                        </p>

                        <p className="delete-warning">
                            This action cannot be undone.
                        </p>


                        <div className="delete-modal-actions">

                            <button
                                onClick={() =>
                                    setProductToDelete(null)
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
                                    : "Delete Product"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}