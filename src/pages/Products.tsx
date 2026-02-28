import { useEffect, useState, useCallback } from "react";
import NoImageFound from "../assets/NoImage.png";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart as addToCartRedux } from "../redux/slice/cartSlice";
import { RootState } from "../redux/store";
import cartApi from "../api/cart.api";
import notify from "../helpers/notify";
import api from "../api/axios";
import getImageUrl from "../helpers/imageUrl";
import {
  ArrowUpDown,
  ChevronDown,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";

type ProductImage = { path: string };
type Product = {
  id: number;
  title: string;
  shortDescription: string;
  price: number;
  stock: number;
  images: ProductImage[];
};

type SortOption =
  | "default"
  | "priceAsc"
  | "priceDesc"
  | "titleAsc"
  | "titleDesc";

const SORT_OPTIONS: {
  value: SortOption;
  label: string;
  description: string;
}[] = [
  { value: "default", label: "Default", description: "As listed" },
  {
    value: "priceAsc",
    label: "Price: Low → High",
    description: "Cheapest first",
  },
  {
    value: "priceDesc",
    label: "Price: High → Low",
    description: "Most expensive first",
  },
  { value: "titleAsc", label: "Name: A → Z", description: "Alphabetical" },
  {
    value: "titleDesc",
    label: "Name: Z → A",
    description: "Reverse alphabetical",
  },
];

const PAGE_LIMIT = 10;

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="h-36 animate-pulse bg-gray-200 sm:h-44 md:h-48" />

      <div className="flex flex-1 flex-col gap-2 p-2.5 sm:p-4">
        <div className="h-4 w-3/4 animate-pulse rounded-md bg-gray-200" />

        <div className="hidden space-y-1.5 sm:block">
          <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="mt-auto flex items-center justify-between pt-1 sm:pt-2">
          <div className="h-5 w-16 animate-pulse rounded-md bg-gray-200" />
          <div className="h-4 w-14 animate-pulse rounded-md bg-gray-200" />
        </div>

        <div className="mt-1 flex flex-col gap-1.5 sm:gap-2">
          <div className="h-8 w-full animate-pulse rounded-lg bg-gray-200 sm:h-9" />
          <div className="h-8 w-full animate-pulse rounded-lg bg-gray-100 sm:h-9" />
        </div>
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
      <div className="mb-5 flex items-center justify-between">
        <div className="h-5 w-32 animate-pulse rounded-md bg-gray-200" />
        <div className="h-9 w-24 animate-pulse rounded-xl bg-gray-200" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
        {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeSort, setActiveSort] = useState<SortOption>("default");
  const [sortOpen, setSortOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const user = useSelector((state: RootState) => state.user.data);
  const isSeller = user?.role === "seller";

  const hasMore = products.length < totalCount;
  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === activeSort)?.label ?? "Sort";
  const searchQuery = searchParams.get("search");
  const categoryQuery = searchParams.get("categoryId");

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setTotalCount(0);
    doFetch(1, true);
  }, [searchParams, activeSort]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("#products-sort-dropdown"))
        setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const buildParams = useCallback(
    (pageNum: number): URLSearchParams => {
      const params = new URLSearchParams();
      params.set("page", String(pageNum));
      params.set("limit", String(PAGE_LIMIT));
      const categoryId = searchParams.get("categoryId");
      const search = searchParams.get("search");
      if (categoryId) params.set("categoryId", categoryId);
      if (search) params.set("q", search);
      if (activeSort !== "default") params.set("sort", activeSort);
      return params;
    },
    [searchParams, activeSort],
  );

  const doFetch = useCallback(
    async (pageNum: number, reset: boolean) => {
      try {
        reset ? setLoading(true) : setLoadingMore(true);
        const params = buildParams(pageNum);
        const res = await api.get(`/products?${params.toString()}`);
        const incoming: Product[] = res.data.data || [];
        const total: number =
          res.data.count ?? res.data.total ?? incoming.length;
        setTotalCount(total);
        setProducts((prev) => (reset ? incoming : [...prev, ...incoming]));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildParams],
  );

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    doFetch(next, false);
  };

  const handleSortChange = (sort: SortOption) => {
    setActiveSort(sort);
    setSortOpen(false);
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      notify.error("Please login first");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (isSeller) {
      notify.error("Sellers cannot add items to cart");
      return;
    }
    try {
      const res = await cartApi.create({ productId: product.id });
      const cartData = res.data.data;
      dispatch(
        addToCartRedux({
          id: cartData.id,
          productId: product.id,
          title: product.title,
          price: product.price,
          stock: product.stock,
          quantity: cartData.quantity ?? 1,
          image: product.images?.[0]?.path || "",
        }),
      );
      notify.success("Item added to cart successfully");
    } catch (err) {
      console.error("Failed to add to cart", err);
      notify.error("Failed to add to cart");
    }
  };

  if (loading) return <ProductGridSkeleton />;

  if (products.length === 0) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-3 rounded-xl bg-white py-16 text-center shadow-sm">
        <img src={NoImageFound} alt="No products" className="h-16 opacity-30" />
        <p className="text-lg font-medium text-gray-400">No products found</p>
        <p className="text-sm text-gray-400">
          Try a different category or search term
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-gray-700">
            <span className="font-bold text-indigo-600">{products.length}</span>
            <span className="text-gray-400"> / {totalCount}</span> product
            {totalCount !== 1 ? "s" : ""}
          </p>
          {searchQuery && (
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-0.5 text-xs font-medium text-indigo-600">
              🔍 "{searchQuery}"
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete("search");
                  navigate(`/products?${params.toString()}`);
                }}
                className="ml-1.5 text-indigo-400 hover:text-red-500"
              >
                ✕
              </button>
            </span>
          )}
          {categoryQuery && (
            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-0.5 text-xs font-medium text-violet-600">
              📂 Category filtered
            </span>
          )}
          {activeSort !== "default" && (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-medium text-emerald-600">
              <ArrowUpDown size={10} />
              {activeSortLabel}
              <button
                onClick={() => handleSortChange("default")}
                className="ml-0.5 cursor-pointer leading-none text-emerald-400 transition-colors hover:text-red-500"
              >
                ✕
              </button>
            </span>
          )}
        </div>

        <div id="products-sort-dropdown" className="relative">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium shadow-sm transition-all ${
              activeSort !== "default"
                ? "border-indigo-400 bg-indigo-600 text-white shadow-indigo-200"
                : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            <ArrowUpDown size={14} />
            <span className="hidden sm:inline">
              {activeSort !== "default" ? activeSortLabel : "Sort by"}
            </span>
            <span className="sm:hidden">Sort</span>
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}
            />
          </button>

          {sortOpen && (
            <div
              className="absolute top-11 right-0 z-30 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5"
              style={{ animation: "dropdown-in 0.16s ease forwards" }}
            >
              <style>{`
                @keyframes dropdown-in {
                  from { opacity: 0; transform: translateY(6px) scale(0.98); }
                  to   { opacity: 1; transform: translateY(0) scale(1); }
                }
              `}</style>
              <div className="flex items-center gap-1.5 border-b border-gray-50 px-3.5 py-2.5">
                <SlidersHorizontal size={11} className="text-gray-400" />
                <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                  Sort by
                </span>
              </div>
              <div className="p-1.5">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSortChange(opt.value)}
                    className={`flex w-full items-start justify-between rounded-xl px-3 py-2.5 text-left transition-all ${
                      activeSort === opt.value
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-sm ${activeSort === opt.value ? "font-semibold" : "font-medium"}`}
                      >
                        {opt.label}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {opt.description}
                      </p>
                    </div>
                    {activeSort === opt.value && (
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
          >
            <div
              className="relative h-36 cursor-pointer overflow-hidden bg-gray-100 sm:h-44 md:h-48"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              {product.images?.length > 0 ? (
                <img
                  src={getImageUrl(product.images[0].path)}
                  alt={product.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <img
                    src={NoImageFound}
                    alt="No image"
                    className="h-10 opacity-40 sm:h-12"
                  />
                </div>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:gap-2 sm:p-4">
              <h2
                className="cursor-pointer truncate text-sm font-semibold text-gray-800 hover:text-indigo-600 sm:text-base"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                {product.title}
              </h2>
              <p className="line-clamp-2 hidden text-sm text-gray-500 sm:block">
                {product.shortDescription}
              </p>

              <div className="mt-auto flex items-center justify-between pt-1 sm:pt-2">
                <span className="text-sm font-bold text-indigo-600 sm:text-lg">
                  ${product.price}
                </span>
                <span
                  className={`text-xs font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}
                >
                  {product.stock > 0 ? (
                    <>
                      <span className="sm:hidden">In Stock</span>
                      <span className="hidden sm:inline">
                        In Stock ({product.stock})
                      </span>
                    </>
                  ) : (
                    "Out of Stock"
                  )}
                </span>
              </div>

              <div className="mt-1 flex flex-col gap-1.5 sm:gap-2">
                {!isSeller && (
                  <button
                    disabled={product.stock === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="w-full cursor-pointer rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:py-2 sm:text-sm"
                  >
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                )}
                <button
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="w-full cursor-pointer rounded-lg border border-indigo-600 px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 sm:py-2 sm:text-sm"
                >
                  <span className="cursor-pointer sm:hidden">Details</span>
                  <span className="hidden cursor-pointer sm:inline">
                    View Product Details
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore ? (
        <div className="mt-10 flex flex-col items-center gap-2">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex min-w-45 items-center justify-center gap-2 rounded-2xl border-2 border-indigo-600 bg-white px-8 py-3 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-600 hover:text-white disabled:opacity-60"
          >
            {loadingMore ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Loading…
              </>
            ) : (
              `Load More`
            )}
          </button>
          <p className="text-xs text-gray-400">
            {products.length} of {totalCount} products shown
          </p>
        </div>
      ) : (
        products.length > PAGE_LIMIT && (
          <p className="mt-8 text-center text-xs text-gray-400">
            ✓ All {totalCount} products loaded
          </p>
        )
      )}
    </div>
  );
}

export default Products;
