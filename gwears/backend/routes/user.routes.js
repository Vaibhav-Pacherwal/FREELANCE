import { Router } from "express";
import protect from "../middlewares/verifyToken.js";
import authorizeRole from "../middlewares/authorizeRole.js";
import { google, googleCallback, register, login, logout, verify, getMe } from "../controllers/user.controllers.js";

const router = Router();

router.route("/auth/register").post(register);
router.post(
    "/auth/login",
    (req, res, next) => {
        req.expectedRole = "customer";
        next();
    },
    login
);
router.post(
    "/auth/admin/login",
    (req, res, next) => {
        req.expectedRole = "admin";
        next();
    },
    login
);
router.route("/auth/logout").post(logout);
router.route("/auth/google").get(google);
router.route("/auth/google/callback").get(googleCallback);
router.route("/auth/me").get(protect, getMe);
router.route("/admin/me").get(
    protect,
    authorizeRole("admin"),
    verify
);
export default router;