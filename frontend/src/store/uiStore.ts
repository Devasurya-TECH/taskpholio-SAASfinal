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
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" ? "light" : "dark";
};

const applyTheme = (theme: "dark" | "light") => {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
};

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  theme: resolveStoredTheme(),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebar: (open) => set({ sidebarOpen: open }),
  initTheme: () => {
    const resolved = resolveStoredTheme();
    applyTheme(resolved);
    set({ theme: resolved });
  },
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        window.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      }
      applyTheme(newTheme);
      return { theme: newTheme };
    }),
}));
