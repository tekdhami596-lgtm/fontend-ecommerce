import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import ProtectedRoute from "../components/ProtectedRoute";
import PageNotFound from "../pages/PageNotFound";
import Signup from "../pages/Signup";
import SellerDashboard from "../pages/seller/SellerDashboard";
import Products from "../pages/Products";
import SellerProduct from "../pages/seller/SellerProduct";
import CreateSellerProduct from "../pages/seller/CreateSellerProduct";
import EditSellerProduct from "../pages/seller/EditSellerProduct";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import ProductDetailPage from "../pages/ProductDetail";
import orderSuccess from "../pages/orderSuccess";
import Orders from "../pages/Orders";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { path: "/", Component: Home },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      {
        path: "/products",
        children: [
          { path: "", Component: Products },
          { path: ":id", Component: ProductDetailPage },
        ],
      },
      {
        Component: ProtectedRoute,
        children: [
          { path: "/cart", Component: Cart },
          { path: "/checkout", Component: Checkout },
          { path: "/order-success/:id", Component: orderSuccess },
          { path: "/my-orders", Component: Orders },
        ],
      },
      {
        path: "seller",
        Component: ProtectedRoute,
        children: [
          { path: "dashboard", Component: SellerDashboard },
          { path: "products", Component: SellerProduct },
          { path: "products/create", Component: CreateSellerProduct },
          { path: "products/edit/:id", Component: EditSellerProduct },
        ],
      },

      { path: "*", Component: PageNotFound },
    ],
  },
]);
