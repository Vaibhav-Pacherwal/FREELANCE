import { Router } from "express";
import { createCategory, updateCategory, deleteCategory, getCategoryById, getCategories, toggleCategoryStatus } from "../controllers/category.controller.js";
import protect from "../middlewares/verifyToken.js";
import authorizeRole from "../middlewares/authorizeRole.js";

const router = Router();

router.get("/categories", getCategories);
router.get("/categories/:id", getCategoryById);
router.post("/categories", protect, authorizeRole("admin"), createCategory);
router.patch("/categories/:id", protect, authorizeRole("admin"), updateCategory);
router.delete("/categories/:id", protect, authorizeRole("admin"), deleteCategory);
router.patch("/categories/:id/status", protect, authorizeRole("admin"), toggleCategoryStatus);

export default router;