import { Router } from "express";

import protect from "../middlewares/verifyToken.js";
import authorizeRole from "../middlewares/authorizeRole.js";

import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    validateCart,
} from "../controllers/cart.controllers.js";

const router = Router();

router.use(
    protect,
    authorizeRole("customer")
);
router.get("/", getCart);
router.post("/items", addToCart);
router.patch("/items/:itemId", updateCartItem);
router.delete("/items/:itemId", removeCartItem);
router.delete("/", clearCart);
router.get("/validate", validateCart);

export default router;