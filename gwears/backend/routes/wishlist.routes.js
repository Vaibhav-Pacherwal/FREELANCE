import { Router } from "express";

import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
} from "../controllers/wishlist.controllers.js";

import protect from "../middlewares/verifyToken.js";
import authorizeRole from "../middlewares/authorizeRole.js";

const router = Router();

router.get(
    "/wishlist",
    protect,
    authorizeRole("customer"),
    getWishlist
);

router.post(
    "/wishlist/:productId",
    protect,
    authorizeRole("customer"),
    addToWishlist
);

router.delete(
    "/wishlist/:productId",
    protect,
    authorizeRole("customer"),
    removeFromWishlist
);

export default router;