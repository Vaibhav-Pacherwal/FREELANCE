import { createContext } from 'react';

/**
 * Cart context — shared between CartProvider and useCart.
 * Kept in its own file to satisfy react-refresh/only-export-components.
 */
export const CartContext = createContext(null);
