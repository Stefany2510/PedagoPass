"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter, useSearchParams } from "next/navigation";

type LoginFormProps = {
  nextPath?: string;
};

export default function LoginForm({ nextPath = "/perfil" }: LoginFormProps) {
  const { user, login } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const demo = useMemo(() => {
    const e = process.env.NEXT_PUBLIC_DEMO_EMAIL;
    const p = process.env.NEXT_PUBLIC_DEMO_PASSWORD;
    if (e && p) return { email: String(e), senha: String(p) };
    return null;
  }, []);

  useEffect(() => {
    if (user) router.replace("/perfil");
  }, [user, router]);

  useEffect(() => {
    // Prefill via query: /login?email=...&quick=1
    const qEmail = search.get("email");
    if (qEmail && !email) setEmail(qEmail);
  }, [search, email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(email, senha);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Não foi possível entrar.");
      return;
    }
    router.push(nextPath);
  }

  async function onDemo() {
    if (!demo) return;
    setError(null);
    setLoading(true);
    const res = await login(demo.email, demo.senha);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Não foi possível entrar na conta demo.");
      return;
    }
    router.push(nextPath);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 p-6 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg mx-auto text-left">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">E-mail</label>
          <input id="email" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus-ring" placeholder="voce@escola.com"/>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium mb-1" htmlFor="senha">Senha</label>
            <button type="button" onClick={()=>setShow(s=>!s)} className="text-sm text-primary-700 dark:text-primary-300 hover:underline">{show?"Ocultar":"Mostrar"}</button>
          </div>
          <input id="senha" type={show?"text":"password"} required minLength={6} value={senha} onChange={(e)=>setSenha(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus-ring" placeholder="Sua senha"/>
        </div>
        <button disabled={loading} className="mt-2 inline-flex items-center justify-center rounded-lg bg-primary-600 text-white px-4 py-2 hover:bg-primary-700 focus-ring disabled:opacity-60 disabled:cursor-not-allowed">
          {loading?"Entrando…":"Entrar"}
        </button>
        {demo && (
          <button type="button" onClick={onDemo} disabled={loading} className="mt-2 inline-flex items-center justify-center rounded-lg border border-primary-300 text-primary-700 px-4 py-2 hover:bg-primary-50 focus-ring disabled:opacity-60 disabled:cursor-not-allowed">
            {loading?"Entrando…":"Entrar com conta demo"}
          </button>
        )}
      </div>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        Não tem conta? <Link href="/cadastro" className="text-primary-700 dark:text-primary-300 hover:underline">Criar conta</Link>
      </p>
    </form>
  );
}
