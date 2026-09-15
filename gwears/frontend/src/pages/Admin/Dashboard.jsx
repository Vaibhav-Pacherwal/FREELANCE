import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../ApiEndpoints.js";
import { useAuth } from "../../utils/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeframe, setTimeframe] = useState("30"); // "7" or "30"
  const [chartMode, setChartMode] = useState("revenue"); // "revenue" or "orders"
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(API.adminAnalytics, {
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to load store analytics");
      }

      setData(json.analytics);
    } catch (err) {
      console.error("Fetch analytics error:", err);
      setError(err.message || "Failed to connect to analytics server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Filtered timeline based on timeframe (7 or 30 days)
  const chartData = useMemo(() => {
    if (!data?.timeline30Days) return [];
    const days = parseInt(timeframe, 10);
    return data.timeline30Days.slice(-days);
  }, [data, timeframe]);

  // Calculations for SVG Area Chart
  const svgChart = useMemo(() => {
    if (!chartData.length) return null;

    const width = 680;
    const height = 210;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };

    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const values = chartData.map((d) =>
      chartMode === "revenue" ? d.realizedRevenue + d.pipelineAmount : d.ordersCount
    );

    const maxValue = Math.max(...values, chartMode === "revenue" ? 500 : 2);
    const minValue = 0;

    const points = chartData.map((d, index) => {
      const val =
        chartMode === "revenue"
          ? d.realizedRevenue + d.pipelineAmount
          : d.ordersCount;
      const x = padding.left + (index / (chartData.length - 1 || 1)) * innerWidth;
      const y =
        padding.top +
        innerHeight -
        ((val - minValue) / (maxValue - minValue || 1)) * innerHeight;
      return { x, y, data: d, val };
    });

    const pathD = points.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x},${pt.y}`;
      return `${acc} L ${pt.x},${pt.y}`;
    }, "");

    const areaD = `${pathD} L ${padding.left + innerWidth},${
      padding.top + innerHeight
    } L ${padding.left},${padding.top + innerHeight} Z`;

    // Y-axis ticks (3 ticks)
    const yTicks = [
      { val: minValue, y: padding.top + innerHeight },
      { val: Math.round(maxValue / 2), y: padding.top + innerHeight / 2 },
      { val: maxValue, y: padding.top },
    ];

    // X-axis label step to avoid clutter
    const step = chartData.length > 10 ? 5 : 2;

    return {
      width,
      height,
      padding,
      points,
      pathD,
      areaD,
      yTicks,
      step,
      maxValue,
    };
  }, [chartData, chartMode]);

  // Calculations for Donut Chart (Status distribution)
  const donutData = useMemo(() => {
    if (!data?.statusDistribution) return [];

    const dist = data.statusDistribution;
    const items = [
      { key: "delivered", label: "Delivered", count: dist.delivered?.count || 0, amount: dist.delivered?.amount || 0, color: "#10B981" },
      { key: "shipped", label: "Shipped", count: dist.shipped?.count || 0, amount: dist.shipped?.amount || 0, color: "#8B5CF6" },
      { key: "processing", label: "Processing", count: (dist.processing?.count || 0) + (dist.confirmed?.count || 0), amount: (dist.processing?.amount || 0) + (dist.confirmed?.amount || 0), color: "#0284C7" },
      { key: "pending", label: "Pending", count: dist.pending?.count || 0, amount: dist.pending?.amount || 0, color: "#F59E0B" },
      { key: "cancelled", label: "Cancelled", count: dist.cancelled?.count || 0, amount: dist.cancelled?.amount || 0, color: "#EF4444" },
    ].filter((item) => item.count > 0);

    const total = items.reduce((sum, item) => sum + item.count, 0);

    let cumulativeAngle = 0;
    return items.map((item) => {
      const percentage = total > 0 ? (item.count / total) * 100 : 0;
      const angle = (percentage / 100) * 360;
      const startAngle = cumulativeAngle;
      cumulativeAngle += angle;
      return {
        ...item,
        percentage: Math.round(percentage),
        startAngle,
        angle,
      };
    });
  }, [data]);

  const kpis = data?.kpis || {};
  const engagement = data?.engagement || {};

  if (loading) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <i className="fa-solid fa-circle-notch fa-spin fa-2x" style={{ color: "#0F172A" }}></i>
        <p style={{ marginTop: "1rem", color: "#64748B", fontSize: "0.9rem" }}>
          Aggregating real store metrics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <i className="fa-solid fa-triangle-exclamation fa-3x" style={{ color: "#DC2626" }}></i>
        <h3 style={{ marginTop: "1rem" }}>Failed to Load Dashboard</h3>
        <p style={{ color: "#64748B" }}>{error}</p>
        <button
          className="gw-admin-quick-btn"
          style={{ marginTop: "1rem" }}
          onClick={fetchAnalytics}
        >
          <i className="fa-solid fa-rotate-right"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="gw-dash-page">
      {/* 1. DASHBOARD HEADER */}
      <div className="gw-dash-header">
        <div className="gw-dash-greeting">
          <h2>Welcome back, {user?.name?.split(" ")[0] || "Store Admin"}</h2>
          <p>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            &bull; Live Retail Operations
          </p>
        </div>

        <div className="gw-dash-controls">
          <div className="gw-dash-date-pill">
            <i className="fa-regular fa-calendar"></i>
            <span>Range:</span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                fontWeight: 700,
                color: "#0F172A",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>

          <button
            className="gw-dash-date-pill"
            onClick={fetchAnalytics}
            title="Refresh Live Data"
            style={{ cursor: "pointer" }}
          >
            <i className="fa-solid fa-rotate-right"></i>
          </button>
        </div>
      </div>

      {/* 2. CORE KPI CARDS GRID */}
      <div className="gw-kpi-grid">
        {/* CARD 1: REVENUE */}
        <div className="gw-kpi-card">
          <div className="gw-kpi-top">
            <span className="gw-kpi-label">REALIZED REVENUE</span>
            <div className="gw-kpi-icon-wrap revenue">
              <i className="fa-solid fa-indian-rupee-sign"></i>
            </div>
          </div>
          <div className="gw-kpi-value">
            ₹{Number(kpis.realizedRevenue || 0).toLocaleString("en-IN")}
          </div>
          <div className="gw-kpi-sub">
            {kpis.pipelineRevenue > 0 ? (
              <span className="gw-kpi-tag pipeline">
                +₹{Number(kpis.pipelineRevenue).toLocaleString("en-IN")} in pipeline
              </span>
            ) : (
              <span className="gw-kpi-tag realized">All active realized</span>
            )}
          </div>
        </div>

        {/* CARD 2: ORDERS */}
        <div className="gw-kpi-card">
          <div className="gw-kpi-top">
            <span className="gw-kpi-label">TOTAL ORDERS</span>
            <div className="gw-kpi-icon-wrap orders">
              <i className="fa-solid fa-bag-shopping"></i>
            </div>
          </div>
          <div className="gw-kpi-value">{kpis.totalOrders || 0}</div>
          <div className="gw-kpi-sub">
            <span>
              <strong>{kpis.shippedOrders || 0}</strong> active &bull;{" "}
              <strong>{kpis.cancelledOrders || 0}</strong> cancelled
              {kpis.cancelledRevenue > 0 && ` (₹${Number(kpis.cancelledRevenue).toLocaleString("en-IN")})`}
            </span>
          </div>
        </div>

        {/* CARD 3: CUSTOMERS */}
        <div className="gw-kpi-card">
          <div className="gw-kpi-top">
            <span className="gw-kpi-label">CUSTOMERS</span>
            <div className="gw-kpi-icon-wrap customers">
              <i className="fa-solid fa-users"></i>
            </div>
          </div>
          <div className="gw-kpi-value">{kpis.totalCustomers || 0}</div>
          <div className="gw-kpi-sub">
            <span>Registered customer accounts</span>
          </div>
        </div>

        {/* CARD 4: ACTIVE INVENTORY */}
        <div className="gw-kpi-card">
          <div className="gw-kpi-top">
            <span className="gw-kpi-label">CATALOG STATUS</span>
            <div className="gw-kpi-icon-wrap inventory">
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>
          </div>
          <div className="gw-kpi-value">
            {kpis.activeProducts || 0}{" "}
            <span style={{ fontSize: "1.1rem", color: "#64748B", fontWeight: 500 }}>
              / {kpis.totalProducts || 0}
            </span>
          </div>
          <div className="gw-kpi-sub">
            {kpis.lowStockCount > 0 ? (
              <span className="gw-kpi-tag urgent">
                <i className="fa-solid fa-triangle-exclamation"></i> {kpis.lowStockCount} low-stock
              </span>
            ) : (
              <span className="gw-kpi-tag realized">Optimal Stock Levels</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. SECONDARY CUSTOMER INTENT & PIPELINE ENGAGEMENT STRIP */}
      <div className="gw-engagement-strip">
        <div className="gw-engagement-title">
          <i className="fa-solid fa-radar" style={{ color: "#0F172A" }}></i>
          <span>Shopper Intent &amp; Activity</span>
        </div>
        <div className="gw-engagement-items">
          <div className="gw-engagement-metric">
            <i className="fa-solid fa-cart-shopping" style={{ color: "#2563EB" }}></i>
            <span>Active Carts:</span>
            <strong>{engagement.activeCartsCount || 0}</strong>
            <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>
              ({engagement.cartItemsTotal || 0} items)
            </span>
          </div>
          <div className="gw-engagement-metric">
            <i className="fa-regular fa-heart" style={{ color: "#DB2777" }}></i>
            <span>Wishlisted Items:</span>
            <strong>{engagement.wishlistItemsTotal || 0}</strong>
          </div>
          <div className="gw-engagement-metric">
            <i className="fa-solid fa-tag" style={{ color: "#D97706" }}></i>
            <span>Active Promotions:</span>
            <strong>{kpis.activeOffersCount || 0}</strong>
          </div>
        </div>
      </div>

      {/* 4. CHARTS SECTION: TIMELINE + STATUS DONUT */}
      <div className="gw-charts-grid">
        {/* REVENUE & ORDER TIMELINE (SVG AREA CHART) */}
        <div className="gw-card">
          <div className="gw-card-header">
            <div className="gw-card-title-wrap">
              <h3>Sales &amp; Volume Over Time</h3>
              <p>Continuous daily store performance (Last {timeframe} Days)</p>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                className={`gw-quick-action-btn ${chartMode === "revenue" ? "active" : ""}`}
                style={{
                  padding: "4px 10px",
                  fontSize: "0.75rem",
                  background: chartMode === "revenue" ? "#0F172A" : "#FFFFFF",
                  color: chartMode === "revenue" ? "#FFFFFF" : "#0F172A",
                }}
                onClick={() => setChartMode("revenue")}
              >
                Revenue
              </button>
              <button
                type="button"
                className={`gw-quick-action-btn ${chartMode === "orders" ? "active" : ""}`}
                style={{
                  padding: "4px 10px",
                  fontSize: "0.75rem",
                  background: chartMode === "orders" ? "#0F172A" : "#FFFFFF",
                  color: chartMode === "orders" ? "#FFFFFF" : "#0F172A",
                }}
                onClick={() => setChartMode("orders")}
              >
                Orders
              </button>
            </div>
          </div>

          <div className="gw-card-body" style={{ position: "relative" }}>
            {svgChart ? (
              <div className="gw-svg-chart-container">
                <svg
                  viewBox={`0 0 ${svgChart.width} ${svgChart.height}`}
                  className="gw-chart-svg"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="gwRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0F172A" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0F172A" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines & Y-ticks */}
                  {svgChart.yTicks.map((tick, i) => (
                    <g key={i}>
                      <line
                        x1={svgChart.padding.left}
                        y1={tick.y}
                        x2={svgChart.width - svgChart.padding.right}
                        y2={tick.y}
                        stroke="#E2E8F0"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={svgChart.padding.left - 8}
                        y={tick.y + 4}
                        textAnchor="end"
                        fontSize="10"
                        fill="#64748B"
                        fontFamily="inherit"
                      >
                        {chartMode === "revenue"
                          ? `₹${tick.val.toLocaleString("en-IN")}`
                          : tick.val}
                      </text>
                    </g>
                  ))}

                  {/* Area fill */}
                  <path d={svgChart.areaD} fill="url(#gwRevenueGrad)" />

                  {/* Line path */}
                  <path
                    d={svgChart.pathD}
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Points */}
                  {svgChart.points.map((pt, i) => (
                    <circle
                      key={i}
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredPoint?.index === i ? 5 : 3}
                      fill={hoveredPoint?.index === i ? "#D97706" : "#0F172A"}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      style={{ cursor: "pointer", transition: "all 0.1s" }}
                      onMouseEnter={() => setHoveredPoint({ ...pt, index: i })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}

                  {/* X-axis labels */}
                  {svgChart.points.map((pt, i) => {
                    if (i % svgChart.step !== 0 && i !== svgChart.points.length - 1) return null;
                    return (
                      <text
                        key={i}
                        x={pt.x}
                        y={svgChart.height - 8}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#64748B"
                        fontFamily="inherit"
                      >
                        {pt.data.label}
                      </text>
                    );
                  })}
                </svg>

                {/* Floating tooltip */}
                {hoveredPoint && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${(hoveredPoint.x / svgChart.width) * 100}%`,
                      top: `${hoveredPoint.y - 45}px`,
                      transform: "translate(-50%, -100%)",
                      background: "#0F172A",
                      color: "#FFFFFF",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                      zIndex: 10,
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{hoveredPoint.data.label}</div>
                    <div>
                      {chartMode === "revenue"
                        ? `Sales: ₹${Number(hoveredPoint.val).toLocaleString("en-IN")}`
                        : `Orders: ${hoveredPoint.val}`}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: "3rem", textAlign: "center", color: "#64748B" }}>
                No sales recorded in this period.
              </div>
            )}
          </div>
        </div>

        {/* ORDER STATUS DISTRIBUTION (DONUT CHART) */}
        <div className="gw-card">
          <div className="gw-card-header">
            <div className="gw-card-title-wrap">
              <h3>Order Breakdown</h3>
              <p>Fulfillment status distribution</p>
            </div>
          </div>

          <div className="gw-card-body">
            {donutData.length > 0 ? (
              <div className="gw-donut-wrap">
                {/* SVG DONUT */}
                <svg viewBox="0 0 100 100" className="gw-donut-svg">
                  {donutData.reduce((acc, slice) => {
                    // SVG stroke-dasharray technique
                    // Circumference of radius 38 is 2 * PI * 38 = ~238.76
                    const C = 238.76;
                    const strokeLength = (slice.percentage / 100) * C;
                    const strokeOffset = C - (acc.cumulativePercentage / 100) * C;

                    acc.elements.push(
                      <circle
                        key={slice.key}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth="16"
                        strokeDasharray={`${strokeLength} ${C - strokeLength}`}
                        strokeDashoffset={strokeOffset}
                      />
                    );

                    acc.cumulativePercentage += slice.percentage;
                    return acc;
                  }, { elements: [], cumulativePercentage: 0 }).elements}
                </svg>

                {/* Legend */}
                <div className="gw-donut-legend">
                  {donutData.map((d) => (
                    <div key={d.key} className="gw-donut-legend-item">
                      <div className="gw-donut-legend-left">
                        <span className="gw-donut-dot" style={{ background: d.color }}></span>
                        <span>{d.label}</span>
                      </div>
                      <span style={{ fontWeight: 700 }}>
                        {d.count} ({d.percentage}%) {d.amount > 0 ? `• ₹${Number(d.amount).toLocaleString("en-IN")}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: "3rem", textAlign: "center", color: "#64748B" }}>
                No orders placed yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. LOWER SPLIT GRID: RECENT ORDERS + INVENTORY ATTENTION */}
      <div className="gw-lower-grid">
        {/* RECENT ORDERS TABLE */}
        <div className="gw-card">
          <div className="gw-card-header">
            <div className="gw-card-title-wrap">
              <h3>Recent Customer Orders</h3>
              <p>Latest transactions awaiting processing or tracking</p>
            </div>
            <button
              type="button"
              className="gw-quick-action-btn"
              onClick={() => navigate("/admin/orders")}
              style={{ padding: "4px 10px", fontSize: "0.75rem" }}
            >
              View All &rarr;
            </button>
          </div>

          <div className="gw-table-responsive">
            <table className="gw-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentOrders?.length > 0 ? (
                  data.recentOrders.map((ord) => (
                    <tr key={ord._id}>
                      <td style={{ fontWeight: 700, fontFamily: "monospace" }}>
                        #{ord.orderNumber}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ord.customerName}</div>
                        <div style={{ fontSize: "0.72rem", color: "#64748B" }}>
                          {ord.city || "India"} &bull; {ord.itemsCount} item
                          {ord.itemsCount === 1 ? "" : "s"}
                        </div>
                      </td>
                      <td style={{ color: "#64748B", whiteSpace: "nowrap" }}>
                        {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        ₹{Number(ord.total).toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span className={`gw-badge ${ord.orderStatus}`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="gw-admin-action-btn secondary"
                          style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                          onClick={() => navigate(`/admin/orders/${ord._id}`)}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#64748B" }}>
                      No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* INVENTORY RESTOCKING ALERTS */}
        <div className="gw-card">
          <div className="gw-card-header">
            <div className="gw-card-title-wrap">
              <h3>Inventory Alerts</h3>
              <p>Variants with low stock (&le; 5 units)</p>
            </div>
            <button
              type="button"
              className="gw-quick-action-btn"
              onClick={() => navigate("/admin/products")}
              style={{ padding: "4px 10px", fontSize: "0.75rem" }}
            >
              Inventory &rarr;
            </button>
          </div>

          <div className="gw-card-body">
            {data?.inventoryAlerts?.length > 0 ? (
              <div className="gw-inventory-list">
                {data.inventoryAlerts.map((item, idx) => (
                  <div key={idx} className="gw-inventory-item">
                    <div className="gw-inv-left">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=80&q=80"}
                        alt={item.productName}
                        className="gw-inv-img"
                      />
                      <div className="gw-inv-info">
                        <span className="gw-inv-name">{item.productName}</span>
                        <span className="gw-inv-sku">
                          {item.variantLabel ? <span style={{ color: "#D97706", fontWeight: 600 }}>{item.variantLabel} &bull; </span> : null}
                          {item.sku}
                        </span>
                      </div>
                    </div>
                    <div className="gw-inv-stock">
                      <span className={`gw-stock-pill ${item.stock === 0 ? "zero" : "low"}`}>
                        {item.stock === 0 ? "OUT OF STOCK" : `${item.stock} left`}
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/products/edit/${item.productId}`)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2563EB",
                          fontSize: "0.7rem",
                          cursor: "pointer",
                          marginTop: "2px",
                          textDecoration: "underline",
                        }}
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#64748B" }}>
                <i className="fa-solid fa-circle-check fa-2x" style={{ color: "#10B981", marginBottom: "0.5rem" }}></i>
                <p style={{ fontSize: "0.85rem", margin: 0 }}>All inventory levels are healthy.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. OPERATIONAL SHORTCUTS */}
      <div className="gw-card" style={{ marginBottom: "1.5rem" }}>
        <div className="gw-card-header">
          <div className="gw-card-title-wrap">
            <h3>Store Management Shortcuts</h3>
            <p>Direct routes to core administration modules</p>
          </div>
        </div>
        <div className="gw-card-body">
          <div className="gw-quick-actions">
            <button
              type="button"
              className="gw-quick-action-btn"
              onClick={() => navigate("/admin/products/new")}
            >
              <i className="fa-solid fa-plus" style={{ color: "#10B981" }}></i>
              <span>Add New Product</span>
            </button>
            <button
              type="button"
              className="gw-quick-action-btn"
              onClick={() => navigate("/admin/orders")}
            >
              <i className="fa-solid fa-list-check" style={{ color: "#2563EB" }}></i>
              <span>Process Orders</span>
            </button>
            <button
              type="button"
              className="gw-quick-action-btn"
              onClick={() => navigate("/admin/offers/new")}
            >
              <i className="fa-solid fa-percent" style={{ color: "#D97706" }}></i>
              <span>Create Special Offer</span>
            </button>
            <button
              type="button"
              className="gw-quick-action-btn"
              onClick={() => navigate("/admin/categories")}
            >
              <i className="fa-solid fa-tags" style={{ color: "#8B5CF6" }}></i>
              <span>Manage Categories</span>
            </button>
            <button
              type="button"
              className="gw-quick-action-btn"
              onClick={() => navigate("/admin/settings")}
            >
              <i className="fa-solid fa-gear" style={{ color: "#64748B" }}></i>
              <span>Store Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}