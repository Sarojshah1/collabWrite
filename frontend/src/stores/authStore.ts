import { create } from "zustand";
import http from "@/lib/http";
import { authService, type AuthUser } from "@/services/authService";

export type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; bio?: string }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  setUser: (u: AuthUser | null) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  get isAuthenticated() {
    return !!get().user;
  },
  setUser: (u) => set({ user: u }),
  async refresh() {
    try {
      set({ loading: true });
      const { data } = await http.get<{ data: { user: AuthUser } }>("/auth/profile");
      set({ user: data.data.user });
    } catch {
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
  async login(payload) {
    set({ loading: true });
    try {
      const res = await authService.login(payload);
      set({ user: res.user });
    } finally {
      set({ loading: false });
    }
  },
  async register(payload) {
    set({ loading: true });
    try {
      const res = await authService.register(payload);
      set({ user: res.user });
    } finally {
      set({ loading: false });
    }
  },
  logout() {
    authService.logout();
    set({ user: null });
  },
}));
