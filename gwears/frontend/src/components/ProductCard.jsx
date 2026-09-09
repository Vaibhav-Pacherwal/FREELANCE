import { useNavigate } from "react-router-dom";

import { useWishlist } from "../utils/WishlistContext.jsx";
import { useUserAuth } from "../utils/UserAuthContext.jsx";

import { useSnackbar } from "../utils/SnackbarContext.jsx";

import { useState } from "react";

export default function ProductCard({ product }) {

    const navigate = useNavigate();

    const { user } = useUserAuth();

    const { showSnackbar } = useSnackbar();

    const [wishlistLoading, setWishlistLoading] = useState(false);

    const {
        toggleWishlist,
        isWishlisted,
    } = useWishlist();


    const activeVariant =
        product.variants?.find(
            (variant) => variant.isActive
        );


    const wishlisted =
        isWishlisted(product._id);


    const handleProductClick = () => {

        navigate(
            `/products/${product._id}`
        );

    };


    const handleWishlistClick = async (e) => {

        e.stopPropagation();

        if (!user) {
            navigate("/login");
            return;
        }

        if (wishlistLoading) return;

        try {

            setWishlistLoading(true);

            const result =
                await toggleWishlist(
                    product._id
                );

            if (!result.success) {

                showSnackbar(
                    result.message ||
                    "Unable to update wishlist",
                    "error"
                );

            }

        } finally {

            setWishlistLoading(false);

        }
    };

    return (

        <div
            className="product-card"
            onClick={handleProductClick}
        >

            <div className="product-image-wrapper">

                {product.images?.length > 0 ? (

                    <img
                        src={product.images[0].url}
                        alt={
                            product.images[0].alt ||
                            product.name
                        }
                        className="product-image"
                    />

                ) : (

                    <div className="no-product-image">
                        No Image
                    </div>

                )}


                <button
                    type="button"
                    className={`wishlist-button ${wishlisted ? "wishlisted" : ""
                        } ${wishlistLoading ? "wishlist-loading" : ""}`}
                    onClick={handleWishlistClick}
                    disabled={wishlistLoading}
                    aria-label={
                        wishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                    }
                >
                    {wishlisted ? "♥" : "♡"}
                </button>

            </div>


            <div className="product-info">

                <p className="product-category">

                    {product.category?.name}

                </p>


                <h3 className="product-name">

                    {product.name}

                </h3>


                <p className="product-price">

                    {activeVariant?.price != null

                        ? `₹${Number(
                            activeVariant.price
                        ).toLocaleString(
                            "en-IN"
                        )}`

                        : "Price unavailable"}

                </p>

            </div>

        </div>

    );

}