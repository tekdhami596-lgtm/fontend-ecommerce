import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsLoggedIn,
  selectRole,
  UserRole,
} from "../redux/slice/userSlice";

interface Props {
  allowedRoles?: UserRole[];
}

/**
 * Usage in AppRoutes:
 *   No roles  → element: <ProtectedRoute />                    any logged-in user
 *   Seller    → element: <ProtectedRoute allowedRoles={["seller"]} />
 *   Admin     → element: <ProtectedRoute allowedRoles={["admin"]} />
 */
const ProtectedRoute = ({ allowedRoles }: Props) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const role = useSelector(selectRole);
  const location = useLocation();

  // Not logged in → redirect to login, remember where they tried to go
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Logged in but wrong role → send to their own home
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const fallback = role === "seller" ? "/seller/dashboard" : "/";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
