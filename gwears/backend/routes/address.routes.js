import { Router } from "express";

import {
    createAddress,
    getAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} from "../controllers/address.controllers.js";

import protect from "../middlewares/verifyToken.js";

const router = Router();

router.post(
    "/addresses",
    protect,
    createAddress
);

router.get(
    "/addresses",
    protect,
    getAddresses
);

router.get(
    "/addresses/:id",
    protect,
    getAddressById
);

router.put(
    "/addresses/:id",
    protect,
    updateAddress
);

router.delete(
    "/addresses/:id",
    protect,
    deleteAddress
);

router.patch(
    "/addresses/:id/default",
    protect,
    setDefaultAddress
);

export default router;