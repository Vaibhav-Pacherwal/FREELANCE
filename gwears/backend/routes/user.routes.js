import { Router } from "express";
import { google, googleCallback, login, logout } from "../controllers/user.controllers.js";

const router = Router();

router.route("/auth/google").get(google);
router.route("/auth/google/callback").get(googleCallback);
router.route("/login").post(login);
router.route("/logout").post(logout);

export default router;