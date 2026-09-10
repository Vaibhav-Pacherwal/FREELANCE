import './App.css'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import Admin from './pages/Admin/Admin.jsx'
import server from './Environment.js'
import { useState } from 'react'
import ProtectedRoute from './utils/RouteProtector.jsx'
import { Routes, Route, useNavigate } from "react-router-dom"
import Dashboard from './pages/Admin/Dashboard.jsx'
import AdminProducts from './pages/Admin/Products.jsx'
import AdminOffers from './pages/Admin/Offers.jsx'
import Categories from './pages/Admin/Categories.jsx'
import Settings from './pages/Admin/Settings.jsx'
import AddProduct from './pages/Admin/AddProduct.jsx'
import EditProduct from './pages/Admin/EditProduct.jsx'
import AddCategory from './pages/Admin/AddCategory.jsx'
import EditCategory from './pages/Admin/EditCategory.jsx'
import AddOffer from './pages/Admin/AddOffer.jsx'
import EditOffer from './pages/Admin/EditOffer.jsx'
import CustomerAuth from './pages/CustomerAuth.jsx'
import CustomerProtectedRoute from './utils/CustomerProtectedRoute.jsx'
import Account from './pages/Account.jsx'
import Cart from './pages/Cart.jsx'
import Products from './pages/Products.jsx'
import ProductDetails from './pages/ProductDetails.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Offers from './pages/Offers.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderDetails from './pages/OrderDetails.jsx'

export default function App() {

  const router = useNavigate();

  const onLogin = async ({ email, password }) => {

    try {

      const res = await fetch(`${server}/auth/admin/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json();

      console.log(data);

      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Login failed"
        };
      }

      if (data.user.role !== "admin") {
        return {
          success: false,
          message: "This account is not an admin account."
        };
      }

      router("/admin");

      return {
        success: true
      };

    } catch (error) {

      console.error(error);

      return {
        success: false,
        message: "Unable to connect to server."
      };
    }
  };

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/auth' element={<Auth login={onLogin} />}></Route>
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<Categories />} />
          <Route path="offers" element={<AdminOffers />} />
          <Route path="settings" element={<Settings />} />
          <Route path="products/new" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="categories/new" element={<AddCategory />} />
          <Route path="categories/edit/:id" element={<EditCategory />} />
          <Route path="offers/new" element={<AddOffer />} />
          <Route path="offers/edit/:id" element={<EditOffer />} />
        </Route>
        <Route path="*" element={<h1>404 Not Found</h1>} />
        <Route path="/login" element={<CustomerAuth />} />
        <Route
          path="/account"
          element={
            <CustomerProtectedRoute>
              <Account />
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <CustomerProtectedRoute>
              <Wishlist />
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <CustomerProtectedRoute>
              <Cart />
            </CustomerProtectedRoute>
          }
        />
        <Route path="/products" element={<Products />} />
        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />
        <Route path="/offers" element={<Offers />} />
        <Route
          path="/checkout"
          element={<Checkout />}
        />
        <Route path="/orders/:id" element={<OrderDetails />} />
      </Routes>
    </>
  )
}