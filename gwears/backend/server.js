import "./config/env.js";
import express from "express";
import cors from "cors";
import connectToDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import offerRoutes from "./routes/offer.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import cookieParser from "cookie-parser";
import cartRoutes from "./routes/cart.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import addressRoutes from "./routes/address.routes.js";
import orderRoutes from "./routes/order.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();

// Trust reverse proxy (e.g. Azure App Service / Load Balancer) for secure HTTPS cookies
app.set("trust proxy", 1);

const clientUrls = (process.env.CLIENT_URL || "")
    .split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean);

const allowedOrigins = [
    ...clientUrls,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalizedOrigin = origin.replace(/\/$/, "");
        if (allowedOrigins.includes(normalizedOrigin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy does not allow access from ${origin}`));
        }
    },
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use(userRoutes);
app.use(productRoutes);
app.use(categoryRoutes);
app.use(offerRoutes);
app.use(settingsRoutes);
app.use("/cart", cartRoutes);
app.use(wishlistRoutes);
app.use(addressRoutes);
app.use(orderRoutes);
app.use(analyticsRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Express Error Handler:", err);

    if (err.name === "MulterError") {
        return res.status(400).json({
            success: false,
            message: err.code === "LIMIT_FILE_SIZE" 
                ? "File size exceeds the 5MB limit" 
                : err.message,
        });
    }

    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors || {}).map((e) => e.message);
        return res.status(400).json({
            success: false,
            message: errors.join(", ") || "Validation error",
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: `Invalid ID format for ${err.path}`,
        });
    }

    const status = err.statusCode || 500;
    const message = err.message || "Internal server error";

    const responseMessage =
        process.env.NODE_ENV === "production" && status >= 500
            ? "An unexpected error occurred"
            : message;

    return res.status(status).json({
        success: false,
        message: responseMessage,
    });
});

const PORT = process.env.PORT || 8080;

const main = async () => {
    try {
        await connectToDB();
        
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server is running on ${PORT}`);
        });
    } catch (err) {
        console.error("Fatal startup error:", err.message);
        process.exit(1);
    }
};

main();