"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = globalThis.localStorage?.getItem("theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  const prefersDark = globalThis.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getInitialTheme();
    // Theme is browser-backed state; hydrate it after mount to avoid an SSR mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initial);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", initial === "dark");
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof globalThis !== "undefined") {
      globalThis.localStorage?.setItem("theme", next);
    }
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", next === "dark");
    }
  };

  if (!mounted || theme === null) {
    return null;
  }

  const label = theme === "dark" ? "Dark" : "Light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white/80 px-3 py-1 text-xs font-medium text-zinc-800 shadow-sm backdrop-blur hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:bg-zinc-800"
    >
      <span className="h-3 w-3 rounded-full bg-yellow-400 shadow-sm dark:hidden" />
      <span className="hidden h-3 w-3 rounded-full bg-zinc-500 shadow-sm dark:inline-block" />
      <span>{label} mode</span>
    </button>
  );
}
