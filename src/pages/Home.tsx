import { useEffect, useState, useCallback } from "react";
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
  nodes: CategoryTree[],
): { id: number; title: string; parentId?: number }[] {
  const result: { id: number; title: string; parentId?: number }[] = [];
  const traverse = (items: CategoryTree[], parentId?: number) => {
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
  allCategories: { id: number; parentId?: number }[],
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
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const isSeller = user?.role === "seller";
  const { tree: categoryTree } = useSelector(
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

  const flatCategories = flattenTree(categoryTree);
  const topLevelCategories = categoryTree;
  const hasMore = products.length < totalCount;

  useEffect(() => {
    if (categoryTree.length === 0) dispatch(fetchCategoryTree());
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
  }, [activeCategoryId, activeSort, categoryTree]);

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

  const doFetch = async (pageNum: number, reset: boolean) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true);
      const params = buildParams(pageNum);
      const res = await api.get(`/products?${params.toString()}`);
      const incoming: Product[] = res.data.data || [];
      const total: number = res.data.count ?? res.data.total ?? incoming.length;
      setTotalCount(total);
      setProducts((prev) => (reset ? incoming : [...prev, ...incoming]));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

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
      {/* Hero Banner */}
      <div className="mx-auto max-w-7xl px-3 pt-6 sm:px-6">
        <BannerCarousel />
      </div>

      <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => handleCategorySelect(null)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeCategoryId === null
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              All
            </button>
            {topLevelCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeCategoryId === cat.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {!loading && totalCount > 0 && (
                <>
                  <span className="font-semibold text-gray-600">
                    {products.length}
                  </span>
                  {" of "}
                  <span className="font-semibold text-gray-600">
                    {totalCount}
                  </span>
                  {" product"}
                  {totalCount !== 1 ? "s" : ""}
                </>
              )}
            </p>

            <div id="home-sort-dropdown" className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${
                  activeSort !== "default"
                    ? "border-indigo-400 bg-indigo-600 text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                <ArrowUpDown size={14} />
                <span>
                  {activeSort !== "default" ? activeSortLabel : "Sort by"}
                </span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}
                />
              </button>

              {sortOpen && (
                <div className="absolute top-11 right-0 z-30 w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5">
                  <div className="flex items-center gap-1.5 border-b border-gray-50 px-3 py-2.5">
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
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-all ${
                          activeSort === opt.value
                            ? "bg-indigo-50 font-semibold text-indigo-600"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                        {activeSort === opt.value && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] text-white">
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

          {activeCategoryId &&
            (() => {
              const activeParent = topLevelCategories.find(
                (c) => c.id === activeCategoryId,
              );
              const children = activeParent?.childrens ?? [];
              if (children.length === 0) return null;
              return (
                <div className="mt-3 flex flex-wrap gap-2">
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => handleCategorySelect(child.id)}
                      className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
                    >
                      {child.title}
                    </button>
                  ))}
                </div>
              );
            })()}

          {(activeCategoryId || activeSort !== "default") && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400">Active filters:</span>
              {activeCategoryId && (
                <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  {activeCategoryName}
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className="text-indigo-400 transition-colors hover:text-red-500"
                  >
                    ✕
                  </button>
                </span>
              )}
              {activeSort !== "default" && (
                <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
                  {activeSortLabel}
                  <button
                    onClick={() => handleSortChange("default")}
                    className="text-violet-400 transition-colors hover:text-red-500"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm sm:py-20">
            <p className="mb-4 text-4xl">🛍️</p>
            <p className="text-lg font-semibold text-gray-500 sm:text-xl">
              No products found
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Try a different category
            </p>
            {activeCategoryId && (
              <button
                onClick={() => handleCategorySelect(null)}
                className="mt-5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                View all products
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Link
                    to={`/products/${product.id}`}
                    className="block shrink-0"
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-gray-100 sm:h-44">
                      {product.images?.length > 0 ? (
                        <img
                          src={getImageUrl(product.images[0].path)}
                          alt={product.title}
                          className="object-fit h-full w-full transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-1 bg-gray-50">
                          <span className="text-2xl">📦</span>
                          <span className="text-xs text-gray-300">
                            No image
                          </span>
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-700">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3">
                    <div className="space-y-1">
                      {product.categories?.length > 0 && (
                        <button
                          onClick={() =>
                            handleCategorySelect(product.categories[0].id)
                          }
                          className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-500 hover:bg-indigo-100"
                        >
                          {product.categories[0].title}
                        </button>
                      )}
                      <Link to={`/products/${product.id}`}>
                        <h3 className="line-clamp-2 text-xs leading-snug font-semibold text-gray-800 hover:text-indigo-600 sm:text-sm">
                          {product.title}
                        </h3>
                      </Link>
                    </div>

                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-indigo-600 sm:text-base">
                          ${product.price}
                        </span>
                        {product.stock > 0 && product.stock <= 5 && (
                          <span className="text-xs font-medium text-orange-500">
                            Only {product.stock} left
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        disabled={product.stock === 0}
                        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 sm:py-2 sm:text-sm"
                      >
                        <IoCartOutline size={15} />
                        <span>
                          {" "}
                          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Load More ── */}
            {hasMore ? (
              <div className="mt-10 flex flex-col items-center gap-2">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex min-w-[180px] items-center justify-center gap-2 rounded-2xl border-2 border-indigo-600 bg-white px-8 py-3 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-600 hover:text-white disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Loading…
                    </>
                  ) : (
                    "Load More"
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
          </>
        )}
      </div>
    </div>
  );
}
