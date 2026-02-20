import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { fetchCategoryTree, CategoryTree } from "../redux/slice/categorySlice";
import { Link, useSearchParams } from "react-router-dom";
import { IoCartOutline } from "react-icons/io5";
import { addToCart } from "../redux/slice/cartSlice";
import api from "../api/axios";

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

function flattenTree(nodes: CategoryTree[]): { id: number; title: string }[] {
  const result: { id: number; title: string }[] = [];
  const traverse = (items: CategoryTree[]) => {
    items.forEach((item) => {
      result.push({ id: item.id, title: item.title });
      if (item.childrens?.length) traverse(item.childrens);
    });
  };
  traverse(nodes);
  return result;
}

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { tree: categoryTree } = useSelector(
    (state: RootState) => state.categories,
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(
    searchParams.get("categoryId")
      ? Number(searchParams.get("categoryId"))
      : null,
  );

  const flatCategories = flattenTree(categoryTree);

  // How many category pills to show on mobile before "Show more"
  const MOBILE_CAT_LIMIT = 6;
  const visibleCategories = showAllCategories
    ? flatCategories
    : flatCategories.slice(0, MOBILE_CAT_LIMIT);

  useEffect(() => {
    if (categoryTree.length === 0) {
      dispatch(fetchCategoryTree());
    }
  }, []);

  useEffect(() => {
    const id = searchParams.get("categoryId");
    setActiveCategoryId(id ? Number(id) : null);
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: any = {};
        if (activeCategoryId) params.categoryId = activeCategoryId;
        const res = await api.get("/products", { params });
        setProducts(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategoryId]);

  const handleCategorySelect = (id: number | null) => {
    setActiveCategoryId(id);
    if (id) {
      setSearchParams({ categoryId: String(id) });
    } else {
      setSearchParams({});
    }
  };

  const handleAddToCart = (product: Product) => {
    dispatch(
      addToCart({
        id: 0,
        productId: product.id,
        title: product.title,
        price: product.price,
        stock: product.stock,
        image: product.images?.[0]?.path || "",
        quantity: 1,
      }),
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-700 px-4 py-12 text-center text-white sm:px-6 sm:py-16 md:py-20">
        <h1 className="mb-3 text-3xl font-bold sm:mb-4 sm:text-4xl md:text-5xl">
          Welcome to DokoMart
        </h1>
        <p className="mx-auto max-w-xl text-base text-indigo-200 sm:text-lg">
          Discover products you'll love — curated by sellers, organized by
          categories.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-10">
        {/* ── Category Filter Pills ────────────────────────────── */}
        <div className="mb-6 sm:mb-8">
          <h2 className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase sm:text-sm">
            Browse by Category
          </h2>

          <div className="flex flex-wrap gap-2">
            {/* All pill */}
            <button
              onClick={() => handleCategorySelect(null)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:py-2 sm:text-sm ${
                activeCategoryId === null
                  ? "border-purple-600 bg-purple-600 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-purple-400 hover:text-purple-600"
              }`}
            >
              All
            </button>

            {visibleCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:py-2 sm:text-sm ${
                  activeCategoryId === cat.id
                    ? "border-purple-600 bg-purple-600 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-purple-400 hover:text-purple-600"
                }`}
              >
                {cat.title}
              </button>
            ))}

            {/* Show more/less toggle on mobile */}
            {flatCategories.length > MOBILE_CAT_LIMIT && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="rounded-full border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-400 transition hover:border-purple-400 hover:text-purple-500 sm:hidden"
              >
                {showAllCategories
                  ? "Show less"
                  : `+${flatCategories.length - MOBILE_CAT_LIMIT} more`}
              </button>
            )}
          </div>
        </div>

        {/* ── Active Filter Indicator ──────────────────────────── */}
        {activeCategoryId && (
          <div className="mb-4 flex items-center gap-2 sm:mb-6">
            <span className="text-xs text-gray-500 sm:text-sm">Showing:</span>
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600 sm:text-sm">
              {flatCategories.find((c) => c.id === activeCategoryId)?.title}
            </span>
            <button
              onClick={() => handleCategorySelect(null)}
              className="ml-1 text-xs text-gray-400 underline hover:text-red-500"
            >
              Clear
            </button>
          </div>
        )}

        {/* ── Products Grid ────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl bg-white py-16 text-center shadow-sm sm:py-20">
            <p className="text-lg text-gray-400 sm:text-xl">
              No products found.
            </p>
            {activeCategoryId && (
              <button
                onClick={() => handleCategorySelect(null)}
                className="mt-4 text-sm text-purple-600 underline"
              >
                View all products
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs text-gray-500 sm:text-sm">
              {products.length} product{products.length !== 1 ? "s" : ""} found
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Image */}
                  <Link to={`/products/${product.id}`}>
                    <div className="relative h-36 overflow-hidden bg-gray-100 sm:h-44 md:h-48">
                      {product.images?.length > 0 ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}/${product.images[0].path}`}
                          alt={product.title}
                          className="object-fit h-full w-full transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-300 sm:text-sm">
                          No Image
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="space-y-1.5 p-2.5 sm:space-y-2 sm:p-4">
                    {/* Category tags — hidden on very small screens */}
                    {product.categories?.length > 0 && (
                      <div className="hidden flex-wrap gap-1 sm:flex">
                        {product.categories.slice(0, 2).map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat.id)}
                            className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-500 hover:bg-purple-100"
                          >
                            {cat.title}
                          </button>
                        ))}
                      </div>
                    )}

                    <Link to={`/products/${product.id}`}>
                      <h3 className="truncate text-sm font-semibold text-gray-800 hover:text-purple-600 sm:text-base">
                        {product.title}
                      </h3>
                    </Link>

                    {/* Short description — hidden on mobile */}
                    <p className="line-clamp-2 hidden text-sm text-gray-500 sm:block">
                      {product.shortDescription}
                    </p>

                    <div className="flex items-center justify-between pt-0.5 sm:pt-1">
                      <span className="text-sm font-bold text-indigo-600 sm:text-lg">
                        ${product.price}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          product.stock > 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {product.stock > 0 ? "In Stock" : "Out"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="mt-1 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 sm:gap-2 sm:py-2 sm:text-sm"
                    >
                      <IoCartOutline size={15} className="sm:hidden" />
                      <IoCartOutline size={18} className="hidden sm:block" />
                      <span className="sm:hidden">Add</span>
                      <span className="hidden sm:inline">Add to Cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
