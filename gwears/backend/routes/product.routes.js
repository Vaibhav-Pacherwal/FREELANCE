import { Router } from "express";
import upload from "../middlewares/upload.js";
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

router.post("/products", upload.array("images", 5), createProduct);
router.get("/products", getProducts);
router.delete("/products/:id", deleteProduct);
router.get("/products/:id", getProductById);
router.patch("/products/:id", upload.array("images", 5), updateProduct);
router.patch("/products/:id/status", toggleProductStatus);
router.get("/store/products", getStoreProducts);
router.get("/store/products/:id", getStoreProductById);

export default router;