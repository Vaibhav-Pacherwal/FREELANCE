import { Router } from "express";
import upload from "../middlewares/upload.js";
import protect from "../middlewares/verifyToken.js";
import authorizeRole from "../middlewares/authorizeRole.js";
import { 
    createProduct, 
    getProducts, 
    deleteProduct, 
    getProductById, 
    updateProduct, 
    toggleProductStatus, 
    getStoreProducts, 
    getStoreProductById 
} from "../controllers/product.controllers.js";

const router = Router();

router.post("/products", protect, authorizeRole("admin"), upload.array("images", 5), createProduct);
router.get("/products", getProducts);
router.delete("/products/:id", protect, authorizeRole("admin"), deleteProduct);
router.get("/products/:id", getProductById);
router.patch("/products/:id", protect, authorizeRole("admin"), upload.array("images", 5), updateProduct);
router.patch("/products/:id/status", protect, authorizeRole("admin"), toggleProductStatus);
router.get("/store/products", getStoreProducts);
router.get("/store/products/:id", getStoreProductById);

export default router;