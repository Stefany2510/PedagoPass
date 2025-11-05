"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

export default function AuthToast() {
  const { user, quickLoginWithToken } = useAuth();
  const prevUser = useRef<typeof user>(null);
  const [open, setOpen] = useState(false);
  const [lastName, setLastName] = useState<string | null>(null);
  const [lastEmail, setLastEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // when user goes from defined to null => logged out
    if (prevUser.current && !user) {
      setLastName(prevUser.current?.nome ?? null);
      try { setLastEmail(localStorage.getItem('pp.lastEmail')); } catch {}
      setOpen(true);
      const id = window.setTimeout(() => setOpen(false), 6000);
      return () => window.clearTimeout(id);
    }
    prevUser.current = user;
  }, [user]);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/95 px-3 py-2 text-sm shadow-soft-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <span className="hidden sm:inline text-slate-700 dark:text-slate-300">Você saiu da sua conta.</span>
        {lastName && (
          <span className="hidden sm:inline text-slate-700 dark:text-slate-300">{lastName}</span>
        )}
        <Link href="/login" className="rounded-full bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700 focus-ring">Entrar</Link>
        {lastEmail && (
          <button
            type="button"
            disabled={busy}
            onClick={async ()=>{
              setBusy(true);
              try {
                const t = localStorage.getItem('pp.quickToken');
                const exp = localStorage.getItem('pp.quickTokenExp');
                const valid = t && exp && new Date(exp).getTime() > Date.now();
                if (!valid) throw new Error('Quick token inválido');
                const result = await quickLoginWithToken(t!);
                if (result.ok) {
                  router.push('/perfil');
                  return;
                }
                console.warn(result.error ?? 'Falha no acesso rápido');
              } catch (error) {
                console.warn('Quick token inválido ou expirado.', error);
              } finally {
                setBusy(false);
              }
            }}
            className="rounded-full border border-primary-200 px-3 py-1.5 text-primary-700 hover:bg-primary-50 dark:border-slate-700 dark:hover:bg-slate-800 focus-ring disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy? 'Entrando…' : 'Acesso rápido'}
          </button>
        )}
  <Link href="/cadastro" className="rounded-full border border-slate-200 px-3 py-1.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 focus-ring">Criar conta</Link>
        <button
          aria-label="Fechar"
          onClick={() => setOpen(false)}
          className="ml-1 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800 focus-ring"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 11-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
