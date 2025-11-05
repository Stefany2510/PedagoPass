
"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(document.documentElement.classList.contains("dark") || mq.matches);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark, mounted]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setIsDark(saved === "dark");
  }, []);

  const label = isDark ? "Alternar para tema claro" : "Alternar para tema escuro";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isDark}
      onClick={() => setIsDark((v) => !v)}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-900 shadow-soft-md transition hover:bg-slate-100 focus-ring dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800"
    >
      {/* Sun icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`absolute h-5 w-5 transform transition-all duration-300 ${
          isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        }`}
        aria-hidden="true"
      >
        <path d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
        <path d="M12 1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zm0 18a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM4.72 4.72a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06L4.72 5.78a.75.75 0 010-1.06zm12.38 12.38a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM1.5 12a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H2.25A.75.75 0 011.5 12zm18 0a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM4.72 19.28a.75.75 0 010-1.06l1.06-1.06a.75.75 0 111.06 1.06L5.78 19.28a.75.75 0 01-1.06 0zm12.38-12.38a.75.75 0 010-1.06l1.06-1.06a.75.75 0 111.06 1.06L18.16 7.9a.75.75 0 01-1.06 0z" />
      </svg>

      {/* Moon icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`absolute h-5 w-5 transform transition-all duration-300 ${
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
        }`}
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1111.21 3a7.5 7.5 0 109.79 9.79z" />
      </svg>
    </button>
  );
}
