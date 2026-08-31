import { useState } from "react";
import "../../Admin.css";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import server from "../../Environment.js";
import { Outlet, NavLink } from "react-router-dom";

export default function Admin({ data }) {
    const [showAcc, setShowAcc] = useState(false);

    const navigate = useNavigate();

    console.log(data);

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
              <div>Name: {data.name}</div>
              <div>Email: {data.email}</div>
              <div>
                Profile: {data.avatar}
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