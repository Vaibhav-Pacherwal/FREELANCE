import {
    useEffect,
    useState,
} from "react";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import server from "../Environment.js";

import { useNavigate } from "react-router-dom";

import { useUserAuth } from "../utils/UserAuthContext.jsx";


export default function CustomerAuth() {

    const navigate = useNavigate();

    const { refreshUser } =
        useUserAuth();


    const [isLogin, setIsLogin] =
        useState(true);


    const [name, setName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");


    const [loading, setLoading] =
        useState(false);


    const [error, setError] =
        useState("");

    const [openError, setOpenError] =
        useState(false);


    const showError = (message) => {

        setError(message);
        setOpenError(true);

    };


    const handleSubmit = async (e) => {

        e.preventDefault();


        setError("");
        setOpenError(false);
        setLoading(true);


        try {

            const endpoint =
                isLogin
                    ? "/auth/login"
                    : "/auth/register";


            const body =
                isLogin
                    ? {
                        email,
                        password,
                    }
                    : {
                        name,
                        email,
                        password,
                    };


            const response =
                await fetch(
                    `${server}${endpoint}`,
                    {
                        method: "POST",

                        credentials:
                            "include",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify(body),
                    }
                );


            const data =
                await response.json();


            /* =========================
               BACKEND ERROR
            ========================= */

            if (!response.ok) {

                showError(
                    data.message ||
                    "Something went wrong. Please try again."
                );

                return;
            }


            /* =========================
               ROLE CHECK
            ========================= */

            if (
                data.user.role !==
                "customer"
            ) {

                showError(
                    "This account is an admin account. Please use admin login."
                );

                return;
            }


            /* =========================
               SUCCESS
            ========================= */

            await refreshUser();

            navigate("/");


        } catch (error) {

            console.error(
                "Customer authentication error:",
                error
            );

            showError(
                "Unable to connect to server. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };


    const handleGoogleLogin = () => {

        window.location.href =
            `${server}/auth/google?role=customer`;

    };


    useEffect(() => {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const errorCode =
            params.get("error");


        if (!errorCode) {
            return;
        }


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


        showError(
            errorMessages[errorCode] ||
            "Something went wrong. Please try again."
        );

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

    }, []);


    return (

        <div>

            <h2>
                {isLogin
                    ? "LOGIN"
                    : "CREATE ACCOUNT"}
            </h2>


            {!isLogin && (

                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) =>
                        setName(
                            e.target.value
                        )
                    }
                />

            )}


            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                    setEmail(
                        e.target.value
                    )
                }
            />


            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                    setPassword(
                        e.target.value
                    )
                }
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


            <button
                onClick={handleGoogleLogin}
                disabled={loading}
            >
                Continue with Google
            </button>


            <button
                type="button"
                onClick={() => {

                    setIsLogin(
                        !isLogin
                    );

                    setError("");
                    setOpenError(false);

                }}
            >
                {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Login"}
            </button>


            {/* ERROR SNACKBAR */}

            <Snackbar
                open={openError}
                autoHideDuration={4000}
                onClose={() =>
                    setOpenError(false)
                }
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
            >

                <Alert
                    onClose={() =>
                        setOpenError(false)
                    }
                    severity="error"
                    variant="filled"
                    sx={{
                        width: "100%",
                    }}
                >
                    {error}
                </Alert>

            </Snackbar>

        </div>

    );
}