import { create } from "zustand";
import { User, AuthResponse } from "@/types";
import { apiService } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isHydrating: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrating: (hydrating: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isHydrating: false,
  error: null,
  isAuthenticated: false,
  isHydrated: false,

  setUser: (user) => set({ user, isAuthenticated: user !== null && user?.role === 'ADMIN' }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  setHydrating: (isHydrating) => set({ isHydrating }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response: AuthResponse = await apiService.login({
        email,
        password,
      });
      
      // Check if user is an admin
      if (response.user.role !== 'ADMIN') {
        set({ error: "Access denied. Admin privileges required.", isLoading: false });
        throw new Error("Access denied. Admin privileges required.");
      }
      
      set({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password, confirmPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response: AuthResponse = await apiService.register({
        name,
        email,
        password,
        confirmPassword,
      });
      
      // Check if user is an admin
      if (response.user.role !== 'ADMIN') {
        set({ error: "Registration failed. Admin role required.", isLoading: false });
        throw new Error("Registration failed. Admin role required.");
      }
      
      set({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    apiService.clearToken();
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    set({ isHydrating: true, error: null });
    try {
      const user = await apiService.getProfile();
      
      // Check if user is an admin
      if (user.role !== 'ADMIN') {
        set({ isHydrating: false, error: "Access denied. Admin privileges required.", isAuthenticated: false });
        apiService.clearToken();
        throw new Error("Access denied. Admin privileges required.");
      }
      
      set({ user, isHydrating: false, isAuthenticated: true });
    } catch (error: any) {
      set({ isHydrating: false, error: "Failed to fetch profile", isAuthenticated: false });
      // Clear token if profile fetch fails (invalid token)
      apiService.clearToken();
    }
  },

  initialize: () => {
    set({ isHydrating: true });
    const token = apiService.getToken();
    
    if (token) {
      // Token exists, fetch profile
      get().fetchProfile().finally(() => {
        set({ isHydrated: true });
      });
    } else {
      // No token, user not authenticated
      set({ isHydrating: false, isAuthenticated: false, isHydrated: true });
    }
  },
}));
