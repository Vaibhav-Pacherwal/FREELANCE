import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../../Environment.js";


const createCombinations = (options) => {
    if (!options.length) return [];

    const validOptions = options.filter(
        (option) =>
            option.name.trim() &&
            option.values.length > 0
    );

    if (!validOptions.length) return [];

    let combinations = [{}];

    validOptions.forEach((option) => {
        const newCombinations = [];

        combinations.forEach((combination) => {
            option.values.forEach((value) => {
                newCombinations.push({
                    ...combination,
                    [option.name]: value,
                });
            });
        });

        combinations = newCombinations;
    });

    return combinations;
};


const slugify = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
};

export default function AddProduct() {

    const navigate = useNavigate();


    const [name, setName] = useState("");
    const [description, setDescription] =
        useState("");

    const [category, setCategory] =
        useState("");

    const [isFeatured, setIsFeatured] =
        useState(false);


    const [categories, setCategories] =
        useState([]);


    const [images, setImages] =
        useState([]);

    const [previews, setPreviews] =
        useState([]);


    const [options, setOptions] = useState([
        {
            name: "Size",
            values: ["S", "M", "L", "XL"],
        },
        {
            name: "Color",
            values: ["Black"],
        },
    ]);


    const [variants, setVariants] =
        useState([]);


    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    // --------------------------------------------------
    // Categories
    // --------------------------------------------------

    useEffect(() => {

        const fetchCategories = async () => {
            try {

                const response = await fetch(
                    `${server}/categories`,
                    {
                        credentials: "include",
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to fetch categories"
                    );
                }

                setCategories(
                    data.categories || []
                );

            } catch (error) {

                console.error(
                    "Category fetch error:",
                    error
                );

            }
        };

        fetchCategories();

    }, []);


    // --------------------------------------------------
    // Generate variants
    // --------------------------------------------------

    const generateVariants = () => {

        const combinations =
            createCombinations(options);

        if (!combinations.length) {
            setVariants([]);
            return;
        }

        const generated =
            combinations.map(
                (combination, index) => {

                    const attributes =
                        Object.entries(
                            combination
                        ).map(
                            ([name, value]) => ({
                                name,
                                value,
                            })
                        );

                    const skuAttributes =
                        attributes
                            .map(
                                (attribute) =>
                                    slugify(
                                        attribute.value
                                    )
                            )
                            .join("-");

                    return {
                        sku: `${slugify(name) || "product"}-${skuAttributes || index + 1}`,

                        attributes,

                        price: "",

                        originalPrice: "",

                        stock: 0,

                        isActive: true,
                    };
                }
            );

        setVariants(generated);
    };


    // --------------------------------------------------
    // Option helpers
    // --------------------------------------------------

    const addOption = () => {

        setOptions((prev) => [
            ...prev,
            {
                name: "",
                values: [""],
            },
        ]);
    };


    const removeOption = (index) => {

        setOptions((prev) =>
            prev.filter(
                (_, i) => i !== index
            )
        );
    };


    const updateOptionName = (
        index,
        value
    ) => {

        setOptions((prev) =>
            prev.map((option, i) =>
                i === index
                    ? {
                        ...option,
                        name: value,
                    }
                    : option
            )
        );
    };


    const addOptionValue = (
        optionIndex
    ) => {

        setOptions((prev) =>
            prev.map((option, i) =>
                i === optionIndex
                    ? {
                        ...option,
                        values: [
                            ...option.values,
                            "",
                        ],
                    }
                    : option
            )
        );
    };


    const updateOptionValue = (
        optionIndex,
        valueIndex,
        value
    ) => {

        setOptions((prev) =>
            prev.map((option, i) =>
                i === optionIndex
                    ? {
                        ...option,
                        values:
                            option.values.map(
                                (v, vi) =>
                                    vi === valueIndex
                                        ? value
                                        : v
                            ),
                    }
                    : option
            )
        );
    };


    const removeOptionValue = (
        optionIndex,
        valueIndex
    ) => {

        setOptions((prev) =>
            prev.map((option, i) =>
                i === optionIndex
                    ? {
                        ...option,
                        values:
                            option.values.filter(
                                (_, vi) =>
                                    vi !== valueIndex
                            ),
                    }
                    : option
            )
        );
    };


    // --------------------------------------------------
    // Variant helpers
    // --------------------------------------------------

    const updateVariant = (
        index,
        field,
        value
    ) => {

        setVariants((prev) =>
            prev.map((variant, i) =>
                i === index
                    ? {
                        ...variant,
                        [field]: value,
                    }
                    : variant
            )
        );
    };


    const toggleVariantStatus = (
        index
    ) => {

        setVariants((prev) =>
            prev.map((variant, i) =>
                i === index
                    ? {
                        ...variant,
                        isActive:
                            !variant.isActive,
                    }
                    : variant
            )
        );
    };


    // --------------------------------------------------
    // Images
    // --------------------------------------------------

    const handleImagesChange = (e) => {

        const selectedFiles =
            Array.from(e.target.files);

        if (!selectedFiles.length) return;


        if (
            images.length +
            selectedFiles.length >
            5
        ) {
            setError(
                "Maximum 5 images allowed"
            );

            e.target.value = "";
            return;
        }


        for (const file of selectedFiles) {

            if (!file.type.startsWith("image/")) {

                setError(
                    "Only image files are allowed"
                );

                e.target.value = "";
                return;
            }


            if (
                file.size >
                5 * 1024 * 1024
            ) {

                setError(
                    "Each image must be less than 5 MB"
                );

                e.target.value = "";
                return;
            }
        }


        setError("");


        setImages((prev) => [
            ...prev,
            ...selectedFiles,
        ]);


        const newPreviews =
            selectedFiles.map(
                (file) =>
                    URL.createObjectURL(file)
            );


        setPreviews((prev) => [
            ...prev,
            ...newPreviews,
        ]);


        e.target.value = "";
    };


    const removeImage = (index) => {

        URL.revokeObjectURL(
            previews[index]
        );


        setImages((prev) =>
            prev.filter(
                (_, i) => i !== index
            )
        );


        setPreviews((prev) =>
            prev.filter(
                (_, i) => i !== index
            )
        );
    };


    // --------------------------------------------------
    // Submit
    // --------------------------------------------------

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        if (!name.trim()) {
            setError(
                "Product name is required"
            );
            return;
        }


        if (!description.trim()) {
            setError(
                "Description is required"
            );
            return;
        }


        if (!category) {
            setError(
                "Please select a category"
            );
            return;
        }


        if (!images.length) {
            setError(
                "Please select at least one image"
            );
            return;
        }


        if (!variants.length) {
            setError(
                "Generate at least one product variant"
            );
            return;
        }


        for (const variant of variants) {

            if (!variant.sku.trim()) {
                setError(
                    "Every variant must have a SKU"
                );
                return;
            }


            if (
                variant.price === "" ||
                Number(variant.price) < 0
            ) {
                setError(
                    "Every variant must have a valid price"
                );
                return;
            }


            if (
                variant.stock === "" ||
                Number(variant.stock) < 0
            ) {
                setError(
                    "Every variant must have valid stock"
                );
                return;
            }
        }


        try {

            setLoading(true);


            const formData =
                new FormData();


            formData.append(
                "name",
                name.trim()
            );

            formData.append(
                "description",
                description.trim()
            );

            formData.append(
                "category",
                category
            );


            formData.append(
                "options",
                JSON.stringify(
                    options
                        .filter(
                            (option) =>
                                option.name.trim() &&
                                option.values.some(
                                    (value) =>
                                        value.trim()
                                )
                        )
                        .map((option) => ({
                            name:
                                option.name.trim(),

                            values:
                                option.values
                                    .filter(
                                        (value) =>
                                            value.trim()
                                    )
                                    .map(
                                        (value) =>
                                            value.trim()
                                    ),
                        }))
                )
            );


            formData.append(
                "variants",
                JSON.stringify(
                    variants.map(
                        (variant) => ({
                            ...variant,
                            price:
                                Number(
                                    variant.price
                                ),
                            originalPrice:
                                variant.originalPrice ===
                                    ""
                                    ? null
                                    : Number(
                                        variant.originalPrice
                                    ),
                            stock:
                                Number(
                                    variant.stock
                                ),
                        })
                    )
                )
            );


            // formData.append(
            //     "isActive",
            //     isActive
            // );

            formData.append(
                "isFeatured",
                isFeatured
            );


            images.forEach((image) => {

                formData.append(
                    "images",
                    image
                );

            });


            const response = await fetch(
                `${server}/products`,
                {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                }
            );


            const data =
                await response.json();


            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to create product"
                );
            }


            navigate(
                "/admin/products"
            );

        } catch (error) {

            console.error(
                "Create product error:",
                error
            );

            setError(error.message);

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="add-product-page">

            <div className="add-product-header">

                <div>
                    <h1>Add Product</h1>

                    <p>
                        Create a new product
                        for your store.
                    </p>
                </div>


                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/admin/products"
                        )
                    }
                >
                    Cancel
                </button>

            </div>


            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}


            <form
                className="add-product-form"
                onSubmit={handleSubmit}
            >

                {/* Basic Information */}

                <div className="form-group">

                    <label>
                        Product Name *
                    </label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) =>
                            setName(
                                e.target.value
                            )
                        }
                        placeholder="Enter product name"
                    />

                </div>


                <div className="form-group">

                    <label>
                        Description *
                    </label>

                    <textarea
                        value={description}
                        onChange={(e) =>
                            setDescription(
                                e.target.value
                            )
                        }
                        placeholder="Enter product description"
                        rows="5"
                    />

                </div>


                <div className="form-group">

                    <label>
                        Category *
                    </label>

                    <select
                        value={category}
                        onChange={(e) =>
                            setCategory(
                                e.target.value
                            )
                        }
                    >

                        <option value="">
                            Select category
                        </option>

                        {categories.map(
                            (cat) => (
                                <option
                                    key={cat._id}
                                    value={cat._id}
                                >
                                    {cat.name}
                                </option>
                            )
                        )}

                    </select>

                </div>


                {/* Options */}

                <div className="form-group">

                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems:
                                "center",
                        }}
                    >

                        <label>
                            Product Options
                        </label>

                        <button
                            type="button"
                            onClick={addOption}
                        >
                            + Add Option
                        </button>

                    </div>


                    {options.map(
                        (option, optionIndex) => (

                            <div
                                key={optionIndex}
                                className="product-option"
                            >

                                <input
                                    type="text"
                                    placeholder="Option name e.g. Size"
                                    value={
                                        option.name
                                    }
                                    onChange={(e) =>
                                        updateOptionName(
                                            optionIndex,
                                            e.target.value
                                        )
                                    }
                                />


                                {option.values.map(
                                    (
                                        value,
                                        valueIndex
                                    ) => (

                                        <div
                                            key={
                                                valueIndex
                                            }
                                            style={{
                                                display:
                                                    "flex",
                                                gap:
                                                    "8px",
                                                marginTop:
                                                    "8px",
                                            }}
                                        >

                                            <input
                                                type="text"
                                                placeholder="Value"
                                                value={
                                                    value
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateOptionValue(
                                                        optionIndex,
                                                        valueIndex,
                                                        e.target.value
                                                    )
                                                }
                                            />


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeOptionValue(
                                                        optionIndex,
                                                        valueIndex
                                                    )
                                                }
                                            >
                                                ×
                                            </button>

                                        </div>

                                    )
                                )}


                                <button
                                    type="button"
                                    onClick={() =>
                                        addOptionValue(
                                            optionIndex
                                        )
                                    }
                                >
                                    + Add Value
                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        removeOption(
                                            optionIndex
                                        )
                                    }
                                >
                                    Remove Option
                                </button>

                            </div>

                        )
                    )}


                    <button
                        type="button"
                        onClick={generateVariants}
                    >
                        Generate Variants
                    </button>

                </div>


                {/* Variants */}

                {variants.length > 0 && (

                    <div className="form-group">

                        <h3>
                            Variants
                        </h3>


                        {variants.map(
                            (
                                variant,
                                index
                            ) => (

                                <div
                                    key={index}
                                    className="product-variant"
                                >

                                    <div>

                                        <strong>
                                            {variant.attributes
                                                .map(
                                                    (
                                                        attribute
                                                    ) =>
                                                        `${attribute.name}: ${attribute.value}`
                                                )
                                                .join(
                                                    " / "
                                                )}
                                        </strong>

                                    </div>


                                    <div>

                                        <label>
                                            SKU
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                variant.sku
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                updateVariant(
                                                    index,
                                                    "sku",
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    <div>

                                        <label>
                                            Price *
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                variant.price
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                updateVariant(
                                                    index,
                                                    "price",
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    <div>

                                        <label>
                                            Original Price
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                variant.originalPrice
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                updateVariant(
                                                    index,
                                                    "originalPrice",
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    <div>

                                        <label>
                                            Stock *
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                variant.stock
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                updateVariant(
                                                    index,
                                                    "stock",
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleVariantStatus(
                                                index
                                            )
                                        }
                                    >
                                        {variant.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </button>

                                </div>

                            )
                        )}

                    </div>

                )}


                {/* Images */}

                <div className="form-group">

                    <label>
                        Product Images *
                    </label>

                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={
                            handleImagesChange
                        }
                    />

                    <small>
                        Maximum 5 images •
                        Maximum 5 MB each
                    </small>


                    <div className="image-previews">

                        {previews.map(
                            (
                                preview,
                                index
                            ) => (

                                <div
                                    className="image-preview"
                                    key={preview}
                                >

                                    <img
                                        src={preview}
                                        alt={`Preview ${
                                            index + 1
                                        }`}
                                    />


                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeImage(
                                                index
                                            )
                                        }
                                    >
                                        ×
                                    </button>

                                </div>

                            )
                        )}

                    </div>

                </div>

                <div className="form-group">

                    <label>
                        Featured Product
                    </label>

                    <select
                        value={isFeatured}
                        onChange={(e) =>
                            setIsFeatured(
                                e.target.value ===
                                "true"
                            )
                        }
                    >

                        <option value="false">
                            No
                        </option>

                        <option value="true">
                            Yes
                        </option>

                    </select>

                </div>


                {/* Actions */}

                <div className="form-actions">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/products"
                            )
                        }
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        disabled={
                            loading
                        }
                    >
                        {loading
                            ? "Creating..."
                            : "Create Product"}
                    </button>

                </div>

            </form>

        </div>
    );
}