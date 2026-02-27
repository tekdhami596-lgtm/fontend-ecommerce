import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  RotateCcw,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="border-b border-gray-700 bg-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-green-400" />
              <span>100% Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-blue-400" />
              <span>Fast Delivery Across Nepal</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={18} className="text-yellow-400" />
              <span>Easy Returns & Refunds</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-purple-400" />
              <span>100% Genuine Products</span>
            </div>
          </div>
        </div>
      </div>

 
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
     
          <div>
            <h2 className="mb-3 text-2xl font-bold text-white">
              Doko<span className="text-indigo-400">mart</span>
            </h2>
            <p className="mb-5 text-sm leading-relaxed text-gray-400">
              Your one-stop online shopping destination in Nepal. Quality
              products, great prices, and fast delivery at your doorstep.
            </p>
            <div className="flex gap-3">
              {[
                {
                  icon: <Facebook size={18} />,
                  href: "https://www.facebook.com/yourpage",
                },
                {
                  icon: <Instagram size={18} />,
                  href: "https://www.instagram.com/yourhandle",
                },
                {
                  icon: <Twitter size={18} />,
                  href: "https://www.twitter.com/yourhandle",
                },
                {
                  icon: <Youtube size={18} />,
                  href: "https://www.youtube.com/@yourchannel",
                },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 text-gray-300 transition hover:bg-indigo-600 hover:text-white"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

       
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
              Customer Service
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Track My Order", href: "/trackOrder" },
                { label: "Cancel Order", href: "/my-orders" },
                { label: "FAQs", href: "/contact-us" },
                { label: "Contact Us", href: "/contact-us" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="transition hover:text-indigo-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

    
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Home", href: "/" },
                { label: "About Us", href: "/aboutUs" },
                { label: "My Account", href: "/my-account" },
                { label: "My Cart", href: "/cart" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="transition hover:text-indigo-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

     
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
              Contact Details
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-indigo-400" />
                <a
                  href="mailto:support@dokomart.com"
                  className="hover:text-indigo-400"
                >
                  support@dokomart.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-indigo-400" />
                <a href="tel:+977XXXXXXXXXX" className="hover:text-indigo-400">
                  +977-98-48411241
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-indigo-400" />
                <span className="text-gray-400">Kathmandu, Nepal</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="mt-0.5 shrink-0 text-indigo-400" />
                <span className="text-gray-400">
                  Sun – Fri, 9:00 AM – 6:00 PM
                </span>
              </li>
            </ul>
          </div>
        </div>

   
        <div className="mt-10 border-t border-gray-700 pt-8">
          <p className="mb-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase">
            We Accept
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
      
            <div className="flex items-center gap-2 rounded-md border border-gray-600 bg-gray-800 px-3 py-1.5">
              <img
                src="https://esewa.com.np/common/images/esewa_logo.png"
                alt="eSewa"
                className="h-5 w-auto object-contain"
              />
            </div>

        
            <div className="flex items-center gap-2 rounded-md border border-gray-600 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300">
              <Truck size={14} className="text-green-400" />
              <span>Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 bg-gray-950">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-xs text-gray-500">
          <span>
            © {new Date().getFullYear()} Dokomart. All rights reserved.
          </span>
          <div className="flex gap-4">
            {["Privacy Policy", "Terms & Conditions", "Cookie Policy"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="transition hover:text-indigo-400"
                >
                  {item}
                </a>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
