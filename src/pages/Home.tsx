import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { fetchCategoryTree, CategoryTree } from "../redux/slice/categorySlice";
import { Link, useSearchParams } from "react-router-dom";
import { IoCartOutline } from "react-icons/io5";
import { addToCart } from "../redux/slice/cartSlice";

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

// Flatten tree into a single array of {id, title} for pills
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
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(
    searchParams.get("categoryId")
      ? Number(searchParams.get("categoryId"))
      : null,
  );

  const flatCategories = flattenTree(categoryTree);

  // Fetch categories if not loaded
  useEffect(() => {
    if (categoryTree.length === 0) {
      dispatch(fetchCategoryTree());
    }
  }, []);

  // Sync URL param → active category
  useEffect(() => {
    const id = searchParams.get("categoryId");
    setActiveCategoryId(id ? Number(id) : null);
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: any = {};
        if (activeCategoryId) params.categoryId = activeCategoryId;

        const res = await axios.get("http://localhost:8001/api/products", {
          params,
        });
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
        id: 0, // placeholder — real cart row id comes from backend sync
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
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-700 px-6 py-16 text-center text-white">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">
          Welcome to Hekto
        </h1>
        <p className="mx-auto max-w-xl text-lg text-indigo-200">
          Discover products you'll love — curated by sellers, organized by
          categories.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Category Filter Pills */}
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-400 uppercase">
            Browse by Category
          </h2>
          <div className="flex flex-wrap gap-2">
            {/* "All" pill */}
            <button
              onClick={() => handleCategorySelect(null)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeCategoryId === null
                  ? "border-purple-600 bg-purple-600 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-purple-400 hover:text-purple-600"
              }`}
            >
              All
            </button>

            {flatCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  activeCategoryId === cat.id
                    ? "border-purple-600 bg-purple-600 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-purple-400 hover:text-purple-600"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* Active filter indicator */}
        {activeCategoryId && (
          <div className="mb-6 flex items-center gap-2">
            <span className="text-sm text-gray-500">Showing:</span>
            <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-600">
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

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl bg-white py-20 text-center shadow-sm">
            <p className="text-xl text-gray-400">No products found.</p>
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
            <p className="mb-4 text-sm text-gray-500">
              {products.length} product{products.length !== 1 ? "s" : ""} found
            </p>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Image */}
                  <Link to={`/products/${product.id}`}>
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      {product.images?.length > 0 ? (
                        <img
                          src={`http://localhost:8001/${product.images[0].path}`}
                          alt={product.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-300">
                          No Image
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="space-y-2 p-4">
                    {/* Category tags */}
                    {product.categories?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
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
                      <h3 className="truncate font-semibold text-gray-800 hover:text-purple-600">
                        {product.title}
                      </h3>
                    </Link>

                    <p className="line-clamp-2 text-sm text-gray-500">
                      {product.shortDescription}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-lg font-bold text-indigo-600">
                        ${product.price}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          product.stock > 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <IoCartOutline size={18} />
                      Add to Cart
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
