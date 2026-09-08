import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import server from "../Environment.js";

export default function ProductDetails() {

    const { id } = useParams();

    const [product, setProduct] = useState(null);

    const [selectedOptions, setSelectedOptions] = useState({});
    const [quantity, setQuantity] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${server}/store/products/${id}`
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

            <h1>{product.name}</h1>

            <p>
                {product.description}
            </p>

            <p>
                Category:{" "}
                {product.category?.name}
            </p>

            <div>

                {product.images?.map((image, index) => (
                    <img
                        key={index}
                        src={image.url}
                        alt={
                            image.alt ||
                            product.name
                        }
                        width="200"
                    />
                ))}

            </div>

            {product.options?.map((option) => (

                <div key={option.name}>

                    <h3>
                        {option.name}
                    </h3>

                    {option.values.map((value) => (

                        <button
                            key={value}
                            onClick={() =>
                                setSelectedOptions(
                                    (prev) => ({
                                        ...prev,
                                        [option.name]:
                                            value,
                                    })
                                )
                            }
                        >
                            {value}
                        </button>

                    ))}

                </div>

            ))}

            <pre>
                {JSON.stringify(
                    selectedOptions,
                    null,
                    2
                )}
            </pre>

        </div>
    );
}