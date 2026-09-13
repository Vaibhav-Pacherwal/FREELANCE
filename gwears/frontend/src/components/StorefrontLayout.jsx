import { Outlet } from "react-router-dom";
import Navbar from "../pages/Navbar.jsx";
import Footer from "./Footer.jsx";

export default function StorefrontLayout() {
  return (
    <div className="gw-storefront-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <main className="gw-storefront-main" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
