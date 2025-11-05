
"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "./auth-provider";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const { user, logout, avatarUrl } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    // focus first link when opening
    const id = window.setTimeout(() => firstLinkRef.current?.focus(), 0);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(id);
    };
  }, [open]);

  const links = [
    { href: "/comunidades", label: "Comunidades" },
    { href: "/explorar", label: "Explorar" },
    { href: "/destinos", label: "Destinos" },
    { href: "/perfil", label: "Perfil" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const initials = user ? user.nome.split(" ").map(n => n[0]).slice(0, 2).join("") : "";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled
          ? "bg-white/80 dark:bg-slate-900/70 backdrop-blur border-b border-slate-200/50 dark:border-slate-800"
          : "bg-transparent"
      }`}
    >
      <nav className="container-max flex items-center justify-between py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-primary-700 dark:text-primary-300 focus-ring rounded-md"
        >
          <img src="/favicon.svg" alt="PedagoPass" className="h-7 w-7" />
          <span>PedagoPass</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative group py-1 focus-ring rounded-md ${
                isActive(l.href) ? "text-primary-700 dark:text-primary-300" : ""
              }`}
            >
              {l.label}
              <span
                aria-hidden
                className={`pointer-events-none absolute -bottom-0.5 left-0 h-0.5 w-full origin-left scale-x-0 bg-primary-600 transition-transform duration-300 ease-out group-hover:scale-x-100 ${
                  isActive(l.href) ? "scale-x-100" : ""
                }`}
              />
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/perfil" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 focus-ring">
                <span className="relative inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-primary-600 text-white text-xs">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={`Foto de ${user.nome}`} fill className="object-cover" sizes="24px" unoptimized />
                  ) : (
                    initials
                  )}
                </span>
                <span className="max-w-[12ch] truncate">{user.nome}</span>
              </Link>
              <button onClick={logout} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white focus-ring">Sair</button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus-ring"
            >
              Entrar
            </Link>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 focus-ring hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Abrir menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
            >
              {open ? (
                <path
                  fillRule="evenodd"
                  d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 11-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M3.75 6.75A.75.75 0 014.5 6h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 5.25a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm.75 4.5a.75.75 0 000 1.5h15a.75.75 0 000-1.5h-15z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden" id="mobile-menu">
          <div
            className="fixed inset-0 z-40 bg-slate-900/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="fixed right-0 top-0 z-50 h-full w-72 max-w-[85%] bg-white dark:bg-slate-900 shadow-soft-lg border-l border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between mb-2">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 font-semibold text-primary-700 dark:text-primary-300 focus-ring rounded-md"
              >
                <img src="/favicon.svg" alt="PedagoPass" className="h-7 w-7" />
                <span>PedagoPass</span>
              </Link>
              <button
                className="p-2 rounded-md focus-ring hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Fechar menu"
                onClick={() => setOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 11-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {links.map((l, i) => (
                <Link
                  ref={i === 0 ? firstLinkRef : undefined}
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2 rounded-md focus-ring ${
                    isActive(l.href)
                      ? "bg-primary-50 text-primary-700 dark:bg-slate-800/60 dark:text-primary-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              {user ? (
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <Link href="/perfil" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 focus-ring text-center">Perfil</Link>
                  <button onClick={() => { logout(); setOpen(false); }} className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white focus-ring">Sair</button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mt-1 px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus-ring text-center"
                >
                  Entrar
                </Link>
              )}
            </div>
            <div className="mt-auto pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Tema</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
