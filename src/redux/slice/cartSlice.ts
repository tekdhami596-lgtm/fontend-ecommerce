import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  title: string;
  stock: number;
  price: number;
  image: string;
}

interface CartState {
  items: CartItem[];
}

// ── Storage helpers (keyed per user) ─────────────────────────────────────────

export function getCartKey(userId?: number | string) {
  return userId ? `dokomart_cart_${userId}` : "dokomart_cart_guest";
}

export function loadCart(userId?: number | string): CartItem[] {
  try {
    const raw = localStorage.getItem(getCartKey(userId));
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[], userId?: number | string) {
  try {
    localStorage.setItem(getCartKey(userId), JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function clearCartStorage(userId?: number | string) {
  try {
    localStorage.removeItem(getCartKey(userId));
  } catch {
    // ignore
  }
}

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState: CartState = { items: loadCart() }; // guest cart on init

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /** Call this after login to hydrate the logged-in user's cart */
    loadUserCart: (state, action: PayloadAction<number | string>) => {
      state.items = loadCart(action.payload);
    },

    /** Call this on logout to wipe the in-memory cart (storage is kept per-user) */
    resetCart: (state) => {
      state.items = [];
    },

    setCart: (
      state,
      action: PayloadAction<{ items: CartItem[]; userId?: number | string }>,
    ) => {
      state.items = action.payload.items;
      saveCart(state.items, action.payload.userId);
    },

    addToCart: (
      state,
      action: PayloadAction<{ item: CartItem; userId?: number | string }>,
    ) => {
      const existing = state.items.find(
        (i) => i.productId === action.payload.item.productId,
      );
      if (existing) {
        existing.quantity += action.payload.item.quantity;
      } else {
        state.items.push(action.payload.item);
      }
      saveCart(state.items, action.payload.userId);
    },

    updateCart: (
      state,
      action: PayloadAction<{
        id: number;
        quantity: number;
        userId?: number | string;
      }>,
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) item.quantity = action.payload.quantity;
      saveCart(state.items, action.payload.userId);
    },

    removeFromCart: (
      state,
      action: PayloadAction<{ id: number; userId?: number | string }>,
    ) => {
      state.items = state.items.filter((i) => i.id !== action.payload.id);
      saveCart(state.items, action.payload.userId);
    },

    clearCart: (
      state,
      action: PayloadAction<{ userId?: number | string } | undefined>,
    ) => {
      state.items = [];
      clearCartStorage(action?.payload?.userId);
    },
  },
});

export const {
  loadUserCart,
  resetCart,
  setCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
