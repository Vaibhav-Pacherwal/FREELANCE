import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Category from "../models/category.model.js";
import Offer from "../models/offer.model.js";
import Cart from "../models/cart.model.js";
import Wishlist from "../models/wishlist.model.js";

/**
 * GET /admin/analytics
 * Computes live e-commerce metrics and aggregations directly from real database records.
 * Revenue is strictly calculated based on order and payment status.
 */
export const getAdminAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // 1. Order Status Counts & Values Aggregation
        const [
            statusAggregation,
            totalOrdersCount,
            todayOrdersCount,
            todayRealizedRevenueAgg,
            customersCount,
            totalProductsCount,
            activeProductsCount,
            totalCategoriesCount,
            activeOffersList,
            cartsList,
            wishlistsList,
            recentOrdersList,
            lowStockProducts,
        ] = await Promise.all([
            // Status breakdown
            Order.aggregate([
                {
                    $group: {
                        _id: {
                            orderStatus: "$orderStatus",
                            paymentStatus: "$paymentStatus",
                            paymentMethod: "$paymentMethod",
                        },
                        count: { $sum: 1 },
                        totalAmount: { $sum: "$total" },
                    },
                },
            ]),

            // Total orders count
            Order.countDocuments(),

            // Today's total orders
            Order.countDocuments({ createdAt: { $gte: startOfToday } }),

            // Today's realized/active revenue
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfToday },
                        orderStatus: { $ne: "cancelled" },
                        paymentStatus: { $nin: ["failed", "refunded"] },
                    },
                },
                {
                    $group: {
                        _id: null,
                        todayActiveTotal: { $sum: "$total" },
                        todayRealizedTotal: {
                            $sum: {
                                $cond: [
                                    {
                                        $or: [
                                            { $eq: ["$paymentStatus", "paid"] },
                                            {
                                                $and: [
                                                    { $eq: ["$paymentMethod", "cod"] },
                                                    { $eq: ["$orderStatus", "delivered"] },
                                                ],
                                            },
                                        ],
                                    },
                                    "$total",
                                    0,
                                ],
                            },
                        },
                    },
                },
            ]),

            // Real Customers count
            User.countDocuments({ role: "customer" }),

            // Products counts
            Product.countDocuments(),
            Product.countDocuments({ isActive: true }),

            // Categories count
            Category.countDocuments(),

            // Active/Current Offers
            Offer.find({ isActive: true })
                .select("title discountType discountValue startDate endDate")
                .lean(),

            // Active Carts for intent
            Cart.find({}).select("items").lean(),

            // Active Wishlists for intent
            Wishlist.find({}).select("products").lean(),

            // 6 Most recent orders for table
            Order.find({})
                .populate("user", "name email")
                .sort({ createdAt: -1 })
                .limit(6)
                .lean(),

            // Inventory: products with any variant stock <= 5
            Product.find({
                isActive: true,
                "variants.stock": { $lte: 5 },
            })
                .select("name images variants category")
                .populate("category", "name")
                .limit(10)
                .lean(),
        ]);

        // Process status aggregation into clear buckets
        let realizedRevenue = 0;
        let pipelineRevenue = 0; // orders placed/shipped awaiting delivery/cash collection
        let cancelledRevenue = 0;
        let pendingOrdersCount = 0;
        let processingOrdersCount = 0;
        let shippedOrdersCount = 0;
        let deliveredOrdersCount = 0;
        let cancelledOrdersCount = 0;

        const statusDistribution = {
            pending: { count: 0, amount: 0 },
            confirmed: { count: 0, amount: 0 },
            processing: { count: 0, amount: 0 },
            shipped: { count: 0, amount: 0 },
            delivered: { count: 0, amount: 0 },
            cancelled: { count: 0, amount: 0 },
        };

        statusAggregation.forEach((group) => {
            const { orderStatus, paymentStatus, paymentMethod } = group._id;
            const count = group.count || 0;
            const amount = group.totalAmount || 0;

            if (statusDistribution[orderStatus]) {
                statusDistribution[orderStatus].count += count;
                statusDistribution[orderStatus].amount += amount;
            }

            if (orderStatus === "cancelled") {
                cancelledOrdersCount += count;
                cancelledRevenue += amount;
            } else if (paymentStatus === "failed" || paymentStatus === "refunded") {
                cancelledRevenue += amount;
            } else {
                // Determine if realized or active pipeline
                const isRealized =
                    paymentStatus === "paid" ||
                    (paymentMethod === "cod" && orderStatus === "delivered");

                if (isRealized) {
                    realizedRevenue += amount;
                } else {
                    pipelineRevenue += amount;
                }

                if (orderStatus === "pending") pendingOrdersCount += count;
                if (orderStatus === "confirmed" || orderStatus === "processing")
                    processingOrdersCount += count;
                if (orderStatus === "shipped") shippedOrdersCount += count;
                if (orderStatus === "delivered") deliveredOrdersCount += count;
            }
        });

        // Today's numbers
        const todayRevenue = todayRealizedRevenueAgg[0]?.todayRealizedTotal || 0;
        const todayPipelineRevenue = todayRealizedRevenueAgg[0]?.todayActiveTotal || 0;

        // 2. Timeline Aggregation (Daily revenue & orders over last 30 days)
        const timelineAgg = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    orderStatus: { $ne: "cancelled" },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    ordersCount: { $sum: 1 },
                    totalRevenue: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ["$paymentStatus", "paid"] },
                                        {
                                            $and: [
                                                { $eq: ["$paymentMethod", "cod"] },
                                                { $eq: ["$orderStatus", "delivered"] },
                                            ],
                                        },
                                    ],
                                },
                                "$total",
                                0,
                            ],
                        },
                    },
                    pipelineAmount: { $sum: "$total" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Build continuous 30-day timeline
        const timelineMap = new Map();
        timelineAgg.forEach((item) => {
            timelineMap.set(item._id, {
                ordersCount: item.ordersCount,
                realizedRevenue: item.totalRevenue,
                pipelineAmount: item.pipelineAmount,
            });
        });

        const timeline30Days = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateKey = d.toISOString().split("T")[0];
            const existing = timelineMap.get(dateKey);

            timeline30Days.push({
                date: dateKey,
                label: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
                ordersCount: existing ? existing.ordersCount : 0,
                realizedRevenue: existing ? existing.realizedRevenue : 0,
                pipelineAmount: existing ? existing.pipelineAmount : 0,
            });
        }

        // 3. Category Sales & Volume Aggregation
        const categoryPerformanceAgg = await Order.aggregate([
            { $match: { orderStatus: { $ne: "cancelled" } } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productDoc",
                },
            },
            { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "categories",
                    localField: "productDoc.category",
                    foreignField: "_id",
                    as: "categoryDoc",
                },
            },
            { $unwind: { path: "$categoryDoc", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: {
                        $ifNull: ["$categoryDoc.name", "General"],
                    },
                    totalQuantity: { $sum: "$items.quantity" },
                    totalAmount: { $sum: "$items.subtotal" },
                    ordersCount: { $sum: 1 },
                },
            },
            { $sort: { totalAmount: -1 } },
            { $limit: 6 },
        ]);

        // 4. Top Selling Products
        const topProductsAgg = await Order.aggregate([
            { $match: { orderStatus: { $ne: "cancelled" } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    name: { $first: "$items.name" },
                    sku: { $first: "$items.sku" },
                    image: { $first: "$items.image.url" },
                    totalQuantity: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: "$items.subtotal" },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
        ]);

        // 5. Inventory Attention List (Flatten low-stock variants)
        const lowStockVariants = [];
        lowStockProducts.forEach((p) => {
            (p.variants || []).forEach((v) => {
                if (v.stock <= 5 && v.isActive !== false) {
                    lowStockVariants.push({
                        productId: p._id,
                        productName: p.name,
                        category: p.category?.name || "General",
                        sku: v.sku,
                        variantLabel: (v.attributes || []).map((a) => `${a.name}: ${a.value}`).join(" | "),
                        stock: v.stock,
                        price: v.price,
                        image: p.images?.[0]?.url || "",
                    });
                }
            });
        });
        // Sort lowest stock first
        lowStockVariants.sort((a, b) => a.stock - b.stock);

        // 6. Secondary Engagement Metrics (Cart & Wishlist)
        const totalCartItems = cartsList.reduce(
            (sum, cart) =>
                sum +
                (cart.items || []).reduce((s, item) => s + (item.quantity || 1), 0),
            0
        );
        const totalWishlistItems = wishlistsList.reduce(
            (sum, wl) => sum + (wl.products?.length || 0),
            0
        );

        return res.status(200).json({
            success: true,
            analytics: {
                kpis: {
                    realizedRevenue,
                    pipelineRevenue,
                    activeTotalValue: realizedRevenue + pipelineRevenue,
                    cancelledRevenue,
                    totalOrders: totalOrdersCount,
                    todayOrders: todayOrdersCount,
                    todayRealizedRevenue: todayRevenue,
                    todayPipelineRevenue,
                    pendingOrders: pendingOrdersCount,
                    processingOrders: processingOrdersCount,
                    shippedOrders: shippedOrdersCount,
                    deliveredOrders: deliveredOrdersCount,
                    cancelledOrders: cancelledOrdersCount,
                    totalCustomers: customersCount,
                    totalProducts: totalProductsCount,
                    activeProducts: activeProductsCount,
                    totalCategories: totalCategoriesCount,
                    lowStockCount: lowStockVariants.length,
                    activeOffersCount: activeOffersList.length,
                },
                engagement: {
                    activeCartsCount: cartsList.filter((c) => c.items?.length > 0).length,
                    cartItemsTotal: totalCartItems,
                    wishlistsCount: wishlistsList.filter((w) => w.products?.length > 0).length,
                    wishlistItemsTotal: totalWishlistItems,
                },
                timeline30Days,
                statusDistribution,
                categoryPerformance: categoryPerformanceAgg.map((c) => ({
                    name: c._id,
                    quantity: c.totalQuantity,
                    amount: c.totalAmount,
                    orders: c.ordersCount,
                })),
                topSellingProducts: topProductsAgg,
                inventoryAlerts: lowStockVariants.slice(0, 8),
                recentOrders: recentOrdersList.map((ord) => ({
                    _id: ord._id,
                    orderNumber: ord.orderNumber || ord._id.toString().slice(-8).toUpperCase(),
                    customerName: ord.user?.name || ord.shippingAddress?.fullName || "Guest Customer",
                    customerEmail: ord.user?.email || "",
                    phone: ord.shippingAddress?.phone || "",
                    city: ord.shippingAddress?.city || "",
                    itemsCount: ord.items?.length || 0,
                    total: ord.total,
                    orderStatus: ord.orderStatus,
                    paymentStatus: ord.paymentStatus,
                    paymentMethod: ord.paymentMethod,
                    createdAt: ord.createdAt,
                })),
                activeOffers: activeOffersList.map((o) => {
                    const daysLeft = Math.max(
                        0,
                        Math.ceil((new Date(o.endDate) - now) / (1000 * 60 * 60 * 24))
                    );
                    return {
                        _id: o._id,
                        title: o.title,
                        discountType: o.discountType,
                        discountValue: o.discountValue,
                        endDate: o.endDate,
                        daysLeft,
                    };
                }),
            },
        });
    } catch (error) {
        console.error("Get Admin Analytics error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate admin analytics",
            error: error.message,
        });
    }
};
