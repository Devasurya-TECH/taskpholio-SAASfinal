"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/lib/types";
import api from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  staySignedIn: boolean;
  login: (email: string, password: string, staySignedIn?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, role: string, team?: string, staySignedIn?: boolean) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  setAuth: (user: User, token: string) => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  setStaySignedIn: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      staySignedIn: true, // Default to true for backward compatibility

      login: async (email, password, staySignedIn = true) => {
        set({ isLoading: true, staySignedIn });
        try {
          const res = await api.post("auth/login", { email, password });
          const token = res.data.data.token;
          const user = res.data.data.user;
          
          const storage = staySignedIn ? localStorage : sessionStorage;
          storage.setItem("taskpholio_token", token);
          
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (name, email, password, role, team, staySignedIn = true) => {
        set({ isLoading: true, staySignedIn });
        try {
          const payload = team ? { name, email, password, role, team } : { name, email, password, role };
          const res = await api.post("auth/register", payload);
          const token = res.data.data.token;
          const user = res.data.data.user;
          
          const storage = staySignedIn ? localStorage : sessionStorage;
          storage.setItem("taskpholio_token", token);
          
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await api.post("auth/logout");
        } catch (err) {
          console.error("LOGOUT ERROR:", err);
        } finally {
          localStorage.removeItem("taskpholio_token");
          sessionStorage.removeItem("taskpholio_token");
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      fetchMe: async () => {
        try {
          const res = await api.get("auth/me");
          const newUser = res.data.data.user;
          const currentUser = get().user;
          
          if (JSON.stringify(currentUser) !== JSON.stringify(newUser)) {
            set({ user: newUser, isAuthenticated: true });
          }
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      updateProfile: async (updates) => {
        try {
          const res = await api.patch("auth/profile", updates);
          set({ user: res.data.data.user });
        } catch (err) {
          console.error("Profile update failed:", err);
          throw err;
        }
      },

      setStaySignedIn: (value) => set({ staySignedIn: value })
    }),
    {
      name: "taskpholio-auth",
      storage: {
        getItem: (name) => {
          const local = localStorage.getItem(name);
          if (local) return local;
          return sessionStorage.getItem(name);
        },
        setItem: (name, value) => {
          // Check the state to decide where to persist
          // Since this is called from the middleware, we can't easily access get().staySignedIn
          // But we can check if the value contains staySignedIn: true
          const state = JSON.parse(value);
          if (state.state.staySignedIn) {
            localStorage.setItem(name, value);
            sessionStorage.removeItem(name);
          } else {
            sessionStorage.setItem(name, value);
            localStorage.removeItem(name);
          }
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
          sessionStorage.removeItem(name);
        },
      },
      partialize: (state) => ({ token: state.token, user: state.user, staySignedIn: state.staySignedIn }),
    }
  )
);
