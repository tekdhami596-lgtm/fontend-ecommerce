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


function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem("dokomart_cart");
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem("dokomart_cart", JSON.stringify(items));
  } catch {
   
  }
}


const initialState: CartState = { items: loadCart() };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      saveCart(state.items);
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
      saveCart(state.items);
    },

    updateCart: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>,
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) item.quantity = action.payload.quantity;
      saveCart(state.items);
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      saveCart(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      saveCart(state.items);
    },
  },
});

export const { setCart, addToCart, updateCart, removeFromCart, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
