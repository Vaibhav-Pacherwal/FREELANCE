import StoreSettings from "../models/storeSetting.model.js";

import uploadToCloudinary, {
    deleteFromCloudinary,
} from "../utils/cloudinaryUpload.js";

const getSettings = async (req, res) => {
    try {
        const settings = await StoreSettings.findOne();

        return res.status(200).json({
            success: true,
            settings,
        });

    } catch (error) {
        console.error("Get settings error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch store settings",
        });
    }
};

const updateSettings = async (req, res) => {
    let uploadedLogo = null;
    let uploadedStoreImages = [];

    try {
        const {
            storeName,
            phone,
            whatsapp,
            about,
            address,
            googleMapsUrl,
            openingHours,
            instagram,
            removeImages,
        } = req.body;

        let settings = await StoreSettings.findOne();

        if (!settings && !storeName?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Store name is required",
            });
        }

        if (req.files?.logo?.[0]) {
            uploadedLogo = await uploadToCloudinary(
                req.files.logo[0].buffer,
                "settings/logo"
            );
        }

        if (req.files?.storeImages?.length > 0) {
            uploadedStoreImages = await Promise.all(
                req.files.storeImages.map(async (file) => {
                    const result = await uploadToCloudinary(
                        file.buffer,
                        "settings/store"
                    );

                    return {
                        url: result.secure_url,
                        publicId: result.public_id,
                        alt: "",
                    };
                })
            );
        }


        if (!settings) {
            settings = await StoreSettings.create({
                storeName: storeName.trim(),

                phone: phone?.trim() || "",
                whatsapp: whatsapp?.trim() || "",
                about: about?.trim() || "",

                address: address?.trim() || "",
                googleMapsUrl:
                    googleMapsUrl?.trim() || "",

                openingHours:
                    openingHours?.trim() || "",

                instagram:
                    instagram?.trim() || "",

                logo: {
                    url: uploadedLogo
                        ? uploadedLogo.secure_url
                        : null,

                    publicId: uploadedLogo
                        ? uploadedLogo.public_id
                        : null,
                },

                storeImages: uploadedStoreImages,
            });


            return res.status(201).json({
                success: true,
                message:
                    "Store settings created successfully",
                settings,
            });
        }

        const oldLogoPublicId =
            settings.logo?.publicId;

        if (storeName !== undefined) {
            if (!storeName.trim()) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Store name cannot be empty",
                });
            }

            settings.storeName =
                storeName.trim();
        }

        if (phone !== undefined) {
            settings.phone =
                phone.trim();
        }

        if (whatsapp !== undefined) {
            settings.whatsapp =
                whatsapp.trim();
        }

        if (about !== undefined) {
            settings.about =
                about.trim();
        }

        if (address !== undefined) {
            settings.address =
                address.trim();
        }

        if (googleMapsUrl !== undefined) {
            settings.googleMapsUrl =
                googleMapsUrl.trim();
        }

        if (openingHours !== undefined) {
            settings.openingHours =
                openingHours.trim();
        }

        if (instagram !== undefined) {
            settings.instagram =
                instagram.trim();
        }

        if (uploadedLogo) {
            settings.logo = {
                url: uploadedLogo.secure_url,
                publicId: uploadedLogo.public_id,
            };
        }

        let imagesToDelete = [];

        if (removeImages) {
            let imageIds = [];

            try {
                imageIds =
                    typeof removeImages === "string"
                        ? JSON.parse(removeImages)
                        : removeImages;
            } catch {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid removeImages format",
                });
            }

            imagesToDelete =
                settings.storeImages.filter((image) =>
                    imageIds.includes(
                        image._id.toString()
                    )
                );

            settings.storeImages =
                settings.storeImages.filter(
                    (image) =>
                        !imageIds.includes(
                            image._id.toString()
                        )
                );
        }

        if (uploadedStoreImages.length > 0) {
            settings.storeImages.push(
                ...uploadedStoreImages
            );
        }

        await settings.save();

        if (
            uploadedLogo &&
            oldLogoPublicId
        ) {
            try {
                await deleteFromCloudinary(
                    oldLogoPublicId
                );
            } catch (error) {
                console.error(
                    "Failed to delete old logo:",
                    error
                );
            }
        }


        for (const image of imagesToDelete) {
            try {
                if (image.publicId) {
                    await deleteFromCloudinary(
                        image.publicId
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to delete store image:",
                    error
                );
            }
        }


        return res.status(200).json({
            success: true,
            message:
                "Store settings updated successfully",
            settings,
        });

    } catch (error) {

        console.error(
            "Update settings error:",
            error
        );

        if (uploadedLogo?.public_id) {
            try {
                await deleteFromCloudinary(
                    uploadedLogo.public_id
                );
            } catch (deleteError) {
                console.error(
                    "Failed to rollback logo:",
                    deleteError
                );
            }
        }


        for (const image of uploadedStoreImages) {
            try {
                if (image.publicId) {
                    await deleteFromCloudinary(
                        image.publicId
                    );
                }
            } catch (deleteError) {
                console.error(
                    "Failed to rollback store image:",
                    deleteError
                );
            }
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to update store settings",
        });
    }
};


export {
    getSettings,
    updateSettings,
};