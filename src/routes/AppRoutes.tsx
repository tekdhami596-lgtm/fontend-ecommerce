import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import ProtectedRoute from "../components/ProtectedRoute";
import PageNotFound from "../pages/PageNotFound";
import Signup from "../pages/Signup";
import ProductDetails from "../pages/ProductDetails";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      {path:"signup", element:<Signup/> },
      {
        path: "/product",
        Component: ProtectedRoute,
        children: [{ index: true, element: <ProductDetails /> }],
      },

     
      {path:"*", Component: PageNotFound}
    ],
  },
]);
