import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL; // Change this to your actual API base URL

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("continuum_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("continuum_token");
      localStorage.removeItem("continuum_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
