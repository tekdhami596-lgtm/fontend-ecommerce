import { RootState } from "../redux/store";
import { useSelector } from "react-redux";
import { Outlet } from "react-router";
import { Navigate } from "react-router";

function ProtectedRoute() {
  const user = useSelector((root: RootState) => root.user.data);

  if (user) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
}

export default ProtectedRoute;
