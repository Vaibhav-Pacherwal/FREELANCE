import "../Home.css"
import Navbar from "./Navbar.jsx";
import { useNavigate } from "react-router-dom"

export default function Home() {
    const navigate = useNavigate();

    return (
        <>
          <Navbar />
        </>
    )
}