import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
});

// Attach the bearer token (kept as a fallback alongside the httpOnly
// cookie the backend also sets) on every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cp_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors into a friendly message so every caller can just
// read err.message.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("cp_token");
      localStorage.removeItem("cp_user");
    }
    const message =
      error.response?.data?.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default api;
