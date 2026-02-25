import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ProtectedRoute from "../components/ProtectedRoute";
import PageNotFound from "../pages/PageNotFound";
import Products from "../pages/Products";
import ProductDetailPage from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import orderSuccess from "../pages/orderSuccess";
import SellerDashboard from "../pages/seller/SellerDashboard";
import SellerProduct from "../pages/seller/SellerProduct";
import CreateSellerProduct from "../pages/seller/CreateSellerProduct";
import EditSellerProduct from "../pages/seller/EditSellerProduct";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/Adminusers";
import AdminSellers from "../pages/admin/AdminSellers";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminOrders from "../pages/admin/AdminOrders";
import ManageCategories from "../components/ManageCategories";
import AboutUs from "../pages/AboutUs";
import MyAccount from "../pages/Myaccount";
import ContactUs from "../components/ContactUs";
import EsewaSuccess from "../pages/EsewaSuccess";
import EsewaFailure from "../pages/EsewaFailure";
import TrackOrder from "../pages/TrackOrder";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import AdminBanners from "../pages/admin/AdminBanners";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      // ── Public ──────────────────────────────────────────────
      { path: "/", Component: Home },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "aboutUs", Component: AboutUs },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "reset-password/:token", Component: ResetPassword },

      {
        path: "products",
        children: [
          { path: "", Component: Products },
          { path: ":id", Component: ProductDetailPage },
        ],
      },
      { path: "contact-us", Component: ContactUs },
      { path: "trackOrder", Component: TrackOrder },

      // ── Buyer (any authenticated user) ──────────────────────
      {
        element: <ProtectedRoute />,
        children: [
          { path: "cart", Component: Cart },
          { path: "checkout", Component: Checkout },
          { path: "order-success/:id", Component: orderSuccess },
          { path: "my-orders", Component: Orders },
          { path: "my-account", Component: MyAccount },
          { path: "/esewa/success", Component: EsewaSuccess },
          { path: "/esewa/failure", Component: EsewaFailure },
        ],
      },

      // ── Seller only ─────────────────────────────────────────
      {
        path: "seller",
        element: <ProtectedRoute allowedRoles={["seller"]} />,
        children: [
          { path: "dashboard", Component: SellerDashboard },
          { path: "products", Component: SellerProduct },
          { path: "products/create", Component: CreateSellerProduct },
          { path: "products/edit/:id", Component: EditSellerProduct },
        ],
      },

      // ── Admin only ──────────────────────────────────────────
      {
        path: "admin",
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        children: [
          { path: "dashboard", Component: AdminDashboard },
          { path: "users", Component: AdminUsers },
          { path: "sellers", Component: AdminSellers },
          { path: "products", Component: AdminProducts },
          { path: "orders", Component: AdminOrders },
          { path: "banners", Component: AdminBanners },

          {
            path: "categories",
            element: <ManageCategories viewMode="admin" />,
          },
        ],
      },

      { path: "*", Component: PageNotFound },
    ],
  },
]);
