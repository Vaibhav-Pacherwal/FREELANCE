/**
 * Gupta Bakers – Backend Entry Point
 *
 * Start order:
 *  1. Load environment variables (.env)
 *  2. Initialise Express app and register global middleware
 *  3. Mount API routes
 *  4. Connect to MongoDB
 *  5. Start listening only after DB is ready
 */

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// ── Shared configuration ───────────────────────────────────────────────────
import { ALLOWED_ORIGINS, JSON_BODY_LIMIT } from "./lib/config.js";

// ── Route modules ──────────────────────────────────────────────────────────
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import authRoutes from "./routes/auth.routes.js";
import locationRoutes from "./routes/location.routes.js";

// ── 1. Load environment variables ──────────────────────────────────────────
dotenv.config();

const { PORT = 8080, MONGO_URI } = process.env;

if (!MONGO_URI) {
  console.error("[startup] MONGO_URI is not defined in the environment. Exiting.");
  process.exit(1);
}

// ── 2. Create Express app ──────────────────────────────────────────────────
const app = express();

// ── 3. Global middleware (registered before routes) ────────────────────────
// CORS: only allow requests from explicitly whitelisted browser origins.
// The list lives in lib/config.js — never add "*" here (payment data flows
// through this API).
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server calls (no Origin header) and listed origins.
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin "${origin}" is not allowed`));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

// JSON body parser: enforce a hard size limit so oversized payloads are
// rejected before any route handler runs.
app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: JSON_BODY_LIMIT }));

// ── 4. Health endpoint ─────────────────────────────────────────────────────
// Returns server status and MongoDB connection state.
// Safe to call without authentication – exposes no secrets.
app.get("/api/health", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  // Mongoose readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbStateMap = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };

  return res.status(200).json({
    success: true,
    server: "running",
    database: dbStateMap[dbState] ?? "unknown",
    timestamp: new Date().toISOString(),
  });
});

// ── 5. Root route ──────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ success: true, message: "Gupta Bakers API is running." });
});

// ── 6. Mount API routes ────────────────────────────────────────────────────
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/location", locationRoutes);

// ── 7. 404 catch-all for unregistered routes ───────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── 8. Global error handler ────────────────────────────────────────────────
// Ensures no stack traces or internal details leak to the client.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[unhandled error]", err.message);
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred. Please try again later.",
  });
});

// ── 9. Connect to MongoDB, then start listening ────────────────────────────
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("[startup] MongoDB connected successfully.");

    app.listen(PORT, () => {
      console.log(`[startup] Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    // Log the error type/message but never the connection string itself
    console.error("[startup] MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

startServer();