import axios from "axios";
import notify from "../helpers/notify";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      const message =
        error.response.data?.message ||
        "Too many requests. Please try again later.";
      notify.error(message);
    }
    return Promise.reject(error);
  },
);

export default api;
