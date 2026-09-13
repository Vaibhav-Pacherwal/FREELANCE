import express from "express";

import {
    getSettings,
    updateSettings,
} from "../controllers/settings.controllers.js";

import upload from "../middlewares/upload.js";
import protect from "../middlewares/verifyToken.js";
import authorizeRole from "../middlewares/authorizeRole.js";

const router = express.Router();

router.get(
    "/settings",
    getSettings
);

router.put(
    "/settings",
    protect,
    authorizeRole("admin"),
    upload.fields([
        {
            name: "logo",
            maxCount: 1,
        },
        {
            name: "storeImages",
            maxCount: 10,
        },
    ]),
    updateSettings
);

export default router;