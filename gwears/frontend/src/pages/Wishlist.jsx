import { useWishlist } from "../utils/WishlistContext.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { useNavigate } from "react-router-dom";
import "./Wishlist.css";

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlist, loading } = useWishlist();

  if (loading) {
    return (
      <div className="wishlist-page" style={{ textAlign: "center", padding: "8rem 1rem" }}>
        <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
        <p style={{ marginTop: "1rem", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.82rem", color: "#737373" }}>
          Unlocking your private wishlist...
        </p>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>PRIVATE WISHLIST</h1>
        {wishlist.length > 0 && (
          <span>
            &bull; {wishlist.length} creation{wishlist.length === 1 ? "" : "s"} saved
          </span>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="wishlist-empty-state">
          <i className="fa-regular fa-heart fa-3x"></i>
          <h2>Your Wishlist is Empty</h2>
          <p>
            Save your favorite bespoke silhouettes and curated wardrobe pieces to reserve your inspiration for future acquisitions.
          </p>
          <button className="gw-btn gw-btn-primary" onClick={() => navigate("/products")}>
            DISCOVER ATELIER CREATIONS
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}