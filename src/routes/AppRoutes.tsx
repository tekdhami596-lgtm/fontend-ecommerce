import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import ProtectedRoute from "../components/ProtectedRoute";
import PageNotFound from "../pages/PageNotFound";
import Signup from "../pages/Signup";
import SellerDashboard from "../pages/seller/SellerDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      {
        path: "seller",
        Component: ProtectedRoute,
        children: [
            { path: "dashboard", Component: SellerDashboard },
        ],
      },

      { path: "*", Component: PageNotFound },
    ],
  },
]);
