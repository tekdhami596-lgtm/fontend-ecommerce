import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

export type ProductImage = { path: string };
export type ProductCategory = { id: number; title: string };
export type ProductSeller = {
  id: number;
  firstName: string;
  lastName: string;
  storeName?: string;
};

export type Product = {
  id: number;
  title: string;
  price: number;
  stock: number;
  shortDescription: string;
  description?: string;
  images: ProductImage[];
  categories: ProductCategory[];
  seller?: ProductSeller;
};

interface ProductState {
  items: Product[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
};

// ── Thunks ────────────────────────────────────────────────────

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (params?: Record<string, any>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (Array.isArray(val))
          val.forEach((v) => query.append(key, String(v)));
        else if (val !== undefined && val !== null) query.set(key, String(val));
      });
    }
    const res = await api.get(`/products?${query.toString()}`);
    return {
      items: (res.data.data || []) as Product[],
      total: res.data.total ?? res.data.count ?? 0,
    };
  },
);

export const fetchAdminProducts = createAsyncThunk(
  "products/fetchAdmin",
  async (search?: string) => {
    const res = await api.get("/admin/products", {
      params: search ? { search } : {},
    });
    return (res.data.data || []) as Product[];
  },
);

// ── Slice ─────────────────────────────────────────────────────

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // Remove a product from state (after delete)
    removeProduct(state, action: PayloadAction<number>) {
      state.items = state.items.filter((p) => p.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    },
    // Remove all products belonging to a seller (after seller delete)
    removeProductsBySeller(state, action: PayloadAction<number>) {
      const before = state.items.length;
      state.items = state.items.filter((p) => p.seller?.id !== action.payload);
      state.total = Math.max(0, state.total - (before - state.items.length));
    },
    // Append more products (load more)
    appendProducts(state, action: PayloadAction<Product[]>) {
      state.items = [...state.items, ...action.payload];
    },
    clearProducts(state) {
      state.items = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch products";
      })
      // fetchAdminProducts
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.total = action.payload.length;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch products";
      });
  },
});

export const {
  removeProduct,
  removeProductsBySeller,
  appendProducts,
  clearProducts,
} = productSlice.actions;

export default productSlice.reducer;
