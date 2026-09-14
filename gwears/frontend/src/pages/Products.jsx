import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import API from "../ApiEndpoints.js";
import ProductCard from "../components/ProductCard.jsx";
import "./Products.css";

export default function Products() {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [group, setGroup] = useState("");

  const limit = 12;

  // Sync URL search params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlCategory = params.get("category") || "";
    const urlGroup = params.get("group") || "";
    const urlSearch = params.get("search") || "";

    setCategory(urlCategory);
    setGroup(urlGroup);
    setSearch(urlSearch);
    setPage(1);
  }, [location.search]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(API.categories);
        const data = await response.json();
        if (response.ok) {
          setCategories(
            (data.categories || []).filter((cat) => cat.isActive)
          );
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (category) params.append("category", category);
      if (group) params.append("group", group);
      params.append("page", page);
      params.append("limit", limit);

      const response = await fetch(`${API.storeProducts}?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      setProducts(data.products || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error("Fetch products error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, group, page]);

  const handleGroupSelect = (selectedGroup) => {
    const params = new URLSearchParams(location.search);
    if (selectedGroup) {
      params.set("group", selectedGroup);
    } else {
      params.delete("group");
    }
    params.delete("category"); // reset specific category when changing group
    params.delete("page");
    navigate(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const params = new URLSearchParams(location.search);
    if (catId) {
      params.set("category", catId);
    } else {
      params.delete("category");
    }
    params.delete("page");
    navigate(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    navigate("/products");
  };

  // Find active category name for chip
  const activeCategoryObj = categories.find((c) => c._id === category);

  // Group title for banner
  const pageTitle = group
    ? `${group.toUpperCase()} COLLECTION`
    : activeCategoryObj
    ? `${activeCategoryObj.name.toUpperCase()}`
    : "ALL PRODUCTS";

  return (
    <div className="products-page">
      {/* EDITORIAL BANNER */}
      <div className="gw-plp-banner">
        <span className="gw-plp-badge">MEN'S FASHION</span>
        <h1 className="gw-plp-title">{pageTitle}</h1>
        <p className="gw-plp-subtitle">
          Browse our curated selection of quality shirts, t-shirts, denim, jackets, footwear, and accessories.
        </p>
      </div>

      {/* GROUP TABS (ALL / CLOTHING / FOOTWEAR / ACCESSORIES) */}
      <div className="gw-group-tabs">
        <button
          className={`gw-group-tab ${!group && !category ? "active" : ""}`}
          onClick={() => handleGroupSelect("")}
        >
          All Products
        </button>
        <button
          className={`gw-group-tab ${group === "clothing" ? "active" : ""}`}
          onClick={() => handleGroupSelect("clothing")}
        >
          Clothing
        </button>
        <button
          className={`gw-group-tab ${group === "footwear" ? "active" : ""}`}
          onClick={() => handleGroupSelect("footwear")}
        >
          Footwear
        </button>
        <button
          className={`gw-group-tab ${group === "accessories" ? "active" : ""}`}
          onClick={() => handleGroupSelect("accessories")}
        >
          Accessories
        </button>
      </div>

      {/* TOOLBAR: SEARCH & CATEGORY FILTER */}
      <div className="gw-plp-toolbar">
        <div className="gw-plp-counts">
          {pagination.totalProducts != null
            ? `Showing ${products.length} of ${pagination.totalProducts} products`
            : `Showing ${products.length} products`}
        </div>

        <div className="gw-plp-filters-right">
          {/* SEARCH BOX */}
          <div className="gw-plp-search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="gw-plp-search-input"
            />
          </div>

          {/* SPECIFIC CATEGORY SELECT */}
          <select
            value={category}
            onChange={handleCategoryChange}
            className="gw-plp-select"
          >
            <option value="">Filter by Category</option>
            {categories
              .filter((c) => !group || c.group === group)
              .map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* ACTIVE FILTER CHIPS */}
      {(group || category || search) && (
        <div className="gw-active-chips">
          <span style={{ fontSize: "0.78rem", color: "#737373", fontWeight: 600 }}>
            Active filters:
          </span>
          {group && (
            <span className="gw-active-chip">
              Group: {group.toUpperCase()}{" "}
              <button
                className="gw-chip-close"
                onClick={() => handleGroupSelect("")}
              >
                &times;
              </button>
            </span>
          )}
          {activeCategoryObj && (
            <span className="gw-active-chip">
              Category: {activeCategoryObj.name}{" "}
              <button
                className="gw-chip-close"
                onClick={() => handleCategoryChange({ target: { value: "" } })}
              >
                &times;
              </button>
            </span>
          )}
          {search && (
            <span className="gw-active-chip">
              Search: "{search}"{" "}
              <button
                className="gw-chip-close"
                onClick={() => setSearch("")}
              >
                &times;
              </button>
            </span>
          )}
          <button className="gw-chip-clear-all" onClick={clearAllFilters}>
            Clear all
          </button>
        </div>
      )}

      {/* LOADING SHIMMER */}
      {loading && (
        <div className="gw-plp-skeleton-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="gw-plp-skeleton-card"></div>
          ))}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {!loading && error && (
        <div className="gw-plp-empty">
          <i className="fa-solid fa-triangle-exclamation fa-3x" style={{ color: "#DC2626" }}></i>
          <h3>Catalog Temporarily Unavailable</h3>
          <p>{error}</p>
          <button className="gw-btn gw-btn-primary" onClick={fetchProducts}>
            RETRY
          </button>
        </div>
      )}

      {/* EMPTY RESULTS */}
      {!loading && !error && products.length === 0 && (
        <div className="gw-plp-empty">
          <i className="fa-regular fa-folder-open fa-3x"></i>
          <h3>No Products Found</h3>
          <p>We could not find any products matching your selected filters.</p>
          <button className="gw-btn gw-btn-primary" onClick={clearAllFilters}>
            RESET ALL FILTERS
          </button>
        </div>
      )}

      {/* PRODUCTS GRID */}
      {!loading && !error && products.length > 0 && (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {!loading && !error && pagination && pagination.totalPages > 1 && (
        <div className="gw-plp-pagination">
          <button
            className="gw-page-btn"
            disabled={!pagination.hasPreviousPage}
            onClick={() => {
              setPage((prev) => prev - 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            &larr; PREVIOUS
          </button>

          <span className="gw-page-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            className="gw-page-btn"
            disabled={!pagination.hasNextPage}
            onClick={() => {
              setPage((prev) => prev + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            NEXT &rarr;
          </button>
        </div>
      )}
    </div>
  );
}