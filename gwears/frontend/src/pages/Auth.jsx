import { useState } from "react";
import "../Auth.css"
import Navbar from "./Navbar.jsx"
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export default function Auth({ login }) {
    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");

    const handleSignIn = async () => {
        const data = { email, password };
        await login(data);
    }

    return (
        <>
          <Navbar />
          <div className="auth-form">
            <div className="signin">
                <h2>ADMIN LOGIN</h2>
                <TextField 
                  id="standard-basic" 
                  label="Email"
                  variant="standard" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                      "& .MuiInputLabel-root": {
                        color: "black",
                       },
                      "& .MuiInput-underline:before": {
                        borderBottomColor: "black",
                       },
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: "black",
                       },
                      "& .MuiInput-underline:after": {
                        borderBottomColor: "black",
                       },
                  }}
                />
                <TextField 
                  id="standard-basic" 
                  label="Password"
                  variant="standard" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{
                      "& .MuiInputLabel-root": {
                        color: "black",
                       },
                      "& .MuiInput-underline:before": {
                        borderBottomColor: "black",
                       },
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: "black",
                       },
                      "& .MuiInput-underline:after": {
                        borderBottomColor: "black",
                       },
                  }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleSignIn}
                  style={{backgroundColor:"black"}}
                >
                    SIGN IN
                </Button>

                <Button
                  variant="contained" 
                  style={{backgroundColor:"white", color:"black"}}
                  onClick={() => {
                    window.location.href =
                      "http://localhost:8080/auth/google";
                  }}
                >
                  <img src="/public/images/googleLogo.png" alt="google" id="googleLogo"/>&nbsp;
                  Continue with Google
                </Button>
            </div>
          </div>
        </>
    )
}