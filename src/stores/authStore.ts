import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  username?: string;
  plan?: "FREE" | "PRO";
  active?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  hydrate: () => {
    const savedToken = localStorage.getItem("continuum_token");
    const savedUser = localStorage.getItem("continuum_user");
    if (savedToken && savedUser) {
      try {
        set({ token: savedToken, user: JSON.parse(savedUser), isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  login: (token, user) => {
    localStorage.setItem("continuum_token", token);
    localStorage.setItem("continuum_user", JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("continuum_token");
    localStorage.removeItem("continuum_user");
    set({ token: null, user: null });
  },

  updateUser: (updates) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...updates };
      localStorage.setItem("continuum_user", JSON.stringify(updated));
      return { user: updated };
    });
  },
}));
