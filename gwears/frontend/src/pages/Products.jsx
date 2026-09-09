import { useEffect, useState } from "react";
import {
    useLocation,
} from "react-router-dom";

import API from "../ApiEndpoints.js";
import ProductCard from "../components/ProductCard.jsx";

import "./Products.css";

export default function Products() {

    const location = useLocation();


    const [products, setProducts] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [page, setPage] =
        useState(1);

    const [pagination, setPagination] =
        useState({});

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    const [categories, setCategories] =
        useState([]);

    const [category, setCategory] =
        useState("");


    const [group, setGroup] =
        useState("");


    const limit = 12;


    /* =========================
       READ URL FILTERS
    ========================= */

    useEffect(() => {

        const params =
            new URLSearchParams(
                location.search
            );

        const urlCategory =
            params.get("category") || "";

        const urlGroup =
            params.get("group") || "";


        setCategory(urlCategory);
        setGroup(urlGroup);

        setPage(1);

    }, [location.search]);


    /* =========================
       FETCH CATEGORIES
    ========================= */

    const fetchCategories = async () => {

        try {

            const response = await fetch(
                API.categories
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to fetch categories"
                );
            }

            setCategories(
                (data.categories || [])
                    .filter(
                        (category) =>
                            category.isActive
                    )
            );

        } catch (error) {

            console.error(
                "Fetch categories error:",
                error
            );

        }

    };


    useEffect(() => {

        fetchCategories();

    }, []);


    /* =========================
       FETCH PRODUCTS
    ========================= */

    const fetchProducts = async () => {

        try {

            setLoading(true);
            setError("");


            const params =
                new URLSearchParams({

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

                params.append(
                    "category",
                    category
                );

            }


            if (group) {

                params.append(
                    "group",
                    group
                );

            }


            const response =
                await fetch(
                    `${API.storeProducts}?${params.toString()}`
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to fetch products"
                );

            }


            setProducts(
                data.products || []
            );


            setPagination(
                data.pagination || {}
            );


        } catch (error) {

            console.error(
                "Fetch products error:",
                error
            );

            setError(
                error.message
            );

        } finally {

            setLoading(false);

        }

    };


    /* =========================
       PRODUCT FETCH EFFECT
    ========================= */

    useEffect(() => {

        const timer =
            setTimeout(() => {

                fetchProducts();

            }, 400);


        return () =>
            clearTimeout(timer);

    }, [
        search,
        category,
        group,
        page,
    ]);


    /* =========================
       CATEGORY CHANGE
    ========================= */

    const handleCategoryChange = (
        e
    ) => {

        const value =
            e.target.value;


        setCategory(value);
        setGroup("");
        setPage(1);

    };


    return (

        <div className="products-page">

            <div className="products-header">

                <h1>
                    Products
                </h1>


                <div className="product-filters">

                    {/* SEARCH */}

                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => {

                            setSearch(
                                e.target.value
                            );

                            setPage(1);

                        }}
                    />


                    {/* CATEGORY */}

                    <select
                        value={category}
                        onChange={
                            handleCategoryChange
                        }
                    >

                        <option value="">
                            All Categories
                        </option>


                        {categories.map(
                            (category) => (

                                <option
                                    key={
                                        category._id
                                    }
                                    value={
                                        category._id
                                    }
                                >
                                    {
                                        category.name
                                    }
                                </option>

                            )
                        )}

                    </select>

                </div>

            </div>


            {/* LOADING */}

            {loading && (

                <div className="products-message">
                    Loading products...
                </div>

            )}


            {/* ERROR */}

            {!loading &&
                error && (

                    <div className="products-message error">
                        {error}
                    </div>

                )}


            {/* EMPTY */}

            {!loading &&
                !error &&
                products.length === 0 && (

                    <div className="products-message">
                        No products found.
                    </div>

                )}


            {/* PRODUCTS */}

            {!loading &&
                !error &&
                products.length > 0 && (

                    <div className="products-grid">

                        {products.map(
                            (product) => (

                                <ProductCard
                                    key={
                                        product._id
                                    }
                                    product={
                                        product
                                    }
                                />

                            )
                        )}

                    </div>

                )}


            {/* PAGINATION */}

            {!loading &&
                !error &&
                pagination &&
                pagination.totalPages > 1 && (

                    <div className="pagination">

                        <button
                            disabled={
                                !pagination.hasPreviousPage
                            }
                            onClick={() =>
                                setPage(
                                    (prev) =>
                                        prev - 1
                                )
                            }
                        >
                            Previous
                        </button>


                        <span>

                            Page{" "}
                            {
                                pagination.currentPage
                            }{" "}

                            of{" "}

                            {
                                pagination.totalPages
                            }

                        </span>


                        <button
                            disabled={
                                !pagination.hasNextPage
                            }
                            onClick={() =>
                                setPage(
                                    (prev) =>
                                        prev + 1
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