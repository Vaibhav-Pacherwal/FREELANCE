import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },

        publicId: {
          type: String,
          default: null,
        },

        alt: {
          type: String,
          default: "",
        },
      },
    ],

    options: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        values: [
          {
            type: String,
            required: true,
            trim: true,
          },
        ],
      },
    ],

    variants: [
      {
        sku: {
          type: String,
          required: true,
          trim: true,
        },

        attributes: [
          {
            name: {
              type: String,
              required: true,
            },

            value: {
              type: String,
              required: true,
            },
          },
        ],

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        originalPrice: {
          type: Number,
          min: 0,
          default: null,
        },

        stock: {
          type: Number,
          required: true,
          min: 0,
          default: 0,
        },

        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ category: 1, isActive: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;