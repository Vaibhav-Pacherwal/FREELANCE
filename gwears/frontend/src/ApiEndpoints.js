import server from "./Environment.js";

const API = {
    auth: `${server}/auth`,

    products: `${server}/products`,
    storeProducts: `${server}/store/products`,

    categories: `${server}/categories`,

    offers: `${server}/offers`,
    storeOffers: `${server}/store/offers`,

    settings: `${server}/settings`,

    cart: `${server}/cart`,

    wishlist: `${server}/wishlist`,

    addresses: `${server}/addresses`,

    orders: `${server}/orders`,
};

export default API;