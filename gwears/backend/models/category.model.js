import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        group: {
            type: String,
            enum: [
                "clothing",
                "footwear",
                "accessories",
            ],
            required: true,
        },

        description: {
            type: String,
            trim: true,
        },

        image: {
            url: {
                type: String,
            },
            alt: {
                type: String,
            },
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;