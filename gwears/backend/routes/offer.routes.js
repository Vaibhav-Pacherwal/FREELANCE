import express from "express";
import upload from "../middlewares/upload.js";
import protect from "../middlewares/verifyToken.js";
import authorizeRole from "../middlewares/authorizeRole.js";
import { createOffer, getOffers, getOffer, updateOffer, toggleOfferStatus, deleteOffer, getStoreOffers } from "../controllers/offer.controllers.js";

const router = express.Router();

router.post("/offers", protect, authorizeRole("admin"), upload.single("image"), createOffer);
router.get("/offers", protect, authorizeRole("admin"), getOffers);
router.get("/store/offers", getStoreOffers);
router.get("/offers/active", getStoreOffers);
router.get("/offers/:id", getOffer);
router.put("/offers/:id", protect, authorizeRole("admin"), upload.single("image"), updateOffer);
router.patch("/offers/:id/status", protect, authorizeRole("admin"), toggleOfferStatus);
router.delete("/offers/:id", protect, authorizeRole("admin"), deleteOffer);

export default router;