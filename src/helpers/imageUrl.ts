const getImageUrl = (path: string): string => {
  if (!path) return "";

 
  if (path.includes("res.cloudinary.com") && !path.includes("/upload/f_")) {
    return path.replace(
      "/image/upload/",
      "/image/upload/f_webp,q_auto,w_400,c_limit/",
    );
  }

  if (path.startsWith("http")) return path;

  return `${import.meta.env.VITE_API_URL}/${path}`;
};

export default getImageUrl;
