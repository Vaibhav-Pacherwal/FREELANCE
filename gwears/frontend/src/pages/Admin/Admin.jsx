import { useState } from "react";
import "../../Admin.css";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import server from "../../Environment.js";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext.jsx";

export default function Admin() {
    const [showAcc, setShowAcc] = useState(false);

    const { user, products, offers, activeProds } = useAuth();

    const navigate = useNavigate();

    console.log(user);
    console.log(products);
    console.log(offers);
    console.log(activeProds);

    const showAccountDetails = () => {
        setShowAcc(!showAcc)
    }

    return (
        <>
          <div className="horizontalNavbar">
            <h2 onClick={() => navigate("/")}>Gwears</h2>
            <div className="options">
                <img 
                  src={"/public/images/profile.png"}
                  alt="admin_img" 
                  onClick={showAccountDetails}
                />
            </div>
          </div>
          <div className="admin-layout">

            <aside className="sidebar">
              <NavLink to="/admin">Dashboard</NavLink>
              <NavLink to="/admin/products">Products</NavLink>
              <NavLink to="/admin/categories">Categories</NavLink>
              <NavLink to="/admin/offers">Offers</NavLink>
              <NavLink to="/admin/settings">Settings</NavLink>
            </aside>

            <main className="main-content">
              <Outlet />
            </main>

          </div>

          {
            showAcc && <div className="accDetails">
              <div className="closeAccDetails" onClick={() => setShowAcc(false)}>
                <i class="fa-solid fa-xmark"></i>
              </div>
              <div>Name: {user.name}</div>
              <div>Email: {user.email}</div>
              <div>
                Profile: {user.avatar}
                <button>Edit</button>
              </div>

              <Button 
                variant="contained" 
                onClick={async () => {
                  await fetch(`${server}/logout`, {
                    method: "POST",
                    credentials: "include"
                  });

                  navigate("/auth");
                }}
              >
                LOG OUT
              </Button>
            </div>
          }
        </>
    )
}