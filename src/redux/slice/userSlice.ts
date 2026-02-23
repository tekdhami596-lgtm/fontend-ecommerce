import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

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

// ── Logout thunk ──────────────────────────────────────────────────────────────
export const logoutUser = createAsyncThunk("user/logout", async () => {
  await api.post("/auth/logout");
});

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
    builder.addCase(logoutUser.rejected, (state) => {
      state.data = null; // clear state even if API fails
    });
  },
});

export const { login, updateProfile } = userSlice.actions;
export default userSlice.reducer;

// ── Selectors ────────────────────────────────────────────────────────────────
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
