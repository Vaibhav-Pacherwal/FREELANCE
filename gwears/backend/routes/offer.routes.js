import express from "express";
import upload from "../middlewares/upload.js";
import { createOffer, getOffers, getOffer, updateOffer, toggleOfferStatus, deleteOffer, getStoreOffers } from "../controllers/offer.controllers.js";

const router = express.Router();

router.post("/offers", upload.single("image"), createOffer);
router.get("/offers", getOffers);
router.get("/store/offers", getStoreOffers);
router.get("/offers/:id", getOffer);
router.put("/offers/:id", upload.single("image"), updateOffer);
router.patch("/offers/:id/status", toggleOfferStatus);
router.delete("/offers/:id", deleteOffer);

export default router;