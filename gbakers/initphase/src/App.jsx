import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AnnouncementBar from './components/layout/AnnouncementBar';
import CartDrawer from './components/cart/CartDrawer';
import HomePage from './pages/HomePage';
import CataloguePage from './pages/CataloguePage';
import CheckoutPage from './pages/CheckoutPage';
import './App.css';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="app">
          <AnnouncementBar />
          <Header />
          <main className="main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<CataloguePage />} />
              <Route path="/shop/:category" element={<CataloguePage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Routes>
          </main>
          <Footer />
          <CartDrawer />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
