import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://continuum-backend.onrender.com";

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
      // Token expirou ou inválido
      localStorage.removeItem("continuum_token");
      localStorage.removeItem("continuum_user");
      const store = useAuthStore.getState();
      store.logout();
      window.location.href = "/login";
    }
    if (error.response?.status === 403) {
      // Acesso negado - pode ser limite atingido ou não autorizado
      console.warn("Acesso negado:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;
