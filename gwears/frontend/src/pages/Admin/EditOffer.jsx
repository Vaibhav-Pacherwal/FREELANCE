import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import server from "../../Environment.js";

export default function EditOffer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    appliesTo: "store",
    category: "",
    product: "",
    startDate: "",
    endDate: "",
    imageAlt: "",
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [existingImage, setExistingImage] = useState(null);
  const [newImage, setNewImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // -----------------------------
  // Fetch offer, categories, products
  // -----------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [offerResponse, categoryResponse, productResponse] =
          await Promise.all([
            fetch(`${server}/offers/${id}`, {
              credentials: "include",
            }),

            fetch(`${server}/categories`, {
              credentials: "include",
            }),

            fetch(`${server}/products?limit=1000`, {
              credentials: "include",
            }),
          ]);

        const offerData = await offerResponse.json();
        const categoryData = await categoryResponse.json();
        const productData = await productResponse.json();

        if (!offerResponse.ok) {
          throw new Error(
            offerData.message || "Failed to fetch offer"
          );
        }

        if (!categoryResponse.ok) {
          throw new Error(
            categoryData.message || "Failed to fetch categories"
          );
        }

        if (!productResponse.ok) {
          throw new Error(
            productData.message || "Failed to fetch products"
          );
        }

        const offer = offerData.offer;

        setFormData({
          title: offer.title || "",
          description: offer.description || "",
          discountType: offer.discountType || "percentage",
          discountValue: offer.discountValue ?? "",
          appliesTo: offer.appliesTo || "store",
          category: offer.category?._id || offer.category || "",
          product: offer.product?._id || offer.product || "",
          startDate: formatDateForInput(offer.startDate),
          endDate: formatDateForInput(offer.endDate),
          imageAlt: offer.image?.alt || "",
        });

        setExistingImage(offer.image?.url ? offer.image : null);

        setCategories(categoryData.categories || []);

        // Adjust this if your products controller uses another key.
        setProducts(productData.products || []);
      } catch (error) {
        console.error("Edit offer fetch error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // -----------------------------
  // Format MongoDB date for
  // datetime-local input
  // -----------------------------
  const formatDateForInput = (date) => {
    if (!date) return "";

    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // -----------------------------
  // Handle normal inputs
  // -----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -----------------------------
  // Remove existing Cloudinary image
  // -----------------------------
  const removeExistingImage = () => {
    setExistingImage(null);
  };

  // -----------------------------
  // Select new image
  // -----------------------------
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      e.target.value = "";
      return;
    }

    setError("");

    const imageObject = {
      file,
      preview: URL.createObjectURL(file),
    };

    // Revoke old preview if one existed
    if (newImage?.preview) {
      URL.revokeObjectURL(newImage.preview);
    }

    setNewImage(imageObject);

    // Selecting a new image replaces the existing image visually
    setExistingImage(null);

    e.target.value = "";
  };

  // -----------------------------
  // Remove newly selected image
  // -----------------------------
  const removeNewImage = () => {
    if (newImage?.preview) {
      URL.revokeObjectURL(newImage.preview);
    }

    setNewImage(null);
  };

  // -----------------------------
  // Submit
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Offer must have an image
    if (!existingImage && !newImage) {
      setError("Offer image is required");
      return;
    }

    // Category required when appliesTo = category
    if (
      formData.appliesTo === "category" &&
      !formData.category
    ) {
      setError("Please select a category");
      return;
    }

    // Product required when appliesTo = product
    if (
      formData.appliesTo === "product" &&
      !formData.product
    ) {
      setError("Please select a product");
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("discountType", formData.discountType);
      data.append("discountValue", formData.discountValue);
      data.append("appliesTo", formData.appliesTo);

      data.append(
        "category",
        formData.appliesTo === "category"
          ? formData.category
          : ""
      );

      data.append(
        "product",
        formData.appliesTo === "product"
          ? formData.product
          : ""
      );

      data.append("startDate", formData.startDate);
      data.append("endDate", formData.endDate);
      data.append("imageAlt", formData.imageAlt);

      // Tell backend whether old image should remain
      data.append(
        "keepExistingImage",
        existingImage ? "true" : "false"
      );

      // Only send file if user selected a new one
      if (newImage) {
        data.append("image", newImage.file);
      }

      const response = await fetch(`${server}/offers/${id}`, {
        method: "PUT",
        credentials: "include",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update offer"
        );
      }

      navigate("/admin/offers");
    } catch (error) {
      console.error("Update offer error:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Loading
  // -----------------------------
  if (loading) {
    return <div>Loading offer...</div>;
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div>
      <h1>Edit Offer</h1>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>

        {/* Title */}
        <div>
          <label>Title</label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label>Description</label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Discount Type */}
        <div>
          <label>Discount Type</label>

          <select
            name="discountType"
            value={formData.discountType}
            onChange={handleChange}
          >
            <option value="percentage">
              Percentage
            </option>

            <option value="fixed">
              Fixed
            </option>
          </select>
        </div>

        {/* Discount Value */}
        <div>
          <label>Discount Value</label>

          <input
            type="number"
            name="discountValue"
            value={formData.discountValue}
            onChange={handleChange}
            min="0"
            max={
              formData.discountType === "percentage"
                ? "100"
                : undefined
            }
            required
          />
        </div>

        {/* Applies To */}
        <div>
          <label>Applies To</label>

          <select
            name="appliesTo"
            value={formData.appliesTo}
            onChange={handleChange}
          >
            <option value="store">
              Entire Store
            </option>

            <option value="category">
              Category
            </option>

            <option value="product">
              Product
            </option>
          </select>
        </div>

        {/* Category */}
        {formData.appliesTo === "category" && (
          <div>
            <label>Category</label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Category
              </option>

              {categories.map((category) => (
                <option
                  key={category._id}
                  value={category._id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Product */}
        {formData.appliesTo === "product" && (
          <div>
            <label>Product</label>

            <select
              name="product"
              value={formData.product}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Product
              </option>

              {products.map((product) => (
                <option
                  key={product._id}
                  value={product._id}
                >
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Start Date */}
        <div>
          <label>Start Date</label>

          <input
            type="datetime-local"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* End Date */}
        <div>
          <label>End Date</label>

          <input
            type="datetime-local"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* IMAGE */}
        <div>
          <label>Offer Image</label>

          {/* Existing image */}
          {existingImage && !newImage && (
            <div>
              <img
                src={existingImage.url}
                alt={
                  existingImage.alt ||
                  formData.title
                }
                width="200"
              />

              <br />

              <button
                type="button"
                onClick={removeExistingImage}
              >
                Remove Image
              </button>
            </div>
          )}

          {/* New image */}
          {newImage && (
            <div>
              <img
                src={newImage.preview}
                alt="New offer preview"
                width="200"
              />

              <br />

              <button
                type="button"
                onClick={removeNewImage}
              >
                Remove New Image
              </button>
            </div>
          )}

          {/* File picker */}
          {!newImage && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          )}
        </div>

        {/* Image Alt */}
        <div>
          <label>Image Alt Text</label>

          <input
            type="text"
            name="imageAlt"
            value={formData.imageAlt}
            onChange={handleChange}
            placeholder="Describe the offer image"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Update Offer"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/offers")}
          disabled={saving}
        >
          Cancel
        </button>

      </form>
    </div>
  );
}