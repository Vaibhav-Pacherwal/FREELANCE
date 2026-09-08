import { useUserAuth } from "../utils/UserAuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Account() {

    const { user, logout } = useUserAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    if (!user) {
        return null;
    }

    return (
        <div>
            <h1>My Account</h1>

            <img
                src="/images/profile.png"
                alt={user.name}
                width="80"
                height="80"
            />

            <h2>{user.name}</h2>

            <p>{user.email}</p>

            <button onClick={() => navigate("/orders")}>
                MY ORDERS
            </button>

            <button onClick={handleLogout}>
                LOGOUT
            </button>
        </div>
    );
}