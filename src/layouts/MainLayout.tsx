import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";

function MainLayout() {
  return (
    <div>
      <Header />
      <h1>Welcome to Hekto store</h1>
      <Outlet />
      <Footer />
    </div>
  );
}

export default MainLayout;
