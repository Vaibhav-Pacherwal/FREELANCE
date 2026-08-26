import './App.css'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import Admin from './pages/Admin.jsx'
import server from './Environment.js'
import { Routes, Route, useNavigate } from "react-router-dom"

export default function App() {

  const router = useNavigate();

  const onLogin = async ({ email, password }) => {
    const res = await fetch(`${server}/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    console.log(data);

    if (res.ok) {
      router("/admin");   
    }
  } 

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/auth' element={<Auth login={onLogin}/>}></Route>
        <Route path='/admin' element={<Admin />}></Route>
      </Routes>
    </>
  )
}