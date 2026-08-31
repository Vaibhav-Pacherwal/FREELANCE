import { Router } from "express";
import protect from "../middlewares/verifyToken.js";
import { google, googleCallback, login, logout, verify } from "../controllers/user.controllers.js";

const router = Router();

router.route("/auth/google").get(google);
router.route("/auth/google/callback").get(googleCallback);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/admin/me").get(protect, verify);

export default router;