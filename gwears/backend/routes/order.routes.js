import { Router } from "express";

import {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder,
    getAdminOrders,
    getAdminOrderById,
    updateAdminOrderStatus,
    getRazorpayConfig,
    createRazorpayOrder,
    verifyRazorpayPayment,
} from "../controllers/order.controllers.js";

import protect from "../middlewares/verifyToken.js";
import authorizeRole from "../middlewares/authorizeRole.js";

const router = Router();

router.post(
    "/orders",
    protect,
    createOrder
);

router.get(
    "/orders",
    protect,
    getOrders
);

router.get(
    "/orders/razorpay/config",
    protect,
    getRazorpayConfig
);

router.post(
    "/orders/razorpay/create",
    protect,
    createRazorpayOrder
);

router.post(
    "/orders/razorpay/verify",
    protect,
    verifyRazorpayPayment
);

router.get(
    "/orders/:id",
    protect,
    getOrderById
);

router.patch("/orders/:id/cancel", protect, cancelOrder);

router.get(
    "/admin/orders",
    protect,
    authorizeRole("admin"),
    getAdminOrders
);

router.get(
    "/admin/orders/:id",
    protect,
    authorizeRole("admin"),
    getAdminOrderById
);

router.patch(
    "/admin/orders/:id/status",
    protect,
    authorizeRole("admin"),
    updateAdminOrderStatus
);

export default router;