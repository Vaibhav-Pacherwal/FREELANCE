import { useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import server from "../Environment.js";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../utils/UserAuthContext.jsx";
import "./CustomerAuth.css";

export default function CustomerAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser, user } = useUserAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openError, setOpenError] = useState(false);

  // If already logged in, redirect to account or home
  useEffect(() => {
    if (user) {
      navigate("/account");
    }
  }, [user]);

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
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const body = isLogin ? { email, password } : { name, email, password };

      const response = await fetch(`${server}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || "Authentication failed. Please check your credentials.");
        return;
      }

      if (data.user?.role !== "customer") {
        showError("This account has administrative permissions. Please use the Admin portal.");
        return;
      }

      await refreshUser();
      navigate("/");
    } catch (err) {
      console.error("Customer authentication error:", err);
      showError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${server}/auth/google?role=customer`;
  };

  // Check URL error parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get("error");
    if (!errorCode) return;

    const errorMessages = {
      "not-customer": "This account is registered as administrative. Please use the Admin portal.",
      disabled: "This account has been suspended.",
      "oauth-failed": "Google verification failed. Please try again or use your password.",
      "invalid-auth": "Invalid authentication credentials supplied.",
    };

    showError(errorMessages[errorCode] || "Authentication encountered an error.");
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  return (
    <div className="gw-auth-page">
      <div className="gw-auth-card">
        <span className="gw-auth-badge">GWEARS STORE</span>
        <h1 className="gw-auth-title">
          {isLogin ? "SIGN IN" : "CREATE AN ACCOUNT"}
        </h1>
        <p className="gw-auth-subtitle">
          {isLogin
            ? "Access your saved wishlist, track orders, and manage your account."
            : "Create an account for fast checkout, order tracking, and exclusive offers."}
        </p>

        <form onSubmit={handleSubmit} className="gw-auth-form">
          {!isLogin && (
            <div className="gw-auth-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Alexander Vance"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                className="gw-auth-input"
              />
            </div>
          )}

          <div className="gw-auth-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="e.g. client@example.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="gw-auth-input"
            />
          </div>

          <div className="gw-auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="gw-auth-input"
            />
          </div>

          <button
            type="submit"
            className="gw-auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i> PLEASE WAIT...
              </>
            ) : isLogin ? (
              "SIGN IN"
            ) : (
              "CREATE ACCOUNT"
            )}
          </button>
        </form>

        <div className="gw-auth-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="gw-google-btn"
        >
          <svg className="gw-google-icon" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          className="gw-auth-toggle-btn"
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
            setOpenError(false);
          }}
        >
          {isLogin
            ? "New to GWears? Create an Account"
            : "Already have an account? Sign In"}
        </button>

        <div className="gw-auth-security-note">
          <i className="fa-solid fa-shield-halved"></i>
          <span>100% Secure &amp; Protected Account</span>
        </div>
      </div>

      <Snackbar
        open={openError}
        autoHideDuration={4000}
        onClose={() => setOpenError(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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