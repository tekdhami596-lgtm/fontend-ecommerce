import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slice/userSlice";
import cartReducer from "./slice/cartSlice";
import categoryReducer from "./slice/categorySlice";
import adminReducer from "./slice/adminSlice ";
import productReducer from "./slice/Productslice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    categories: categoryReducer,
    admin: adminReducer,
    products: productReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
