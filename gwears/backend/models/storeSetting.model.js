import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema(
    {
        storeName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        phone: {
            type: String,
            trim: true,
            default: "",
        },

        whatsapp: {
            type: String,
            trim: true,
            default: "",
        },

        about: {
            type: String,
            trim: true,
            maxlength: 3000,
            default: "",
        },

        address: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

        googleMapsUrl: {
            type: String,
            trim: true,
            default: "",
        },

        openingHours: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

        instagram: {
            type: String,
            trim: true,
            default: "",
        },

        logo: {
            url: {
                type: String,
                default: null,
            },

            publicId: {
                type: String,
                default: null,
            },
        },

        storeImages: [
            {
                url: {
                    type: String,
                    required: true,
                },

                publicId: {
                    type: String,
                    required: true,
                },

                alt: {
                    type: String,
                    default: "",
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const StoreSettings = mongoose.model(
    "StoreSettings",
    storeSettingsSchema
);

export default StoreSettings;