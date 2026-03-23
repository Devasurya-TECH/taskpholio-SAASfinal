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
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      staySignedIn: true,

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

      fetchMe: async () => {
        try {
          const res = await api.get("auth/me");
          set({ user: res.data.data.user, isAuthenticated: true });
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem("taskpholio_token");
          sessionStorage.removeItem("taskpholio_token");
        }
      },

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
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
          if (local) return JSON.parse(local);
          const session = sessionStorage.getItem(name);
          if (session) return JSON.parse(session);
          return null;
        },
        setItem: (name, value) => {
          const valStr = JSON.stringify(value);
          if (value.state.staySignedIn) {
            localStorage.setItem(name, valStr);
            sessionStorage.removeItem(name);
          } else {
            sessionStorage.setItem(name, valStr);
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
