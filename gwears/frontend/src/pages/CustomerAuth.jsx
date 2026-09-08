import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useEffect, useState } from "react";
import server from "../Environment.js";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../utils/UserAuthContext.jsx";

export default function CustomerAuth() {
    const navigate = useNavigate();
    const { refreshUser } = useUserAuth();

    const [isLogin, setIsLogin] = useState(true);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [openError, setOpenError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const endpoint = isLogin
                ? "/auth/login"
                : "/auth/register";

            const body = isLogin
                ? { email, password }
                : { name, email, password };

            const res = await fetch(`${server}${endpoint}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Something went wrong");
                setOpenError(true);
                return;
            }

            if (data.user.role !== "customer") {
                setError("This account is an admin account. Please use admin login.");
                return;
            }

            await refreshUser();

            navigate("/");

        } catch (error) {
            console.error(error);
            setError("Unable to connect to server");
            setOpenError(true);

        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${server}/auth/google?role=customer`;
    };

    useEffect(() => {

        const params = new URLSearchParams(window.location.search);

        const errorCode = params.get("error");

        if (!errorCode) return;

        const errorMessages = {
            "not-customer":
                "This account is an admin account. Please use admin login.",

            "disabled":
                "This account has been disabled.",

            "oauth-failed":
                "Google authentication failed. Please try again.",

            "invalid-auth":
                "Invalid authentication request.",
        };

        setError(
            errorMessages[errorCode] ||
            "Something went wrong. Please try again."
        );

        setOpenError(true);

        // Remove error parameter from URL
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

    }, []);

    return (
        <div>
            <h2>
                {isLogin ? "LOGIN" : "CREATE ACCOUNT"}
            </h2>

            {!isLogin && (
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            )}

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading
                    ? "PLEASE WAIT..."
                    : isLogin
                        ? "LOGIN"
                        : "SIGN UP"}
            </button>

            <button onClick={handleGoogleLogin}>
                Continue with Google
            </button>

            <button
                type="button"
                onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                }}
            >
                {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Login"}
            </button>

            <Snackbar
                open={openError}
                autoHideDuration={4000}
                onClose={() => setOpenError(false)}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
            >
                <Alert
                    onClose={() => setOpenError(false)}
                    severity="error"
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </div>
    );
}