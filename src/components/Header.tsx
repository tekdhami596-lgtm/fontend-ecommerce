import { FaRegUser } from "react-icons/fa6";
import { CiHeart } from "react-icons/ci";
import { IoCartOutline } from "react-icons/io5";
import { PhoneCall, Mail } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function Header() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  console.log("logoutuser:", { token });

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/");
  };

  return (
    <>
      <header className="w-full">
        {/* Top bar */}
        <div className="md:flex-flow bg-purple-600 text-sm text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
            {/* Left */}
            <div className="flex gap-4">
              <Mail />
              <span className="hidden md:inline md:text-lg lg:text-xl">
                tekdhami506@gmail.com
              </span>
              <PhoneCall />
              <span className="hidden md:inline md:text-lg lg:text-xl">
                (12345)67890
              </span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              <select className="cursor-pointer bg-purple-600 outline-none">
                <option>English</option>
                <option>Spanish</option>
              </select>

              <select className="cursor-pointer bg-purple-600 outline-none">
                <option>USD</option>
                <option>EUR</option>
              </select>

              {!token ? (
                <NavLink
                  to="/login"
                  className="flex items-center gap-1 hover:text-pink-300"
                >
                  Login <FaRegUser />
                </NavLink>
              ) : (
                <button
                  onClick={handleLogout}
                  className="rounded bg-white px-3 py-1 font-semibold text-blue-600 transition duration-200 hover:bg-gray-100"
                >
                  Logout
                </button>
              )}

              <button className="flex items-center gap-1 hover:text-pink-300">
                Wishlist <CiHeart />
              </button>

              <div className="relative cursor-pointer hover:text-pink-300">
                <IoCartOutline size={20} />
                <span className="absolute -top-2 -right-2 rounded-full bg-pink-500 px-1 text-xs">
                  0
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <Navbar />
    </>
  );
}
