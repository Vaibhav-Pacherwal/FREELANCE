import { createContext, useContext, useEffect, useState } from "react";
import server from "../Environment.js";

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getUser = async () => {
        try {
            const res = await fetch(`${server}/auth/me`, {
                credentials: "include",
            });

            if (!res.ok) {
                setUser(null);
                return;
            }

            const data = await res.json();

            setUser(data.user);

        } catch (error) {
            console.error("Failed to fetch user:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    const logout = async () => {
        try {
            await fetch(`${server}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });

            setUser(null);

        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <UserAuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                logout,
                refreshUser: getUser,
            }}
        >
            {children}
        </UserAuthContext.Provider>
    );
}

export function useUserAuth() {
    return useContext(UserAuthContext);
}