import { useEffect, useState } from "react";
import NoImageFound from "../assets/NoImage.png";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart as addToCartRedux } from "../redux/slice/cartSlice";
import { RootState } from "../redux/store";
import cartApi from "../api/cart.api";
import notify from "../helpers/notify";
import api from "../api/axios";

type ProductImage = { path: string };
type Product = {
  id: number;
  title: string;
  shortDescription: string;
  price: number;
  stock: number;
  images: ProductImage[];
};

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const user = useSelector((state: RootState) => state.user.data);
  const isSeller = user?.role === "seller";

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const categoryId = searchParams.get("categoryId");
      const search = searchParams.get("search");

      const params = new URLSearchParams();
      params.set("limit", "100");
      if (categoryId) params.set("categoryId", categoryId);
      if (search) params.set("q", search);

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────
  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-xl bg-white py-16 text-center shadow-sm">
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
      {/* Product count */}
      <p className="mb-4 text-xs text-gray-500 sm:text-sm">
        {products.length} product{products.length !== 1 ? "s" : ""} found
      </p>

      {/* ── Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
          >
            {/* ── Image ─────────────────────────────────────── */}
            <div
              className="relative h-36 cursor-pointer overflow-hidden bg-gray-100 sm:h-44 md:h-48"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              {product.images?.length > 0 ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}/${product.images[0].path}`}
                  alt={product.title}
                  className="object-fit h-full w-full transition duration-300 group-hover:scale-105"
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
            </div>

            {/* ── Info ──────────────────────────────────────── */}
            <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:gap-2 sm:p-4">
              {/* Title */}
              <h2
                className="cursor-pointer truncate text-sm font-semibold text-gray-800 hover:text-indigo-600 sm:text-base"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                {product.title}
              </h2>

              {/* Short description — hidden on mobile */}
              <p className="line-clamp-2 hidden text-sm text-gray-500 sm:block">
                {product.shortDescription}
              </p>

              {/* Price + Stock */}
              <div className="mt-auto flex items-center justify-between pt-1 sm:pt-2">
                <span className="text-sm font-bold text-indigo-600 sm:text-lg">
                  ${product.price}
                </span>
                <span
                  className={`text-xs font-medium ${
                    product.stock > 0 ? "text-green-600" : "text-red-500"
                  }`}
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

              {/* Buttons */}
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
                    {product.stock === 0 ? (
                      "Out of Stock"
                    ) : (
                      <>
                        <span className="sm:hidden">Add to Cart</span>
                        <span className="hidden sm:inline">Add to Cart</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="w-full cursor-pointer rounded-lg border border-indigo-600 px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 sm:py-2 sm:text-sm"
                >
                  <span className="sm:hidden">Details</span>
                  <span className="hidden sm:inline">View Product Details</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
