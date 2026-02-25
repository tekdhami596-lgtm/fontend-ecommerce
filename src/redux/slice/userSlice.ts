import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { loadUserCart, resetCart } from "./cartSlice";

export type UserRole = "buyer" | "seller" | "admin";
export type Gender = "male" | "female" | "other";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  deliveryAddress?: string;
  storeName?: string;
  businessAddress?: string;
}

interface UserState {
  data: User | null;
}

const initialState: UserState = { data: null };

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { dispatch }) => {
    await api.post("/auth/logout");
    dispatch(resetCart());
  },
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.data = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.data) state.data = { ...state.data, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.data = null;
    });
    builder.addCase(logoutUser.rejected, (state, action) => {
      state.data = null;
    });
  },
});

export const { login, updateProfile } = userSlice.actions;

export const loginUser =
  (user: User) => (dispatch: (action: unknown) => void) => {
    dispatch(userSlice.actions.login(user));
    dispatch(loadUserCart(user.id));
  };

export default userSlice.reducer;

export const selectUser = (state: { user: UserState }) => state.user.data;
export const selectRole = (state: { user: UserState }) => state.user.data?.role;
export const selectIsLoggedIn = (state: { user: UserState }) =>
  !!state.user.data;
export const selectIsSeller = (state: { user: UserState }) =>
  state.user.data?.role === "seller";
export const selectIsBuyer = (state: { user: UserState }) =>
  state.user.data?.role === "buyer";
export const selectIsAdmin = (state: { user: UserState }) =>
  state.user.data?.role === "admin";
