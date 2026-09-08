import { useCart } from "../utils/CartContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Cart() {

    const navigate = useNavigate();

    const {
        cart,
        loading,
        updateCartItem,
        removeCartItem,
        clearCart,
    } = useCart();


    if (loading) {
        return <div>Loading cart...</div>;
    }


    if (cart.items.length === 0) {

        return (
            <div>

                <h1>Your Cart</h1>

                <p>Your cart is empty.</p>

                <button onClick={() => navigate("/")}>
                    Continue Shopping
                </button>

            </div>
        );
    }


    return (
        <div>

            <h1>Your Cart</h1>

            {cart.items.map((item) => {

                const product = item.product;

                const variant = product?.variants?.find(
                    (variant) =>
                        variant._id === item.variantId
                );

                return (
                    <div key={item._id}>

                        <h3>
                            {product?.name}
                        </h3>

                        {variant && (
                            <p>
                                ₹{variant.price}
                            </p>
                        )}

                        <p>
                            Quantity: {item.quantity}
                        </p>

                        <button
                            onClick={() =>
                                updateCartItem(
                                    item._id,
                                    item.quantity + 1
                                )
                            }
                        >
                            +
                        </button>

                        <button
                            onClick={() => {

                                if (item.quantity === 1) {
                                    removeCartItem(item._id);
                                } else {
                                    updateCartItem(
                                        item._id,
                                        item.quantity - 1
                                    );
                                }

                            }}
                        >
                            -
                        </button>

                        <button
                            onClick={() =>
                                removeCartItem(item._id)
                            }
                        >
                            Remove
                        </button>

                    </div>
                );
            })}

            <button onClick={clearCart}>
                Clear Cart
            </button>

        </div>
    );
}