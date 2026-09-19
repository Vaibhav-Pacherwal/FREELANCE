import dotenv from "dotenv";
dotenv.config();

const requiredProductionVariables = [
    "MONGO_URI",
    "JWT_SECRET",
    "CLIENT_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
];

if (process.env.NODE_ENV === "production") {
    const missing = requiredProductionVariables.filter((name) => !process.env[name]);
    if (missing.length > 0) {
        console.warn(
            `[SECURITY WARNING] The following required environment variables are not set: ${missing.join(", ")}`
        );
    }
}
