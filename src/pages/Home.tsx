import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { fetchCategoryTree, CategoryTree } from "../redux/slice/categorySlice";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { IoCartOutline } from "react-icons/io5";
import { addToCart as addToCartRedux } from "../redux/slice/cartSlice";
import api from "../api/axios";
import cartApi from "../api/cart.api";
import {
  ArrowUpDown,
  ChevronDown,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import notify from "../helpers/notify";
import getImageUrl from "../helpers/imageUrl";
import BannerCarousel from "../components/BannerCarousel";
import ProductGridSkeleton from "../components/ProductGridSkeleton";

type ProductImageType = { path: string };
type Product = {
  id: number;
  title: string;
  price: number;
  stock: number;
  shortDescription: string;
  images: ProductImageType[];
  categories: { id: number; title: string }[];
};

type SortOption =
  | "default"
  | "priceAsc"
  | "priceDesc"
  | "titleAsc"
  | "titleDesc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "priceAsc", label: "Price: Low → High" },
  { value: "priceDesc", label: "Price: High → Low" },
  { value: "titleAsc", label: "Name: A → Z" },
  { value: "titleDesc", label: "Name: Z → A" },
];

const PAGE_LIMIT = 10;

function flattenTree(
  nodes: CategoryTree[] = [],
): { id: number; title: string; parentId?: number }[] {
  const result: { id: number; title: string; parentId?: number }[] = [];
  const traverse = (items: CategoryTree[], parentId?: number) => {
    if (!items || !Array.isArray(items)) return;
    items.forEach((item) => {
      result.push({ id: item.id, title: item.title, parentId });
      if (item.childrens?.length) traverse(item.childrens, item.id);
    });
  };
  traverse(nodes);
  return result;
}

function getAllDescendantIds(
  categoryId: number,
  allCategories: { id: number; parentId?: number }[] = [],
): number[] {
  const ids: number[] = [categoryId];
  const findChildren = (parentId: number) => {
    allCategories
      .filter((c) => c.parentId === parentId)
      .forEach((child) => {
        ids.push(child.id);
        findChildren(child.id);
      });
  };
  findChildren(categoryId);
  return ids;
}

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSelector((state: RootState) => state.user.data);

  const isSeller = user?.role === "seller";
  const { tree: categoryTree = [] } = useSelector(
    (state: RootState) => state.categories,
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortOpen, setSortOpen] = useState(false);
  const [activeSort, setActiveSort] = useState<SortOption>("default");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(
    searchParams.get("categoryId")
      ? Number(searchParams.get("categoryId"))
      : null,
  );

  const flatCategories = useMemo(
    () => flattenTree(categoryTree),
    [categoryTree],
  );
  const topLevelCategories = useMemo(() => categoryTree ?? [], [categoryTree]);

  const hasMore = products.length < totalCount;

  useEffect(() => {
    if (!categoryTree || categoryTree.length === 0) {
      dispatch(fetchCategoryTree());
    }
  }, []);

  useEffect(() => {
    const id = searchParams.get("categoryId");
    setActiveCategoryId(id ? Number(id) : null);
  }, [searchParams]);

  useEffect(() => {
    if (activeCategoryId && flatCategories.length === 0) return;
    setProducts([]);
    setPage(1);
    setTotalCount(0);
    doFetch(1, true);
  }, [activeCategoryId, activeSort, flatCategories.length]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("#home-sort-dropdown"))
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
      if (activeSort !== "default") params.set("sort", activeSort);
      if (activeCategoryId) {
        const allIds = getAllDescendantIds(activeCategoryId, flatCategories);
        allIds.forEach((id) => params.append("categoryId", String(id)));
      }
      return params;
    },
    [activeCategoryId, activeSort, flatCategories],
  );

  const doFetch = useCallback(
    async (pageNum: number, reset: boolean) => {
      try {
        reset ? setLoading(true) : setLoadingMore(true);
        const params = buildParams(pageNum);
        const res = await api.get(`/products?${params.toString()}`);
        const incoming: Product[] = res.data.data || [];
        const total: number =
          res.data.total ?? res.data.count ?? incoming.length;
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

  const handleCategorySelect = (id: number | null) => {
    setActiveCategoryId(id);
    if (id) setSearchParams({ categoryId: String(id) });
    else setSearchParams({});
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

  const activeCategoryName = flatCategories.find(
    (c) => c.id === activeCategoryId,
  )?.title;
  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === activeSort)?.label ?? "Sort";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-3 pt-6 sm:px-6">
        <BannerCarousel />
      </div>

      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto py-3">
            <button
              onClick={() => handleCategorySelect(null)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategoryId === null
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {topLevelCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategoryId === cat.id
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {activeCategoryName ? activeCategoryName : "All Products"}
            </h2>
            {!loading && (
              <p className="text-sm text-gray-500">{totalCount} items</p>
            )}
          </div>

          <div className="relative" id="home-sort-dropdown">
            <button
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <ArrowUpDown size={15} />
              {activeSortLabel}
              <ChevronDown
                size={14}
                className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}
              />
            </button>
            {sortOpen && (
              <div className="absolute right-0 z-30 mt-1 w-48 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSortChange(opt.value)}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                      activeSort === opt.value
                        ? "font-semibold text-gray-900"
                        : "text-gray-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 pb-10 sm:px-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <ProductGridSkeleton />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <SlidersHorizontal size={40} className="mb-3 opacity-40" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <Link to={`/products/${product.id}`} className="block">
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      {product.images?.[0]?.path ? (
                        <img
                          src={getImageUrl(product.images[0].path)}
                          alt={product.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <span className="text-4xl">🛍️</span>
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col p-3">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="line-clamp-2 text-sm font-medium text-gray-800 hover:text-gray-600">
                        {product.title}
                      </h3>
                    </Link>
                    {product.shortDescription && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">
                        {product.shortDescription}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="text-sm font-bold text-gray-900">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="flex cursor-pointer items-center gap-1 rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <IoCartOutline size={14} />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
