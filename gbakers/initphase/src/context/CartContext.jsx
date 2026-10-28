import { useReducer, useCallback, useEffect } from 'react';
import { CartContext } from './cartContextValue';

// ── Maximum quantity per line-item (mirrors backend MAX_QUANTITY_PER_ITEM) ──
const MAX_QUANTITY_PER_ITEM = 50;

// ── localStorage helpers ────────────────────────────────────────────────────
const STORAGE_KEY = 'gbakers_cart_items';

const isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Validate: must be an array of objects that each have the required shape
    if (
      !Array.isArray(parsed) ||
      !parsed.every(
        (i) =>
          i &&
          typeof i === 'object' &&
          typeof i.key === 'string' &&
          typeof i.quantity === 'number' &&
          i.product &&
          i.variant
      )
    ) {
      return [];
    }
    // Filter out any stale items that used old non-ObjectId mock product IDs
    return parsed.filter((i) => {
      const prodId = i.product?._id || i.product?.id;
      return isValidObjectId(prodId);
    });
  } catch {
    return [];
  }
}

function saveToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Quota exceeded or private-browsing restriction — fail silently
  }
}

// ── Initial state (hydrated from localStorage) ───────────────────────────────
const initialState = {
  items: loadFromStorage(),
  isOpen: false,
};

// ── Reducer ──────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, variant, quantity = 1 } = action.payload;
      const prodId = String(product._id || product.id);
      const normalizedProduct = {
        ...product,
        id: prodId,
        _id: prodId,
      };
      const itemKey = `${prodId}-${variant.label}`;
      const existing = state.items.find((i) => i.key === itemKey);

      if (existing) {
        const newQty = Math.min(
          existing.quantity + quantity,
          MAX_QUANTITY_PER_ITEM
        );
        return {
          ...state,
          isOpen: true,
          items: state.items.map((i) =>
            i.key === itemKey ? { ...i, quantity: newQty } : i
          ),
        };
      }

      return {
        ...state,
        isOpen: true,
        items: [
          ...state.items,
          {
            key: itemKey,
            product: normalizedProduct,
            variant,
            quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM),
          },
        ],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.key !== action.payload),
      };

    case 'UPDATE_QUANTITY': {
      const { key, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.key !== key),
        };
      }
      const capped = Math.min(quantity, MAX_QUANTITY_PER_ITEM);
      return {
        ...state,
        items: state.items.map((i) =>
          i.key === key ? { ...i, quantity: capped } : i
        ),
      };
    }

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    case 'OPEN_CART':
      return { ...state, isOpen: true };

    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Persist items to localStorage whenever they change
  useEffect(() => {
    saveToStorage(state.items);
  }, [state.items]);

  const addItem = useCallback((product, variant, quantity) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, variant, quantity } });
  }, []);

  const removeItem = useCallback((key) => {
    dispatch({ type: 'REMOVE_ITEM', payload: key });
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { key, quantity } });
  }, []);

  const toggleCart = useCallback(() => {
    dispatch({ type: 'TOGGLE_CART' });
  }, []);

  const openCart = useCallback(() => {
    dispatch({ type: 'OPEN_CART' });
  }, []);

  const closeCart = useCallback(() => {
    dispatch({ type: 'CLOSE_CART' });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        toggleCart,
        openCart,
        closeCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
