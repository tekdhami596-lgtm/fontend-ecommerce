import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: any[];
  pendingSellers: any[];
}

interface AdminState {
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  loading: false,
  error: null,
};

export const fetchAdminStats = createAsyncThunk(
  "admin/fetchStats",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8001/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data as AdminStats;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch stats",
      );
    }
  },
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAdminStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminStats.fulfilled, (state, action) => {
      state.loading = false;
      state.stats = action.payload;
    });
    builder.addCase(fetchAdminStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default adminSlice.reducer;
