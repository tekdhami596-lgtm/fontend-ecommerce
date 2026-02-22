import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import { useEffect } from "react";
import Navbar from "../components/Navbar";

function MainLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}

export default MainLayout;
