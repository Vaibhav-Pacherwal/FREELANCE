import express from "express";

import {
    getSettings,
    updateSettings,
} from "../controllers/settings.controllers.js";

import upload from "../middlewares/upload.js";

const router = express.Router();


router.get(
    "/settings",
    getSettings
);


router.put(
    "/settings",
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