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

const ProtectedRoute = ({ allowedRoles }: Props) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const role = useSelector(selectRole);
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const fallback = role === "seller" ? "/seller/dashboard" : "/";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
