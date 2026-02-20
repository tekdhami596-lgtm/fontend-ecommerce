import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slice/userSlice";
import themeReducer from "./slice/themeSlice";
import cartReducer from "./slice/cartSlice";
import categoryReducer from "./slice/categorySlice";
import adminReducer from "./slice/adminSlice "

export const store = configureStore({
  reducer: {
    user: userReducer,
    theme: themeReducer,
    cart: cartReducer,
    categories: categoryReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
