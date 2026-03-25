"use client";
import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  theme: "dark" | "light";
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  initTheme: () => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = "taskpholio_theme";

const resolveStoredTheme = (): "dark" | "light" => {
  return "dark";
};

const applyTheme = (theme: "dark" | "light") => {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", "dark");
  document.documentElement.classList.add("dark");
};

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  theme: resolveStoredTheme(),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebar: (open) => set({ sidebarOpen: open }),
  initTheme: () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    }
    applyTheme("dark");
    set({ theme: "dark" });
  },
  toggleTheme: () =>
    set(() => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
      }
      applyTheme("dark");
      return { theme: "dark" };
    }),
}));
