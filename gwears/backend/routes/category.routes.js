import { Router } from "express";
import { createCategory, updateCategory, deleteCategory, getCategoryById, getCategories, toggleCategoryStatus } from "../controllers/category.controller.js";

const router = Router();

router.get("/categories", getCategories);
router.get("/categories/:id", getCategoryById);
router.post("/categories", createCategory);
router.patch("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);
router.patch("/categories/:id/status", toggleCategoryStatus);

export default router;