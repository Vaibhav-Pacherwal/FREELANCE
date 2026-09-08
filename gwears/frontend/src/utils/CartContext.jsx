import { createContext, useContext, useEffect, useState } from "react";
import server from "../Environment.js";
import { useUserAuth } from "./UserAuthContext.jsx";

const CartContext = createContext();

export function CartProvider({ children }) {

    const { user, loading: authLoading } = useUserAuth();

    const [cart, setCart] = useState({
        items: [],
    });

    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {

        if (!user) {
            setCart({ items: [] });
            return;
        }

        try {

            setLoading(true);

            const response = await fetch(`${server}/cart`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch cart");
            }

            setCart(data.cart);

        } catch (error) {

            console.error("Fetch cart error:", error);

        } finally {

            setLoading(false);

        }
    };

    const addToCart = async (productId, variantId, quantity = 1) => {

        try {

            const response = await fetch(`${server}/cart/items`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId,
                    variantId,
                    quantity,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to add item");
            }

            setCart(data.cart);

            return {
                success: true,
                message: data.message,
            };

        } catch (error) {

            console.error("Add to cart error:", error);

            return {
                success: false,
                message: error.message,
            };

        }
    };

    const updateCartItem = async (itemId, quantity) => {

        try {

            const response = await fetch(
                `${server}/cart/items/${itemId}`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        quantity,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update cart");
            }

            setCart(data.cart);

            return {
                success: true,
                message: data.message,
            };

        } catch (error) {

            console.error("Update cart error:", error);

            return {
                success: false,
                message: error.message,
            };

        }
    };

    const removeCartItem = async (itemId) => {

        try {

            const response = await fetch(
                `${server}/cart/items/${itemId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to remove item");
            }

            setCart(data.cart);

            return {
                success: true,
                message: data.message,
            };

        } catch (error) {

            console.error("Remove cart item error:", error);

            return {
                success: false,
                message: error.message,
            };

        }
    };

    const clearCart = async () => {

        try {

            const response = await fetch(`${server}/cart`, {
                method: "DELETE",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to clear cart");
            }

            setCart(data.cart);

            return {
                success: true,
                message: data.message,
            };

        } catch (error) {

            console.error("Clear cart error:", error);

            return {
                success: false,
                message: error.message,
            };

        }
    };

    useEffect(() => {

        if (authLoading) return;

        fetchCart();

    }, [user, authLoading]);

    const cartCount = cart.items.reduce(
        (total, item) => total + item.quantity,
        0
    );


    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                cartCount,
                fetchCart,
                addToCart,
                updateCartItem,
                removeCartItem,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}


export function useCart() {

    const context = useContext(CartContext);

    if (!context) {
        throw new Error(
            "useCart must be used inside CartProvider"
        );
    }

    return context;
}