import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    image: {
      url: {
        type: String,
        default: null,
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

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    appliesTo: {
      type: String,
      enum: ["store", "category", "product"],
      default: "store",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

offerSchema.index({
  isActive: 1,
  startDate: 1,
  endDate: 1,
});

offerSchema.pre("validate", function () {
  if (
    this.startDate &&
    this.endDate &&
    this.startDate >= this.endDate
  ) {
    this.invalidate(
      "endDate",
      "End date must be after start date."
    );
  }
});

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;