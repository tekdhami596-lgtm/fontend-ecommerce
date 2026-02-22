import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
  dateOfBirth?: string; // "YYYY-MM-DD" from backend DATEONLY
  deliveryAddress?: string;
  storeName?: string;
  businessAddress?: string;
}

interface UserState {
  data: User | null;
}

const initialState: UserState = { data: null };

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.data = action.payload;
    },
    logout: (state) => {
      state.data = null;
      localStorage.removeItem("token");
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.data) state.data = { ...state.data, ...action.payload };
    },
  },
});

export const { login, logout, updateProfile } = userSlice.actions;
export default userSlice.reducer;

// ── Selectors ──────────────────────────────────────────────
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
