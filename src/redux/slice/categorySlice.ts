import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

export interface CategoryTree {
  id: number;
  title: string;
  parentId: number | null;
  createdBy: number | null;
  createdByRole: "admin" | "seller" | null;
  childrens?: CategoryTree[];
}

export interface FlatCategory {
  id: number;
  title: string;
  parentId: number | null;
}

interface CategoryState {
  tree: CategoryTree[];
  flat: FlatCategory[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  tree: [],
  flat: [],
  loading: false,
  error: null,
};

// Fetch nested tree — used by Navbar dropdown
export const fetchCategoryTree = createAsyncThunk(
  "categories/fetchTree",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/categories");
      return res.data.data as CategoryTree[];
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch categories",
      );
    }
  },
);

// Fetch flat list — used by product create/edit forms
export const fetchCategoryFlat = createAsyncThunk(
  "categories/fetchFlat",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/categories/flat");
      return res.data.data as FlatCategory[];
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch categories",
      );
    }
  },
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    // Optimistic updates for manage pages
    addCategory: (state, action) => {
      state.flat.push(action.payload);
    },
    removeCategory: (state, action) => {
      state.flat = state.flat.filter((c) => c.id !== action.payload);
    },
    updateCategoryInStore: (state, action) => {
      const idx = state.flat.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) state.flat[idx] = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Tree
    builder.addCase(fetchCategoryTree.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCategoryTree.fulfilled, (state, action) => {
      state.loading = false;
      state.tree = action.payload;
    });
    builder.addCase(fetchCategoryTree.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Flat
    builder.addCase(fetchCategoryFlat.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCategoryFlat.fulfilled, (state, action) => {
      state.loading = false;
      state.flat = action.payload;
    });
    builder.addCase(fetchCategoryFlat.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { addCategory, removeCategory, updateCategoryInStore } =
  categorySlice.actions;
export default categorySlice.reducer;
