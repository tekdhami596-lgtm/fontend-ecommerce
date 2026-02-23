import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import getImageUrl from "../helpers/imageUrl";

interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  imagePath: string;
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get("/banners");
        setBanners(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch banners:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Auto slide every 4 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const prev = () =>
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  const next = () => setCurrent((prev) => (prev + 1) % banners.length);

  if (loading) {
    return (
      <div className="h-64 w-full animate-pulse rounded-2xl bg-gray-200 sm:h-80 md:h-96" />
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-lg">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="relative min-w-full">
            {/* Banner Image */}
            <img
              src={getImageUrl(banner.imagePath)}
              alt={banner.title}
              className="h-64 w-full object-cover sm:h-80 md:h-96"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

            {/* Text Content */}
            <div className="absolute inset-0 flex flex-col items-start justify-center px-8 sm:px-12 md:px-16">
              <h2 className="mb-2 text-2xl font-bold text-white drop-shadow sm:text-3xl md:text-4xl">
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className="mb-4 max-w-md text-sm text-gray-200 sm:text-base">
                  {banner.subtitle}
                </p>
              )}
              {banner.ctaText && banner.ctaLink && (
                <Link
                  to={banner.ctaLink}
                  className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow transition hover:bg-gray-100"
                >
                  {banner.ctaText}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next Buttons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition hover:bg-black/50"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition hover:bg-black/50"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === current
                  ? "w-6 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
