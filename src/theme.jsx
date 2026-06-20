import { createContext, useContext, useEffect, useState } from "react";

/*
  Gestion du thème clair / sombre.
  Le thème initial est appliqué par le petit script dans index.html (anti-flash)
  qui expose window.__POKER_THEME__. Ici on se contente de le suivre et de le persister.
*/

const ThemeCtx = createContext(null);

function initialTheme() {
  if (typeof window !== "undefined" && window.__POKER_THEME__) return window.__POKER_THEME__;
  return "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("poker_theme", theme); } catch { /* stockage indisponible */ }
  }, [theme]);

  const value = {
    theme,
    isDark: theme === "dark",
    toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    setTheme,
  };

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}
