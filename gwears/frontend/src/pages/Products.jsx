import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../Environment.js";

export default function Products() {

    const navigate = useNavigate();

    const [products, setProducts] = useState([]);

    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const limit = 12;


    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

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

            const response = await fetch(
                `${server}/store/products?${params.toString()}`
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
                "Fetch products error:",
                error
            );

            setError(error.message);

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
    ]);


    const handleProductClick = (productId) => {
        navigate(`/products/${productId}`);
    };


    return (
        <div>

            <h1>Products</h1>


            {/* Search */}

            <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                }}
            />


            {/* Loading */}

            {loading && (
                <p>
                    Loading products...
                </p>
            )}


            {/* Error */}

            {!loading && error && (
                <p>
                    {error}
                </p>
            )}


            {/* Products */}

            {!loading && !error && (
                <>
                    {products.length === 0 ? (
                        <p>
                            No products found.
                        </p>
                    ) : (
                        products.map((product) => (
                            <div
                                key={product._id}
                                onClick={() =>
                                    handleProductClick(
                                        product._id
                                    )
                                }
                            >

                                <h3>
                                    {product.name}
                                </h3>

                                <p>
                                    {product.description}
                                </p>

                                <p>
                                    Category:{" "}
                                    {product.category?.name}
                                </p>


                                {product.images?.length > 0 && (
                                    <img
                                        src={
                                            product
                                                .images[0]
                                                .url
                                        }
                                        alt={
                                            product
                                                .images[0]
                                                .alt ||
                                            product.name
                                        }
                                        width="150"
                                    />
                                )}

                            </div>
                        ))
                    )}
                </>
            )}


            {/* Pagination */}

            {!loading &&
                !error &&
                pagination &&
                pagination.totalPages > 1 && (

                    <div>

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
                            {" "}
                            Page{" "}
                            {pagination.currentPage}{" "}
                            of{" "}
                            {pagination.totalPages}{" "}
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
                )}

        </div>
    );
}