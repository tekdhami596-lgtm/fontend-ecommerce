import "../index.css";
import { NavLink } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      {/* Main Navbar */}
      <nav className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          {/* Logo */}
          <NavLink to="/" className="text-2xl font-bold text-indigo-900">
            Hekto
          </NavLink>

          {/* Menu */}
          <div className="hidden gap-6 font-medium md:flex">
            <NavLink to="/" className="text-pink-500">
              Home
            </NavLink>
           
             <NavLink to="/seller/dashboard" className="hover:text-pink-500">
              Dashboard
            </NavLink>
          </div>

          {/* Search Bar */}
          <div className="w-full px-5 md:w-auto md:px-0">
            <div className="flex w-full overflow-hidden rounded border md:w-80 lg:w-106">
              {/* Input */}
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 px-3 py-2 text-sm outline-none md:text-base"
              />
              {/* Button */}
              <button className="flex items-center justify-center bg-pink-500 px-3 text-white">
                <CiSearch size={20} />
              </button>
            </div>
          </div>

          {/* Hamburger Menu */}
          <div className="flex items-end md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-pink-500 focus:outline-none"
            >
              {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
            </button>
          </div>

          {isOpen && (
            <div className="absolute top-30 left-0 flex w-full flex-col items-center gap-4 bg-white py-6 shadow-md md:hidden">
              <NavLink
                to="/"
                className="text-pink-500"
                onClick={() => setIsOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/pages"
                className="hover:text-pink-500"
                onClick={() => setIsOpen(false)}
              >
                Pages
              </NavLink>
              <NavLink
                to="/products"
                className="hover:text-pink-500"
                onClick={() => setIsOpen(false)}
              >
                Products
              </NavLink>
              <NavLink
                to="/blog"
                className="hover:text-pink-500"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </NavLink>
              <NavLink
                to="/shop"
                className="hover:text-pink-500"
                onClick={() => setIsOpen(false)}
              >
                Shop
              </NavLink>
              <NavLink
                to="/contact"
                className="hover:text-pink-500"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
