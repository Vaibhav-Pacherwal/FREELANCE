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
    razorpayConfig: `${server}/orders/razorpay/config`,
    razorpayCreate: `${server}/orders/razorpay/create`,
    razorpayVerify: `${server}/orders/razorpay/verify`,

    adminOrders: `${server}/admin/orders`,

    adminAnalytics: `${server}/admin/analytics`,
};

export default API;