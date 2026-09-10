import Address from "../models/address.model.js";


// CREATE ADDRESS
const createAddress = async (req, res) => {
    try {

        const {
            fullName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            landmark,
            isDefault,
        } = req.body;


        // Required fields
        if (
            !fullName?.trim() ||
            !phone?.trim() ||
            !addressLine1?.trim() ||
            !city?.trim() ||
            !state?.trim() ||
            !pincode?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Full name, phone, address, city, state and pincode are required",
            });
        }


        // Basic phone validation
        const phoneRegex = /^[6-9]\d{9}$/;

        if (!phoneRegex.test(phone.trim())) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid 10-digit phone number",
            });
        }


        // Basic Indian pincode validation
        const pincodeRegex = /^\d{6}$/;

        if (!pincodeRegex.test(pincode.trim())) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid 6-digit pincode",
            });
        }


        // Check whether user already has addresses
        const existingAddressCount =
            await Address.countDocuments({
                user: req.user._id,
            });


        /*
         * First address automatically becomes default.
         */
        const shouldBeDefault =
            existingAddressCount === 0 ||
            Boolean(isDefault);


        /*
         * If this address should be default,
         * remove default from existing addresses.
         */
        if (shouldBeDefault) {

            await Address.updateMany(
                {
                    user: req.user._id,
                    isDefault: true,
                },
                {
                    $set: {
                        isDefault: false,
                    },
                }
            );

        }


        const address =
            await Address.create({

                user: req.user._id,

                fullName:
                    fullName.trim(),

                phone:
                    phone.trim(),

                addressLine1:
                    addressLine1.trim(),

                addressLine2:
                    addressLine2?.trim() || "",

                city:
                    city.trim(),

                state:
                    state.trim(),

                pincode:
                    pincode.trim(),

                landmark:
                    landmark?.trim() || "",

                isDefault:
                    shouldBeDefault,

            });


        return res.status(201).json({

            success: true,

            message:
                "Address added successfully",

            address,

        });


    } catch (error) {

        console.error(
            "Create address error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to create address",

        });

    }
};



// GET ALL ADDRESSES
const getAddresses = async (req, res) => {
    try {

        const addresses =
            await Address.find({
                user: req.user._id,
            })
                .sort({
                    isDefault: -1,
                    createdAt: -1,
                });


        return res.status(200).json({

            success: true,

            addresses,

        });


    } catch (error) {

        console.error(
            "Get addresses error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch addresses",

        });

    }
};



// GET SINGLE ADDRESS
const getAddressById = async (req, res) => {
    try {

        const address =
            await Address.findOne({

                _id:
                    req.params.id,

                user:
                    req.user._id,

            });


        if (!address) {

            return res.status(404).json({

                success: false,

                message:
                    "Address not found",

            });

        }


        return res.status(200).json({

            success: true,

            address,

        });


    } catch (error) {

        console.error(
            "Get address error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch address",

        });

    }
};



// UPDATE ADDRESS
const updateAddress = async (req, res) => {
    try {

        const {
            fullName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            landmark,
            isDefault,
        } = req.body;


        if (
            !fullName?.trim() ||
            !phone?.trim() ||
            !addressLine1?.trim() ||
            !city?.trim() ||
            !state?.trim() ||
            !pincode?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Full name, phone, address, city, state and pincode are required",
            });
        }


        const phoneRegex = /^[6-9]\d{9}$/;

        if (!phoneRegex.test(phone.trim())) {
            return res.status(400).json({
                success: false,
                message:
                    "Enter a valid 10-digit phone number",
            });
        }


        const pincodeRegex = /^\d{6}$/;

        if (!pincodeRegex.test(pincode.trim())) {
            return res.status(400).json({
                success: false,
                message:
                    "Enter a valid 6-digit pincode",
            });
        }


        const address =
            await Address.findOne({

                _id:
                    req.params.id,

                user:
                    req.user._id,

            });


        if (!address) {

            return res.status(404).json({

                success: false,

                message:
                    "Address not found",

            });

        }


        /*
         * If changing this address to default,
         * remove default from all other addresses.
         */
        if (Boolean(isDefault)) {

            await Address.updateMany(

                {
                    user: req.user._id,

                    _id: {
                        $ne:
                            address._id,
                    },

                    isDefault: true,
                },

                {
                    $set: {
                        isDefault: false,
                    },
                }

            );

        }


        address.fullName =
            fullName.trim();

        address.phone =
            phone.trim();

        address.addressLine1 =
            addressLine1.trim();

        address.addressLine2 =
            addressLine2?.trim() || "";

        address.city =
            city.trim();

        address.state =
            state.trim();

        address.pincode =
            pincode.trim();

        address.landmark =
            landmark?.trim() || "";

        if (isDefault !== undefined) {
            address.isDefault = Boolean(isDefault);
        }


        await address.save();


        return res.status(200).json({

            success: true,

            message:
                "Address updated successfully",

            address,

        });


    } catch (error) {

        console.error(
            "Update address error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update address",

        });

    }
};



// DELETE ADDRESS
const deleteAddress = async (req, res) => {
    try {

        const address =
            await Address.findOne({

                _id:
                    req.params.id,

                user:
                    req.user._id,

            });


        if (!address) {

            return res.status(404).json({

                success: false,

                message:
                    "Address not found",

            });

        }


        const wasDefault =
            address.isDefault;


        await Address.deleteOne({
            _id: address._id,
        });


        /*
         * If the deleted address was default,
         * promote the newest remaining address.
         */
        if (wasDefault) {

            const nextAddress =
                await Address.findOne({

                    user:
                        req.user._id,

                }).sort({
                    createdAt: -1,
                });


            if (nextAddress) {

                nextAddress.isDefault = true;

                await nextAddress.save();

            }

        }


        return res.status(200).json({

            success: true,

            message:
                "Address deleted successfully",

        });


    } catch (error) {

        console.error(
            "Delete address error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete address",

        });

    }
};



// SET DEFAULT ADDRESS
const setDefaultAddress = async (req, res) => {
    try {

        const address =
            await Address.findOne({

                _id:
                    req.params.id,

                user:
                    req.user._id,

            });


        if (!address) {

            return res.status(404).json({

                success: false,

                message:
                    "Address not found",

            });

        }


        await Address.updateMany(

            {
                user:
                    req.user._id,

                isDefault:
                    true,
            },

            {
                $set: {
                    isDefault: false,
                },
            }

        );


        address.isDefault = true;

        await address.save();


        return res.status(200).json({

            success: true,

            message:
                "Default address updated",

            address,

        });


    } catch (error) {

        console.error(
            "Set default address error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to set default address",

        });

    }
};


export {
    createAddress,
    getAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
};