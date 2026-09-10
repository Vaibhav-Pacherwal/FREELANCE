import { useCart } from "../utils/CartContext.jsx";
import { useNavigate } from "react-router-dom";
import "./Cart.css"

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
        return <p>Loading cart...</p>;
    }


    if (!cart?.items?.length) {
        return (
            <div>
                <h1>Your Cart</h1>
                <p>Your cart is empty.</p>
            </div>
        );
    }


    const getVariant = (item) => {

        return item.product?.variants?.find(
            (variant) =>
                String(variant._id) ===
                String(item.variantId)
        );

    };


    const getSubtotal = () => {

        return cart.items.reduce(
            (total, item) => {

                const variant =
                    getVariant(item);

                if (!variant) {
                    return total;
                }

                return (
                    total +
                    Number(variant.price) *
                    item.quantity
                );

            },
            0
        );

    };


    const handleIncrease = async (item) => {

        const variant =
            getVariant(item);

        if (!variant) {
            return;
        }

        if (
            item.quantity >=
            variant.stock
        ) {
            return;
        }

        await updateCartItem(
            item._id,
            item.quantity + 1
        );
    };


    const handleDecrease = async (item) => {

        if (item.quantity <= 1) {
            return;
        }

        await updateCartItem(
            item._id,
            item.quantity - 1
        );
    };


    const handleRemove = async (itemId) => {

        await removeCartItem(itemId);
    };


    const handleClear = async () => {

        await clearCart();
    };


    return (
        <div>

            <h1>Your Cart</h1>


            {cart.items.map((item) => {

                const product =
                    item.product;

                const variant =
                    getVariant(item);


                if (!product || !variant) {

                    return (
                        <div key={item._id}>

                            <p>
                                This cart item is
                                no longer available.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    handleRemove(
                                        item._id
                                    )
                                }
                            >
                                Remove
                            </button>

                        </div>
                    );
                }


                return (
                    <div key={item._id}>

                        {/* Product image */}

                        {product.images?.length > 0 && (
                            <img
                                src={
                                    product.images[0].url
                                }
                                alt={
                                    product.images[0].alt ||
                                    product.name
                                }
                                width="150"
                            />
                        )}


                        {/* Product information */}

                        <h2>
                            {product.name}
                        </h2>


                        <p>
                            ₹
                            {Number(
                                variant.price
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </p>


                        {/* Variant attributes */}

                        <div>

                            {variant.attributes?.map(
                                (attribute) => (

                                    <p
                                        key={
                                            attribute.name
                                        }
                                    >
                                        {attribute.name}:{" "}
                                        {attribute.value}
                                    </p>

                                )
                            )}

                        </div>


                        {/* Quantity */}

                        <div>

                            <button
                                type="button"
                                onClick={() =>
                                    handleDecrease(
                                        item
                                    )
                                }
                                disabled={
                                    item.quantity <= 1
                                }
                            >
                                -
                            </button>


                            <span>
                                {" "}
                                {item.quantity}{" "}
                            </span>


                            <button
                                type="button"
                                onClick={() =>
                                    handleIncrease(
                                        item
                                    )
                                }
                                disabled={
                                    item.quantity >=
                                    variant.stock
                                }
                            >
                                +
                            </button>

                        </div>


                        {/* Item subtotal */}

                        <p>
                            Item total: ₹
                            {(
                                Number(
                                    variant.price
                                ) *
                                item.quantity
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </p>


                        {/* Remove */}

                        <button
                            type="button"
                            onClick={() =>
                                handleRemove(
                                    item._id
                                )
                            }
                        >
                            Remove
                        </button>


                        <hr />

                    </div>
                );

            })}


            {/* Cart summary */}

            <div>

                <h2>
                    Cart Summary
                </h2>

                <p>
                    Total items:{" "}
                    {cart.items.reduce(
                        (total, item) =>
                            total +
                            item.quantity,
                        0
                    )}
                </p>

                <p>
                    Subtotal: ₹
                    {getSubtotal().toLocaleString(
                        "en-IN"
                    )}
                </p>

                <button
                    className="checkoutButton"
                    onClick={() => navigate("/checkout")}
                    disabled={cart.items.length === 0}
                >
                    Proceed to Checkout
                </button>

            </div>


            {/* Clear cart */}

            <button
                type="button"
                onClick={handleClear}
            >
                Clear Cart
            </button>

        </div>
    );
}