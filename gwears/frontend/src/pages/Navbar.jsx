import "../Navbar.css";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../utils/UserAuthContext.jsx";
import { useCart } from "../utils/CartContext.jsx";

export default function Navbar() {

    const navigate = useNavigate();

    const { user, loading } = useUserAuth();

    const { cartCount } = useCart();

    console.log("Navbar user:", user);

    const handleUserClick = () => {
        if (loading) return;

        if (user) {
            navigate("/account");
        } else {
            navigate("/login");
        }
    };

    return (
        <div className="nav">

            <div className="brand">
                <h2 onClick={() => navigate("/")}>
                    GWears
                </h2>
            </div>

            <div className="navOptions">

                <i
                    className="fa-solid fa-magnifying-glass"
                    title="Search"
                ></i>

                <div
                    className="cartIcon"
                    onClick={() => navigate("/cart")}
                    title="Cart"
                >
                    <i className="fa-solid fa-cart-shopping"></i>

                    {cartCount > 0 && (
                        <span className="cartCount">
                            {cartCount}
                        </span>
                    )}
                </div>

                <i
                    className="fa-regular fa-user"
                    title={user ? "My Account" : "Login"}
                    onClick={handleUserClick}
                ></i>

            </div>
        </div>
    );
}