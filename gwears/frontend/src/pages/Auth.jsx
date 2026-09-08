import { useState, useEffect } from "react";
import "../Auth.css";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import server from "../Environment.js";

export default function Auth({ login }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [openError, setOpenError] = useState(false);

  const handleSignIn = async () => {

    setError("");
    setOpenError(false);

    const data = {
      email,
      password
    };

    const result = await login(data);

    if (!result.success) {
      setError(result.message);
      setOpenError(true);
    }
  };

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);

    const errorCode = params.get("error");

    if (!errorCode) {
      return;
    }

    const errorMessages = {
      "not-admin":
        "This Google account is not an admin account.",

      "admin-not-found":
        "This Google account is not registered as an admin.",

      "disabled":
        "This account has been disabled.",

      "oauth-failed":
        "Google authentication failed. Please try again.",

      "invalid-auth":
        "Invalid authentication request."
    };

    setError(
      errorMessages[errorCode] ||
      "Something went wrong. Please try again."
    );

    setOpenError(true);

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );

  }, []);

  return (
    <>
      <div className="auth-form">

        <div className="signin">

          <h2>ADMIN LOGIN</h2>

          <TextField
            label="Email"
            variant="standard"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              "& .MuiInputLabel-root": {
                color: "black"
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "black"
              },
              "& .MuiInput-underline:before": {
                borderBottomColor: "black"
              },
              "& .MuiInput-underline:hover:before": {
                borderBottomColor: "black"
              },
              "& .MuiInput-underline:after": {
                borderBottomColor: "black"
              },
            }}
          />

          <TextField
            label="Password"
            variant="standard"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              "& .MuiInputLabel-root": {
                color: "black"
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "black"
              },
              "& .MuiInput-underline:before": {
                borderBottomColor: "black"
              },
              "& .MuiInput-underline:hover:before": {
                borderBottomColor: "black"
              },
              "& .MuiInput-underline:after": {
                borderBottomColor: "black"
              },
            }}
          />

          <Button
            variant="contained"
            onClick={handleSignIn}
            style={{
              backgroundColor: "black"
            }}
          >
            SIGN IN
          </Button>

          <Button
            variant="contained"
            style={{
              backgroundColor: "white",
              color: "black"
            }}
            onClick={() => {
              window.location.href =
                `${server}/auth/google?role=admin`;
            }}
          >
            <img
              src="/images/googleLogo.png"
              alt="google"
              id="googleLogo"
            />
            &nbsp;
            Continue with Google
          </Button>

        </div>

      </div>

      {/* ERROR POPUP */}

      <Snackbar
        open={openError}
        autoHideDuration={4000}
        onClose={() => setOpenError(false)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
      >
        <Alert
          onClose={() => setOpenError(false)}
          severity="error"
          variant="filled"
          sx={{
            width: "100%"
          }}
        >
          {error}
        </Alert>
      </Snackbar>

    </>
  );
}