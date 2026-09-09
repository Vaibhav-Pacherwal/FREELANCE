const calculateOfferPrice = (price, offer) => {
    if (!offer) {
        return {
            originalPrice: price,
            discountAmount: 0,
            finalPrice: price,
            discountType: null,
            discountValue: 0,
            offer: null,
        };
    }

    let discountAmount = 0;

    if (offer.discountType === "percentage") {
        discountAmount =
            (price * offer.discountValue) / 100;
    }

    if (offer.discountType === "fixed") {
        discountAmount = offer.discountValue;
    }

    discountAmount = Math.min(
        discountAmount,
        price
    );

    const finalPrice =
        Math.max(price - discountAmount, 0);

    return {
        originalPrice: price,
        discountAmount,
        finalPrice,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        offer: {
            _id: offer._id,
            title: offer.title,
            appliesTo: offer.appliesTo,
        },
    };
};


const getBestOfferForProduct = (
    product,
    variant,
    offers
) => {

    if (
        !product ||
        !variant ||
        !Array.isArray(offers)
    ) {
        return calculateOfferPrice(
            variant?.price || 0,
            null
        );
    }

    const applicableOffers =
        offers.filter((offer) => {

            if (
                offer.appliesTo === "store"
            ) {
                return true;
            }

            if (
                offer.appliesTo === "category"
            ) {
                const productCategoryId =
                    product.category?._id
                        ? product.category._id.toString()
                        : product.category?.toString();

                const offerCategoryId =
                    offer.category?._id
                        ? offer.category._id.toString()
                        : offer.category?.toString();

                return (
                    productCategoryId &&
                    offerCategoryId &&
                    productCategoryId ===
                        offerCategoryId
                );
            }

            if (
                offer.appliesTo === "product"
            ) {
                const productId =
                    product._id?.toString();

                const offerProductId =
                    offer.product?._id
                        ? offer.product._id.toString()
                        : offer.product?.toString();

                return (
                    productId &&
                    offerProductId &&
                    productId ===
                        offerProductId
                );
            }

            return false;
        });


    if (applicableOffers.length === 0) {
        return calculateOfferPrice(
            variant.price,
            null
        );
    }

    let bestPricing =
        calculateOfferPrice(
            variant.price,
            null
        );


    for (const offer of applicableOffers) {

        const pricing =
            calculateOfferPrice(
                variant.price,
                offer
            );

        if (
            pricing.finalPrice <
            bestPricing.finalPrice
        ) {
            bestPricing = pricing;
        }
    }


    return bestPricing;
};

const getActiveStoreOffers = async (Offer) => {
    const now = new Date();

    return Offer.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
    })
        .populate("category", "name")
        .populate("product", "name")
        .lean();
};


export {
    calculateOfferPrice,
    getBestOfferForProduct,
    getActiveStoreOffers
};