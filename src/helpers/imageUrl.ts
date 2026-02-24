const getImageUrl = (path: string): string => {
  if (!path) return "";

  if (path.startsWith("http")) return path;

  return `${import.meta.env.VITE_API_URL}/${path}`;
};

export default getImageUrl;
