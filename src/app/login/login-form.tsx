"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { apiResetPasswordLookup, apiResetPasswordUpdate } from "@/lib/api";

type LoginFormProps = {
  nextPath?: string;
};

export default function LoginForm({ nextPath = "/perfil" }: LoginFormProps) {
  const { user, login } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "resetEmail" | "resetPassword">("login");

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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await login(email, senha);
        if (!res.ok) {
          setError(res.error ?? "Não foi possível entrar.");
          return;
        }
        router.push(nextPath);
        return;
      }

      if (mode === "resetEmail") {
        const result = await apiResetPasswordLookup(email);
        if (!result.found) {
          setError("Não encontramos nenhuma conta com este e-mail.");
          return;
        }
        setMode("resetPassword");
        setInfo("Conta encontrada! Defina a nova senha para continuar.");
        setShowResetPassword(false);
        return;
      }

      if (newPassword.trim().length < 6) {
        setError("A nova senha deve ter ao menos 6 caracteres.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("As senhas digitadas não conferem.");
        return;
      }
      await apiResetPasswordUpdate({ email, senha: newPassword });
      setInfo("Senha atualizada! Use a nova senha para entrar.");
      setMode("login");
      setSenha(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      setShowResetPassword(false);
    } catch (err: any) {
      const message = err?.data?.error || err?.message || "Não foi possível concluir a solicitação.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function onDemo() {
    if (!demo) return;
    setError(null);
    setInfo(null);
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
      {info && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/30 dark:text-emerald-200">
          {info}
        </div>
      )}
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus-ring"
            placeholder="voce@escola.com"
            readOnly={mode === "resetPassword"}
          />
        </div>

        {mode === "login" && (
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium mb-1" htmlFor="senha">Senha</label>
              <button type="button" onClick={()=>setShow(s=>!s)} className="text-sm text-primary-700 dark:text-primary-300 hover:underline">{show?"Ocultar":"Mostrar"}</button>
            </div>
            <input
              id="senha"
              type={show?"text":"password"}
              required
              minLength={6}
              value={senha}
              onChange={(e)=>setSenha(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus-ring"
              placeholder="Sua senha"
            />
          </div>
        )}

        {mode === "resetPassword" && (
          <>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium mb-1" htmlFor="nova-senha">Nova senha</label>
                <button type="button" onClick={()=>setShowResetPassword(s=>!s)} className="text-sm text-primary-700 dark:text-primary-300 hover:underline">{showResetPassword?"Ocultar":"Mostrar"}</button>
              </div>
              <input
                id="nova-senha"
                type={showResetPassword?"text":"password"}
                required
                minLength={6}
                value={newPassword}
                onChange={(e)=>setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus-ring"
                placeholder="Digite a nova senha"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="confirmar-senha">Confirmar nova senha</label>
              <input
                id="confirmar-senha"
                type={showResetPassword?"text":"password"}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus-ring"
                placeholder="Repita a nova senha"
              />
            </div>
          </>
        )}

        <button disabled={loading} className="mt-2 inline-flex items-center justify-center rounded-lg bg-primary-600 text-white px-4 py-2 hover:bg-primary-700 focus-ring disabled:opacity-60 disabled:cursor-not-allowed">
          {mode === "login" ? (loading?"Entrando…":"Entrar") : mode === "resetEmail" ? (loading?"Verificando…":"Continuar") : (loading?"Salvando…":"Salvar nova senha")}
        </button>

        {mode === "login" && demo && (
          <button
            type="button"
            onClick={onDemo}
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center rounded-lg border border-primary-300 text-primary-700 px-4 py-2 hover:bg-primary-50 focus-ring disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading?"Entrando…":"Entrar com conta demo"}
          </button>
        )}

        {mode === "login" ? (
          <button
            type="button"
            onClick={() => {
              setMode("resetEmail");
              setError(null);
              setInfo("Informe o e-mail cadastrado para redefinir sua senha.");
              setLoading(false);
            }}
            className="mt-2 text-sm text-primary-700 dark:text-primary-300 hover:underline text-left"
          >
            Esqueci minha senha
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setInfo(null);
              setNewPassword("");
              setConfirmPassword("");
              setShowResetPassword(false);
            }}
            className="mt-2 text-sm text-primary-700 dark:text-primary-300 hover:underline text-left"
          >
            Voltar para login
          </button>
        )}
      </div>
      {mode === "login" && (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Não tem conta? <Link href="/cadastro" className="text-primary-700 dark:text-primary-300 hover:underline">Criar conta</Link>
        </p>
      )}
    </form>
  );
}
