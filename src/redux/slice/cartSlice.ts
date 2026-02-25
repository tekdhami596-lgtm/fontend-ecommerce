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

// ── Per-user storage helpers ──────────────────────────────────────────────────

export function getCartKey(userId?: number | string) {
  return userId ? `dokomart_cart_${userId}` : `dokomart_cart_guest`;
}

export function loadCart(userId?: number | string): CartItem[] {
  try {
    const raw = localStorage.getItem(getCartKey(userId));
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[], userId?: number | string) {
  try {
    localStorage.setItem(getCartKey(userId), JSON.stringify(items));
  } catch {
    // ignore
  }
}

// ── Active session tracker ────────────────────────────────────────────────────
// Tracks current userId so all mutations save to the right key
// without needing userId passed in every single action.

let activeUserId: number | string | undefined = undefined;

export function setActiveUser(userId?: number | string) {
  activeUserId = userId;
}

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState: CartState = { items: loadCart() };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /** Called after login — loads the user's saved cart */
    loadUserCart: (state, action: PayloadAction<number | string>) => {
      setActiveUser(action.payload);
      state.items = loadCart(action.payload);
    },

    /** Called on logout — clears in-memory cart */
    resetCart: (state) => {
      setActiveUser(undefined);
      state.items = [];
    },

    // Original flat signatures preserved — no changes needed in pages ✅

    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      saveCart(state.items, activeUserId);
    },

    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId,
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      saveCart(state.items, activeUserId);
    },

    updateCart: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>,
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) item.quantity = action.payload.quantity;
      saveCart(state.items, activeUserId);
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      saveCart(state.items, activeUserId);
    },

    clearCart: (state) => {
      state.items = [];
      saveCart(state.items, activeUserId);
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
