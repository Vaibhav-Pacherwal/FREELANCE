import { useEffect, useState } from "react";
import server from "../Environment.js";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${server}/admin/me`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();

          setUser(data.user);
          setAuthorized(true);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authorized) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}