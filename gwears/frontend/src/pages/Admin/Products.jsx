import { useEffect, useState } from "react";
import server from "../../Environment.js";
import { useNavigate } from "react-router-dom";

export default function Products() {
    
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("");

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const [loading, setLoading] = useState(false);

    const limit = 10;

    const fetchProducts = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page,
                limit,
            });

            if (search.trim()) {
                params.append("search", search.trim());
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
                throw new Error(data.message || "Failed to fetch products");
            }

            setProducts(data.products);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Get products error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page, category, status]);

    return (
        <div className="products-page">

            <div className="products-header">
                <h1>Products</h1>

                <button onClick={() => navigate("/admin/products/new")}>
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
                    <option value="">Category</option>

                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
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
                    <option value="">Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>

            </div>

            <div className="products-table-wrapper">

                <table className="products-table">

                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {loading ? (
                            <tr>
                                <td colSpan="6">
                                    Loading products...
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan="6">
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product._id}>

                                    <td>
                                        <img
                                            src={product.images?.[0]?.url}
                                            alt={product.name}
                                            className="product-thumbnail"
                                        />
                                    </td>

                                    <td>
                                        {product.name}
                                    </td>

                                    <td>
                                        {product.category?.name || "—"}
                                    </td>

                                    <td>
                                        ₹{product.price}
                                    </td>

                                    <td>
                                        <span
                                            className={
                                                product.isActive
                                                    ? "status-active"
                                                    : "status-inactive"
                                            }
                                        >
                                            {product.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </td>

                                    <td>
                                        <button>
                                            Edit
                                        </button>

                                        <button>
                                            Delete
                                        </button>
                                    </td>

                                </tr>
                            ))
                        )}

                    </tbody>

                </table>

            </div>

            <div className="products-pagination">

                <button
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => setPage((prev) => prev - 1)}
                >
                    Previous
                </button>

                <span>
                    Page {pagination.currentPage || 1} of{" "}
                    {pagination.totalPages || 1}
                </span>

                <button
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPage((prev) => prev + 1)}
                >
                    Next
                </button>

            </div>

        </div>
    );
}