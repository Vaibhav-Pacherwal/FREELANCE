import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../ApiEndpoints.js";
import { useCart } from "../utils/CartContext.jsx";
import { useUserAuth } from "../utils/UserAuthContext.jsx";
import { useSnackbar } from "../utils/SnackbarContext.jsx";

export default function ProductDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const { user } = useUserAuth();
    const { addToCart } = useCart();
    const { showSnackbar } = useSnackbar();

    const [product, setProduct] = useState(null);

    const [selectedOptions, setSelectedOptions] = useState({});
    const [quantity, setQuantity] = useState(1);

    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);

    const [error, setError] = useState("");
    const [cartMessage, setCartMessage] = useState("");


    const fetchProduct = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                `${API.storeProducts}/${id}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to fetch product"
                );
            }

            setProduct(data.product);

        } catch (error) {

            console.error(
                "Fetch product error:",
                error
            );

            setError(error.message);

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchProduct();

    }, [id]);

    const selectedVariant = product?.variants?.find(
        (variant) => {

            if (!variant.isActive) {
                return false;
            }

            return variant.attributes.every(
                (attribute) =>
                    selectedOptions[attribute.name] ===
                    attribute.value
            );

        }
    );

    const allOptionsSelected =
        product?.options?.every(
            (option) =>
                selectedOptions[option.name]
        ) ?? false;


    const handleOptionSelect = (
        optionName,
        value
    ) => {

        setSelectedOptions((prev) => ({
            ...prev,
            [optionName]: value,
        }));

        setQuantity(1);

        setCartMessage("");
    };

    const increaseQuantity = () => {

        if (!selectedVariant) return;

        if (
            quantity <
            selectedVariant.stock
        ) {
            setQuantity(
                (prev) => prev + 1
            );
        }
    };

    const decreaseQuantity = () => {

        setQuantity(
            (prev) =>
                Math.max(prev - 1, 1)
        );
    };

    const handleAddToCart = async () => {

        setCartMessage("");

        if (!user) {
            navigate("/login");
            return;
        }

        if (!allOptionsSelected) {

            setCartMessage(
                "Please select all options"
            );

            return;
        }

        if (!selectedVariant) {

            setCartMessage(
                "Selected variant is unavailable"
            );

            return;
        }

        if (selectedVariant.stock < 1) {

            setCartMessage(
                "This variant is out of stock"
            );

            return;
        }

        if (
            quantity >
            selectedVariant.stock
        ) {

            setCartMessage(
                `Only ${selectedVariant.stock} item${selectedVariant.stock === 1
                    ? ""
                    : "s"
                } available`
            );

            return;
        }


        try {

            setAddingToCart(true);

            const result = await addToCart(
                product._id,
                selectedVariant._id,
                quantity
            );

            if (!result.success) {

                showSnackbar(
                    result.message ||
                    "Unable to add product to cart",
                    "error"
                );

            }

            setCartMessage(
                result.message
            );

        } catch (error) {

            console.error(
                "Add to cart error:",
                error
            );

            setCartMessage(
                "Failed to add item to cart"
            );

        } finally {

            setAddingToCart(false);

        }
    };


    if (loading) {
        return <p>Loading product...</p>;
    }


    if (error) {
        return <p>{error}</p>;
    }


    if (!product) {
        return <p>Product not found.</p>;
    }


    return (
        <div>

            <h1>
                {product.name}
            </h1>


            <p>
                {product.description}
            </p>


            <p>
                Category:{" "}
                {product.category?.name}
            </p>

            <div>

                {product.images?.map(
                    (image, index) => (

                        <img
                            key={index}
                            src={image.url}
                            alt={
                                image.alt ||
                                product.name
                            }
                            width="200"
                        />

                    )
                )}

            </div>

            {product.options?.map(
                (option) => (

                    <div
                        key={option.name}
                    >

                        <h3>
                            {option.name}
                        </h3>


                        {option.values.map(
                            (value) => (

                                <button
                                    key={value}
                                    type="button"
                                    onClick={() =>
                                        handleOptionSelect(
                                            option.name,
                                            value
                                        )
                                    }
                                >
                                    {value}
                                </button>

                            )
                        )}

                    </div>

                )
            )}

            <pre>
                {JSON.stringify(
                    selectedOptions,
                    null,
                    2
                )}
            </pre>

            {allOptionsSelected && (
                <>
                    {selectedVariant ? (
                        <div>

                            <h3>
                                Price: ₹
                                {Number(
                                    selectedVariant.price
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </h3>


                            <p>
                                Stock:{" "}
                                {selectedVariant.stock}
                            </p>

                            {selectedVariant.stock >
                                0 && (
                                    <div>

                                        <button
                                            type="button"
                                            onClick={
                                                decreaseQuantity
                                            }
                                            disabled={
                                                quantity <= 1
                                            }
                                        >
                                            -
                                        </button>


                                        <span>
                                            {" "}
                                            {quantity}{" "}
                                        </span>


                                        <button
                                            type="button"
                                            onClick={
                                                increaseQuantity
                                            }
                                            disabled={
                                                quantity >=
                                                selectedVariant.stock
                                            }
                                        >
                                            +
                                        </button>

                                    </div>
                                )}

                            <button
                                type="button"
                                onClick={
                                    handleAddToCart
                                }
                                disabled={
                                    addingToCart ||
                                    selectedVariant.stock <
                                    1
                                }
                            >
                                {addingToCart
                                    ? "Adding..."
                                    : selectedVariant.stock <
                                        1
                                        ? "Out of Stock"
                                        : "Add to Cart"}
                            </button>


                            {cartMessage && (
                                <p>
                                    {cartMessage}
                                </p>
                            )}

                        </div>
                    ) : (
                        <p>
                            This combination is
                            unavailable.
                        </p>
                    )}
                </>
            )}


            {!allOptionsSelected && (
                <p>
                    Select all options to see
                    price and availability.
                </p>
            )}

        </div>
    );
}