import './App.css'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import Admin from './pages/Admin/Admin.jsx'
import server from './Environment.js'
import { useState } from 'react'
import ProtectedRoute from './utils/RouteProtector.jsx'
import { Routes, Route, useNavigate } from "react-router-dom"
import Dashboard from './pages/Admin/Dashboard.jsx'
import Products from './pages/Admin/Products.jsx'
import Offers from './pages/Admin/Offers.jsx'
import Categories from './pages/Admin/Categories.jsx'
import Settings from './pages/Admin/Settings.jsx'
import AddProduct from './pages/Admin/AddProduct.jsx'

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
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="offers" element={<Offers />} />
          <Route path="settings" element={<Settings />} />
          <Route path="products/new" element={<AddProduct />} />
        </Route>
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </>
  )
}