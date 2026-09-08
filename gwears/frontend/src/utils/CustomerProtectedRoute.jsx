import { Navigate } from "react-router-dom";
import { useUserAuth } from "../utils/UserAuthContext.jsx";

export default function CustomerProtectedRoute({ children }) {

    const { user, loading } = useUserAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}