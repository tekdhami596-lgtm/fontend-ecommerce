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
  const [searchParams, setSearchParams] = useSearchParams();
  const { tree: categoryTree } = useSelector(
    (state: RootState) => state.categories,
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(
    searchParams.get("categoryId")
      ? Number(searchParams.get("categoryId"))
      : null,
  );

  const flatCategories = flattenTree(categoryTree);
  const topLevelCategories = categoryTree;

  useEffect(() => {
    if (categoryTree.length === 0) dispatch(fetchCategoryTree());
  }, []);

  useEffect(() => {
    const id = searchParams.get("categoryId");
    setActiveCategoryId(id ? Number(id) : null);
  }, [searchParams]);

  useEffect(() => {
    if (activeCategoryId && flatCategories.length === 0) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);

        if (activeCategoryId) {
          const allIds = getAllDescendantIds(activeCategoryId, flatCategories);
          const params = new URLSearchParams();
          allIds.forEach((id) => params.append("categoryId", String(id)));
          const res = await api.get(`/products?${params.toString()}`);
          setProducts(res.data.data || []);
        } else {
          const res = await api.get("/products");
          setProducts(res.data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategoryId, categoryTree]);

  const handleCategorySelect = (id: number | null) => {
    setActiveCategoryId(id);
    if (id) setSearchParams({ categoryId: String(id) });
    else setSearchParams({});
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

  const activeCategoryName = flatCategories.find(
    (c) => c.id === activeCategoryId,
  )?.title;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-700 px-4 py-12 text-center text-white sm:px-6 sm:py-16 md:py-20">
        <h1 className="mb-3 text-3xl font-bold sm:mb-4 sm:text-4xl md:text-5xl">
          Welcome to DokoMart
        </h1>
        <p className="mx-auto max-w-xl text-base text-indigo-200 sm:text-lg">
          Discover products you'll love — curated by sellers, organized by
          categories.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-10">
        {/* ── Categories ────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
            {/* All pill */}
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

          {/* Sub-categories strip */}
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

          {/* Active filter label */}
          {activeCategoryId && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-400">Showing:</span>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                {activeCategoryName}
              </span>
              <button
                onClick={() => handleCategorySelect(null)}
                className="text-xs text-gray-400 underline hover:text-red-500"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* ── Products Grid ──────────────────────────────────────────── */}
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
            <p className="mb-4 text-xs text-gray-500 sm:text-sm">
              {products.length} product{products.length !== 1 ? "s" : ""} found
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Image */}
                  <Link
                    to={`/products/${product.id}`}
                    className="block shrink-0"
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-gray-100 sm:h-44">
                      {product.images?.length > 0 ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}/${product.images[0].path}`}
                          alt={product.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
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

                  {/* Card body */}
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
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 sm:py-2 sm:text-sm"
                      >
                        <IoCartOutline size={15} />
                        <span>Add to Cart</span>
                      </button>
                    </div>
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
