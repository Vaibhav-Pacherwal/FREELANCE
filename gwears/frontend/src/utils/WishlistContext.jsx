import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import API from "../ApiEndpoints.js";
import { useUserAuth } from "./UserAuthContext.jsx";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {

    const { user, loading: authLoading } = useUserAuth();

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = async () => {

        if (!user) {
            setWishlist([]);
            return;
        }

        try {

            setLoading(true);

            const response = await fetch(
                API.wishlist,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to fetch wishlist"
                );
            }

            setWishlist(data.products || []);

        } catch (error) {

            console.error(
                "Fetch wishlist error:",
                error
            );

            setWishlist([]);

        } finally {

            setLoading(false);

        }
    };

    const addToWishlist = async (productId) => {

        try {

            const response = await fetch(
                `${API.wishlist}/${productId}`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to add to wishlist"
                );
            }

            await fetchWishlist();

            return {
                success: true,
                message: data.message,
            };

        } catch (error) {

            console.error(
                "Add to wishlist error:",
                error
            );

            return {
                success: false,
                message: error.message,
            };
        }
    };

    const removeFromWishlist = async (productId) => {

        try {

            const response = await fetch(
                `${API.wishlist}/${productId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to remove from wishlist"
                );
            }

            await fetchWishlist();

            return {
                success: true,
                message: data.message,
            };

        } catch (error) {

            console.error(
                "Remove from wishlist error:",
                error
            );

            return {
                success: false,
                message: error.message,
            };
        }
    };


    // Check whether product is wishlisted
    const isWishlisted = (productId) => {

        return wishlist.some(
            (product) => product._id === productId
        );

    };

    const toggleWishlist = async (productId) => {

        if (isWishlisted(productId)) {

            return await removeFromWishlist(
                productId
            );

        }

        return await addToWishlist(
            productId
        );
    };


    useEffect(() => {

        if (authLoading) {
            return;
        }

        fetchWishlist();

    }, [user, authLoading]);


    const wishlistCount = wishlist.length;


    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                loading,
                wishlistCount,
                fetchWishlist,
                addToWishlist,
                removeFromWishlist,
                isWishlisted,
                toggleWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}


export function useWishlist() {

    const context = useContext(
        WishlistContext
    );

    if (!context) {
        throw new Error(
            "useWishlist must be used inside WishlistProvider"
        );
    }

    return context;
}