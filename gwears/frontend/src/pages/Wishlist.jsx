import { useWishlist } from "../utils/WishlistContext.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { useNavigate } from "react-router-dom";
import "./Wishlist.css";

export default function Wishlist() {
    const navigate = useNavigate();

    const {
        wishlist,
        loading,
    } = useWishlist();


    if (loading) {
        return (
            <div className="wishlist-page">
                <div className="wishlist-message">
                    Loading wishlist...
                </div>
            </div>
        );
    }


    return (
        <div className="wishlist-page">

            <div className="wishlist-header">
                <h1>My Wishlist</h1>

                {wishlist.length > 0 && (
                    <span>
                        {wishlist.length}{" "}
                        {wishlist.length === 1
                            ? "item"
                            : "items"}
                    </span>
                )}
            </div>


            {wishlist.length === 0 ? (

                <div className="wishlist-message">

                    <h2>Your wishlist is empty</h2>

                    <p>
                        Save products you love
                        and find them here later.
                    </p>

                    <button onClick={() => navigate("/products")}>
                        Browse Products
                    </button>

                </div>

            ) : (

                <div className="products-grid">

                    {wishlist.map((product) => (

                        <ProductCard
                            key={product._id}
                            product={product}
                        />

                    ))}

                </div>

            )}

        </div>
    );
}