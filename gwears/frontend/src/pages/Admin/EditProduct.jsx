import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";
import server from "../../Environment.js";


const slugify = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
};


export default function EditProduct() {

    const { id } = useParams();

    const navigate = useNavigate();


    const [formData, setFormData] =
        useState({
            name: "",
            description: "",
            category: "",
            isFeatured: false,
        });


    const [categories, setCategories] =
        useState([]);


    const [options, setOptions] =
        useState([]);


    const [variants, setVariants] =
        useState([]);


    const [existingImages, setExistingImages] =
        useState([]);


    const [newImages, setNewImages] =
        useState([]);


    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");


    // --------------------------------------------------
    // Fetch product
    // --------------------------------------------------

    useEffect(() => {

        const fetchData = async () => {

            try {

                setLoading(true);


                const [
                    productResponse,
                    categoryResponse,
                ] = await Promise.all([

                    fetch(
                        `${server}/products/${id}`,
                        {
                            credentials:
                                "include",
                        }
                    ),

                    fetch(
                        `${server}/categories`,
                        {
                            credentials:
                                "include",
                        }
                    ),

                ]);


                const productData =
                    await productResponse.json();

                const categoryData =
                    await categoryResponse.json();


                if (!productResponse.ok) {
                    throw new Error(
                        productData.message ||
                        "Failed to fetch product"
                    );
                }


                if (!categoryResponse.ok) {
                    throw new Error(
                        categoryData.message ||
                        "Failed to fetch categories"
                    );
                }


                const product =
                    productData.product;


                setFormData({
                    name: product.name || "",

                    description:
                        product.description || "",

                    category:
                        product.category?._id ||
                        product.category ||
                        "",

                    isFeatured:
                        product.isFeatured ?? false,
                });

                setOptions(
                    product.options || []
                );


                setVariants(
                    (product.variants || [])
                        .map((variant) => ({
                            _id:
                                variant._id,

                            sku:
                                variant.sku,

                            attributes:
                                variant.attributes ||
                                [],

                            price:
                                variant.price,

                            originalPrice:
                                variant.originalPrice ??
                                "",

                            stock:
                                variant.stock,

                            isActive:
                                variant.isActive ??
                                true,
                        }))
                );


                setExistingImages(
                    product.images || []
                );


                setCategories(
                    categoryData.categories ||
                    []
                );

            } catch (error) {

                console.error(
                    "Edit product fetch error:",
                    error
                );

                setError(
                    error.message
                );

            } finally {

                setLoading(false);

            }
        };


        fetchData();

    }, [id]);


    // --------------------------------------------------
    // Basic fields
    // --------------------------------------------------

    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;


        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    // --------------------------------------------------
    // Options
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
    // Variant
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
    // Generate variants
    // --------------------------------------------------

    const generateVariants = () => {
        const validOptions = options
            .map((option) => ({
                name: option.name.trim(),
                values: option.values
                    .map((value) => value.trim())
                    .filter(Boolean),
            }))
            .filter(
                (option) =>
                    option.name &&
                    option.values.length > 0
            );

        /*
         * No options means a simple product.
         * Generate one variant.
         */
        if (!validOptions.length) {
            const existingVariant = variants[0];

            setVariants([
                existingVariant || {
                    sku: `${slugify(formData.name)}-1`,
                    attributes: [],
                    price: "",
                    originalPrice: "",
                    stock: 0,
                    isActive: true,
                },
            ]);

            setError("");
            return;
        }

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

        const generatedVariants = combinations.map(
            (combination, index) => {
                const attributes = Object.entries(
                    combination
                ).map(([name, value]) => ({
                    name,
                    value,
                }));

                const existingVariant = variants.find(
                    (variant) => {
                        if (
                            !variant.attributes ||
                            variant.attributes.length !==
                            attributes.length
                        ) {
                            return false;
                        }

                        return attributes.every(
                            (attribute) =>
                                variant.attributes.some(
                                    (existingAttribute) =>
                                        existingAttribute.name ===
                                        attribute.name &&
                                        existingAttribute.value ===
                                        attribute.value
                                )
                        );
                    }
                );

                if (existingVariant) {
                    return {
                        ...existingVariant,
                        attributes,
                    };
                }

                const skuAttributes = attributes
                    .map((attribute) =>
                        slugify(attribute.value)
                    )
                    .join("-");

                return {
                    sku: `${slugify(
                        formData.name
                    )}-${skuAttributes || index + 1}`,

                    attributes,

                    price: "",

                    originalPrice: "",

                    stock: 0,

                    isActive: true,
                };
            }
        );

        setVariants(generatedVariants);
        setError("");
    };


    // --------------------------------------------------
    // Images
    // --------------------------------------------------

    const removeExistingImage = (imageToRemove) => {
        setExistingImages((prev) =>
            prev.filter(
                (image) =>
                    (
                        image.publicId ||
                        image.url
                    ) !==
                    (
                        imageToRemove.publicId ||
                        imageToRemove.url
                    )
            )
        );
    };


    const handleImageChange = (e) => {

        const selectedFiles =
            Array.from(e.target.files);


        if (!selectedFiles.length)
            return;


        const totalImages =
            existingImages.length +
            newImages.length;


        const remainingSlots =
            5 - totalImages;


        if (remainingSlots <= 0) {

            alert(
                "Maximum 5 images allowed"
            );

            e.target.value = "";

            return;
        }


        const filesToAdd =
            selectedFiles.slice(
                0,
                remainingSlots
            );


        const invalidFile =
            filesToAdd.find(
                (file) =>
                    !file.type.startsWith(
                        "image/"
                    )
            );


        if (invalidFile) {

            alert(
                "Only image files are allowed"
            );

            e.target.value = "";

            return;
        }


        const oversizedFile =
            filesToAdd.find(
                (file) =>
                    file.size >
                    5 * 1024 * 1024
            );


        if (oversizedFile) {

            alert(
                "Each image must be less than 5MB"
            );

            e.target.value = "";

            return;
        }


        const imageObjects =
            filesToAdd.map(
                (file) => ({
                    file,
                    preview:
                        URL.createObjectURL(
                            file
                        ),
                })
            );


        setNewImages(
            (prev) => [
                ...prev,
                ...imageObjects,
            ]
        );


        e.target.value = "";
    };


    const removeNewImage = (
        index
    ) => {

        setNewImages((prev) => {

            const image =
                prev[index];

            URL.revokeObjectURL(
                image.preview
            );

            return prev.filter(
                (_, i) =>
                    i !== index
            );
        });
    };


    // --------------------------------------------------
    // Submit
    // --------------------------------------------------

    const handleSubmit = async (e) => {

        e.preventDefault();


        if (
            existingImages.length +
            newImages.length ===
            0
        ) {

            setError(
                "At least one product image is required"
            );

            return;
        }


        if (!variants.length) {

            setError(
                "At least one product variant is required"
            );

            return;
        }

        const skus = variants.map((variant) =>
            variant.sku?.trim()
        );

        if (new Set(skus).size !== skus.length) {
            setError(
                "Variant SKUs must be unique"
            );

            return;
        }



        for (const variant of variants) {

            if (!variant.sku?.trim()) {

                setError(
                    "Every variant must have a SKU"
                );

                return;
            }


            if (
                variant.price === "" ||
                variant.price === null ||
                variant.price === undefined ||
                !Number.isFinite(Number(variant.price)) ||
                Number(variant.price) < 0
            ) {
                setError(
                    "Every variant must have a valid price"
                );

                return;
            }


            if (
                variant.stock === "" ||
                variant.stock === null ||
                variant.stock === undefined ||
                !Number.isFinite(Number(variant.stock)) ||
                Number(variant.stock) < 0
            ) {
                setError(
                    "Every variant must have valid stock"
                );

                return;
            }

            if (
                variant.originalPrice !== "" &&
                variant.originalPrice !== null &&
                variant.originalPrice !== undefined &&
                (
                    !Number.isFinite(
                        Number(variant.originalPrice)
                    ) ||
                    Number(variant.originalPrice) < 0
                )
            ) {
                setError(
                    "Every variant must have a valid original price"
                );

                return;
            }
        }


        try {

            setSaving(true);
            setError("");


            const data =
                new FormData();


            data.append(
                "name",
                formData.name
            );


            data.append(
                "description",
                formData.description
            );


            data.append(
                "category",
                formData.category
            );


            data.append(
                "isFeatured",
                formData.isFeatured
            );


            data.append(
                "options",
                JSON.stringify(
                    options
                        .filter(
                            (option) =>
                                option.name.trim()
                        )
                        .map(
                            (option) => ({
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
                            })
                        )
                )
            );


            data.append(
                "variants",
                JSON.stringify(
                    variants.map(
                        (variant) => ({
                            sku:
                                variant.sku.trim(),

                            attributes:
                                variant.attributes,

                            price:
                                Number(
                                    variant.price
                                ),

                            originalPrice:
                                variant.originalPrice ===
                                    "" ||
                                    variant.originalPrice ===
                                    null
                                    ? null
                                    : Number(
                                        variant.originalPrice
                                    ),

                            stock:
                                Number(
                                    variant.stock
                                ),

                            isActive:
                                variant.isActive,
                        })
                    )
                )
            );


            data.append(
                "existingImages",
                JSON.stringify(
                    existingImages
                )
            );


            newImages.forEach(
                (image) => {

                    data.append(
                        "images",
                        image.file
                    );

                }
            );


            const response =
                await fetch(
                    `${server}/products/${id}`,
                    {
                        method: "PATCH",
                        credentials:
                            "include",
                        body: data,
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Failed to update product"
                );
            }


            navigate(
                "/admin/products"
            );

        } catch (error) {

            console.error(
                "Update product error:",
                error
            );

            setError(
                error.message
            );

        } finally {

            setSaving(false);

        }
    };


    if (loading) {

        return (
            <div>
                Loading product...
            </div>
        );
    }


    return (

        <div className="edit-product-page">

            <h1>
                Edit Product
            </h1>


            {error && (

                <p className="error-message">
                    {error}
                </p>

            )}


            <form
                onSubmit={
                    handleSubmit
                }
            >

                {/* Basic information */}

                <div>

                    <label>
                        Name
                    </label>

                    <input
                        type="text"
                        name="name"
                        value={
                            formData.name
                        }
                        onChange={
                            handleChange
                        }
                        required
                    />

                </div>


                <div>

                    <label>
                        Description
                    </label>

                    <textarea
                        name="description"
                        value={
                            formData.description
                        }
                        onChange={
                            handleChange
                        }
                    />

                </div>


                <div>

                    <label>
                        Category
                    </label>

                    <select
                        name="category"
                        value={
                            formData.category
                        }
                        onChange={
                            handleChange
                        }
                        required
                    >

                        <option value="">
                            Select category
                        </option>


                        {categories.map(
                            (category) => (

                                <option
                                    key={
                                        category._id
                                    }
                                    value={
                                        category._id
                                    }
                                >
                                    {
                                        category.name
                                    }
                                </option>

                            )
                        )}

                    </select>

                </div>


                {/* Options */}

                <div>

                    <div
                        style={{
                            display:
                                "flex",
                            justifyContent:
                                "space-between",
                        }}
                    >

                        <h3>
                            Product Options
                        </h3>

                        <button
                            type="button"
                            onClick={
                                addOption
                            }
                        >
                            + Add Option
                        </button>

                    </div>


                    {options.map(
                        (
                            option,
                            optionIndex
                        ) => (

                            <div
                                key={
                                    optionIndex
                                }
                                className="product-option"
                            >

                                <input
                                    type="text"
                                    placeholder="Option name"
                                    value={
                                        option.name
                                    }
                                    onChange={(
                                        e
                                    ) =>
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
                                        >

                                            <input
                                                type="text"
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
                        onClick={
                            generateVariants
                        }
                    >
                        Regenerate Variants
                    </button>

                </div>


                {/* Variants */}

                <div>

                    <h3>
                        Variants
                    </h3>


                    {variants.map(
                        (
                            variant,
                            index
                        ) => (

                            <div
                                key={
                                    variant._id ||
                                    index
                                }
                                className="product-variant"
                            >

                                <strong>
                                    {variant.attributes
                                        ?.map(
                                            (
                                                attribute
                                            ) =>
                                                `${attribute.name}: ${attribute.value}`
                                        )
                                        .join(
                                            " / "
                                        )}
                                </strong>


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
                                        Price
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
                                        Stock
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


                {/* Existing Images */}

                <div>

                    <h3>
                        Existing Images
                    </h3>


                    <div className="image-grid">

                        {existingImages.map(
                            (image) => (

                                <div
                                    className="image-item"
                                    key={image.publicId || image.url}
                                >

                                    <img
                                        src={
                                            image.url
                                        }
                                        alt=""
                                    />


                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeExistingImage(image)
                                        }
                                    >
                                        ×
                                    </button>

                                </div>

                            )
                        )}

                    </div>

                </div>


                {/* New Images */}

                <div>

                    <h3>
                        Add More Images
                    </h3>


                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={
                            handleImageChange
                        }
                    />


                    <div className="image-grid">

                        {newImages.map(
                            (
                                image,
                                index
                            ) => (

                                <div
                                    className="image-item"
                                    key={
                                        image.preview
                                    }
                                >

                                    <img
                                        src={
                                            image.preview
                                        }
                                        alt=""
                                    />


                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeNewImage(
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

                <div>

                    <label>
                        Featured
                    </label>

                    <select
                        value={
                            formData.isFeatured
                        }
                        onChange={(e) =>
                            setFormData(
                                (prev) => ({
                                    ...prev,
                                    isFeatured:
                                        e.target
                                            .value ===
                                        "true",
                                })
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

                <div>

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
                            saving
                        }
                    >
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </button>

                </div>

            </form>

        </div>
    );
}