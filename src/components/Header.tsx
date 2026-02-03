import { CiHeart } from "react-icons/ci";
import { IoCartOutline } from "react-icons/io5";
import { PhoneCall, Mail, LogOut, User } from "lucide-react";
import Navbar from "./Navbar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { logout } from "../redux/slice/userSlice";
import { Link } from "react-router-dom";

export default function Header() {
  const user = useSelector((root: RootState) => root.user.value.data);
  const dispatch = useDispatch();

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
              <div className="flex justify-between gap-2">
                {user?.firstName && (
                  <span>{user?.firstName + " " + user?.lastName}</span>
                )}
                {user ? (
                  <div
                    className="flex gap-1"
                    onClick={() => {
                      dispatch(logout());
                    }}
                  >
                    <LogOut />
                    <span>Logout</span>
                  </div>
                ) : (
                  <Link to="/login" className="flex">
                    <User />
                    <span>Login</span>
                  </Link>
                )}
              </div>

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
