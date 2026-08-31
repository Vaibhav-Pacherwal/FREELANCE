import "../Navbar.css"
import { useNavigate } from "react-router-dom"

export default function Navbar() {
    const navigate = useNavigate();

    return (
        <>
          <div className="nav">
            <div className="brand">
                <h2 onClick={() => navigate("/")}>GWears</h2>
            </div>
            <div className="navOptions">
                <i class="fa-solid fa-magnifying-glass"></i>
                <i class="fa-regular fa-heart"></i>
                <i class="fa-regular fa-user" title="Admin profile" onClick={() => navigate("/auth")}></i>
                {/* <div className="menu">
                    <i class="fa-solid fa-bars"></i> 
                    <p>MENU</p>
                </div> */}
            </div>
          </div>
        </>
    )
}