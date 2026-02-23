const getImageUrl = (path: string): string => {
  if (!path) return "";
  // If already a full URL (Cloudinary), use as-is
  if (path.startsWith("http")) return path;
  // Fallback for any old local paths
  return `${import.meta.env.VITE_API_URL}/${path}`;
};

export default getImageUrl;
