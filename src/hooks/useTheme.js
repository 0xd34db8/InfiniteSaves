import { useState, useEffect, useCallback } from "react";

const THEME_STORAGE_KEY = "mdickie_editor_theme";

export function useTheme() {
  // Read saved preference from localStorage: "light" | "dark" | "crimson" | "system"
  const [themePreference, setThemePreference] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark" || saved === "crimson" || saved === "system") {
        return saved;
      }
    } catch {
      // ignore
    }
    return "system";
  });

  // Track system OS preference
  const [systemTheme, setSystemTheme] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark";
  });

  // Listen to OS system settings change
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Compute effective theme ("light", "dark", or "crimson")
  const effectiveTheme = themePreference === "system" ? systemTheme : themePreference;

  // Apply to document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "theme-crimson");
    if (effectiveTheme === "crimson") {
      root.classList.add("dark", "theme-crimson");
    } else if (effectiveTheme === "dark") {
      root.classList.add("dark");
    }
  }, [effectiveTheme]);

  // Set theme preference (and persist to localStorage)
  const setThemeMode = useCallback((mode) => {
    setThemePreference(mode);
    try {
      if (mode === "system") {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
      }
    } catch {
      // ignore
    }
  }, []);

  // Button toggle handler: cycles light -> dark -> crimson -> light
  const toggleTheme = useCallback(() => {
    const nextMode =
      effectiveTheme === "light"
        ? "dark"
        : effectiveTheme === "dark"
        ? "crimson"
        : "light";
    setThemeMode(nextMode);
  }, [effectiveTheme, setThemeMode]);

  return {
    themePreference,
    effectiveTheme,
    setThemeMode,
    toggleTheme,
  };
}
