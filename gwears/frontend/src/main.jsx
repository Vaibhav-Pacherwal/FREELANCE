import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import { UserAuthProvider } from './utils/UserAuthContext.jsx';
import { CartProvider } from './utils/CartContext.jsx';
import { WishlistProvider } from './utils/WishlistContext.jsx';
import { SnackbarProvider } from './utils/SnackbarContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserAuthProvider>
        <SnackbarProvider>
          <CartProvider>
            <WishlistProvider>
              <App />
            </WishlistProvider>
          </CartProvider>
        </SnackbarProvider>
      </UserAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
