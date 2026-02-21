export function genFullUrl(partialUrl: string | null) {
  if (partialUrl) {
    return `${import.meta.env.VITE_API_URL}/${partialUrl}`;
  }
  return null;
}
