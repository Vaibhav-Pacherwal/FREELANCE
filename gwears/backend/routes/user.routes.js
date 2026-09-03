import { Router } from "express";
import protect from "../middlewares/verifyToken.js";
import { google, googleCallback, login, logout, verify } from "../controllers/user.controllers.js";
import upload from "../middlewares/upload.js";
import { createProduct, getProducts } from "../controllers/product.controllers.js";
import { getCategories } from "../controllers/category.controller.js";

const router = Router();

router.route("/auth/google").get(google);
router.route("/auth/google/callback").get(googleCallback);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/admin/me").get(protect, verify);
router.post("/products", upload.array("images", 5), createProduct);
router.get("/products", getProducts);
router.get("/categories", getCategories);

export default router;