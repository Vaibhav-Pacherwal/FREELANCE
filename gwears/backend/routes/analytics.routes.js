import { Router } from "express";
import { getAdminAnalytics } from "../controllers/analytics.controllers.js";
import protect from "../middlewares/verifyToken.js";
import authorizeRole from "../middlewares/authorizeRole.js";

const router = Router();

router.get(
    "/admin/analytics",
    protect,
    authorizeRole("admin"),
    getAdminAnalytics
);

export default router;
