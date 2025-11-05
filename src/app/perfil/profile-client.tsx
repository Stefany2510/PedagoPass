"use client";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { apiChangePassword, apiGetMyReservations, apiGetMyOrders, apiMarkReservationPaid, apiUpdateReservationStatus, apiGetOrderByReservationId, type Reservation, type Order } from "@/lib/api";
import { formatBRL } from "@/lib/utils";

export default function ProfileClient() {
  const { user, logout, memberships, leaveCommunity: leaveCommunityCtx, refreshMemberships, avatarUrl, updateAvatar, clearAvatar } = useAuth();
  const [reservas, setReservas] = useState<Reservation[]>([]);
  const [compras, setCompras] = useState<Order[]>([]);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"todos" | "pendente" | "confirmada" | "cancelada">("todos");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [openPwd, setOpenPwd] = useState(false);
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confPwd, setConfPwd] = useState("");
  const [pwdErr, setPwdErr] = useState<string | null>(null);
  const [pwdOk, setPwdOk] = useState<string | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  useEffect(() => {
    if (!user) {
      setReservas([]);
      setCompras([]);
      return;
    }

    apiGetMyReservations().then(setReservas);
    apiGetMyOrders().then(setCompras);
    refreshMemberships();
  }, [user, refreshMemberships]);

  if (!user) {
    return (
      <div className="mt-6 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft-md text-center">
        <h2 className="text-xl font-semibold">Acesso necessário</h2>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Você precisa entrar para ver seu perfil.</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Link href="/login" className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus-ring">Entrar</Link>
          <Link href="/cadastro" className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 focus-ring">Criar conta</Link>
        </div>
      </div>
    );
  }

  const initials = user.nome.split(" ").map(n=>n[0]).slice(0,2).join("");
  const joined = new Date(user.createdAt).toLocaleDateString();

  function refreshData() {
    if (!user) return;
  apiGetMyReservations().then(setReservas);
  apiGetMyOrders().then(setCompras);
    refreshMemberships();
  }

  return (
    <section className="mt-6 space-y-6">
      {/* Card principal */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft-md">
        <div className="bg-hero-gradient/40 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="relative inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary-600 text-white text-lg font-semibold">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={`Foto de perfil de ${user.nome}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                ) : (
                  initials || user.nome[0]
                )}
              </span>
              <div className="flex flex-col items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:border-primary-400 hover:text-primary-700 focus-ring dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  disabled={avatarLoading}
                >
                  {avatarLoading ? "Carregando…" : avatarUrl ? "Trocar foto" : "Adicionar foto"}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) return;
                      clearAvatar();
                      setAvatarMsg({ type: "success", text: "Foto removida." });
                      setTimeout(() => setAvatarMsg(null), 2500);
                    }}
                    className="rounded-md px-2 py-1 text-xs text-slate-500 transition hover:text-red-600 focus-ring"
                  >
                    Remover
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) {
                      setAvatarMsg({ type: "error", text: "Envie uma imagem de até 2MB." });
                      setTimeout(() => setAvatarMsg(null), 2500);
                      event.target.value = "";
                      return;
                    }
                    setAvatarLoading(true);
                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = typeof reader.result === "string" ? reader.result : null;
                      if (result) {
                        if (user) updateAvatar(result);
                        setAvatarMsg({ type: "success", text: "Foto atualizada!" });
                      } else {
                        setAvatarMsg({ type: "error", text: "Não foi possível carregar a imagem." });
                      }
                      setAvatarLoading(false);
                      setTimeout(() => setAvatarMsg(null), 2500);
                      event.target.value = "";
                    };
                    reader.onerror = () => {
                      setAvatarLoading(false);
                      setAvatarMsg({ type: "error", text: "Erro ao ler o arquivo." });
                      setTimeout(() => setAvatarMsg(null), 2500);
                      event.target.value = "";
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl font-semibold truncate">{user.nome}</div>
              <div className="mt-0.5 text-sm text-slate-700 dark:text-slate-300 truncate flex items-center gap-2">
                <span className="truncate">{user.email}</span>
                <button
                  type="button"
                  onClick={() => copyEmail(user.email)}
                  className="rounded-md px-2 py-0.5 text-xs border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 focus-ring"
                >
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 px-3 py-1 text-xs text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-900/40">
                <span className="h-2 w-2 rounded-full bg-primary-600 inline-block" />
                Membro desde {joined}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/comunidades" className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus-ring">Comunidades</Link>
              <Link href="/destinos" className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 focus-ring">Destinos</Link>
              <button onClick={logout} className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white focus-ring">Sair</button>
            </div>
          </div>
          {avatarMsg && (
            <div
              className={`mt-4 rounded-xl border px-3 py-2 text-xs sm:ml-[4.5rem] ${
                avatarMsg.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200"
                  : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200"
              }`}
            >
              {avatarMsg.text}
            </div>
          )}
        </div>
      </div>

      {/* Seção ações rápidas */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/comunidades" className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 focus-ring shadow-soft-md">
          <div className="font-semibold">Minhas comunidades</div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">Veja e participe de discussões com professores.</div>
        </Link>
        <Link href="/destinos" className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 focus-ring shadow-soft-md">
          <div className="font-semibold">Explorar destinos</div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">Descubra lugares para sua próxima viagem.</div>
        </Link>
      </div>

      {/* Minhas comunidades */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft-md">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="font-semibold">Minhas comunidades</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Grupos dos quais você participa.</div>
          </div>
          <Link href="/comunidades" className="text-sm underline">Explorar</Link>
        </div>
        <div className="p-5">
          {memberships.length === 0 ? (
            <div className="text-sm text-slate-600 dark:text-slate-400">Você ainda não participa de nenhuma comunidade. <Link className="underline" href="/comunidades">Conheça as comunidades</Link>.</div>
          ) : (
            <ul className="space-y-4">
              {memberships.map(c => (
                <li key={c.slug} className="flex items-center gap-4">
                  {c.capa && (
                    <div className="relative h-12 w-20 overflow-hidden rounded-md flex-shrink-0">
                      <Image src={c.capa} alt={c.nome} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{c.nome}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 truncate">{c.tags.join(' • ')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/comunidades/${c.slug}`} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 focus-ring text-sm">Ver</Link>
                    <button
                      onClick={() => {
                        if (!user) return;
                        const res = leaveCommunityCtx(c.slug);
                        if (res.ok) {
                          setActionMsg(`Você saiu de ${c.nome}.`);
                          refreshMemberships();
                          setTimeout(()=>setActionMsg(null), 2000);
                        } else if (res.error) {
                          setActionMsg(res.error);
                          setTimeout(()=>setActionMsg(null), 2000);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white focus-ring text-sm"
                    >Sair</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {actionMsg && <div className="px-5 pb-5 -mt-2 text-sm text-emerald-700 dark:text-emerald-300">{actionMsg}</div>}
      </div>

      {/* Minhas reservas */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft-md">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="font-semibold">Minhas reservas</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Acompanhe suas solicitações e status.</div>
            </div>
            <div className="flex items-end gap-2 text-sm">
              <div>
                <label className="block text-xs mb-1">Status</label>
                <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)} className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1">
                  <option value="todos">Todos</option>
                  <option value="pendente">Pendente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Ida de</label>
                <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1" />
              </div>
              <div>
                <label className="block text-xs mb-1">até</label>
                <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-5">
          {reservas.length === 0 ? (
            <div className="text-sm text-slate-600 dark:text-slate-400">Você ainda não tem reservas. Explore os <Link href="/destinos" className="underline">destinos</Link> e envie um pedido.</div>
          ) : (
            <ul className="space-y-4">
              {reservas
                .filter(r => statusFilter === "todos" ? true : r.status === statusFilter)
                .filter(r => {
                  const ida = r.ida;
                  if (fromDate && ida < fromDate) return false;
                  if (toDate && ida > toDate) return false;
                  return true;
                })
                .map(r => (
                <li key={r.id} className="flex gap-4 items-center">
                  {r.destinoImagem && (
                    <div className="relative h-16 w-24 overflow-hidden rounded-md flex-shrink-0">
                      <Image src={r.destinoImagem} alt={r.destinoNome} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-medium truncate">{r.destinoNome}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 capitalize">{r.status}</span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      {new Date(r.ida).toLocaleDateString()} → {new Date(r.volta).toLocaleDateString()} • {r.pessoas} {r.pessoas > 1 ? "pessoas" : "pessoa"}
                    </div>
                    <div className="text-sm mt-0.5"><span className="text-slate-500">Total estimado:</span> <span className="font-medium">{formatBRL(r.totalEstimado)}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/destinos/${r.destinoSlug}`} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 focus-ring text-sm">Ver destino</Link>
                    {r.status === "pendente" && (
                      <>
                        <button
                          onClick={() => {
                            apiMarkReservationPaid({ reservationId: r.id, metodo: "PIX" }).then(()=>{
                              setActionMsg("Reserva confirmada e compra registrada.");
                              refreshData();
                              setTimeout(()=>setActionMsg(null), 2000);
                            }).catch(()=>{})
                          }}
                          className="px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus-ring text-sm"
                        >Marcar como pago</button>
                        <button
                          onClick={() => { apiUpdateReservationStatus(r.id, "cancelada").then(()=>{ setActionMsg("Reserva cancelada."); refreshData(); setTimeout(()=>setActionMsg(null), 2000); }).catch(()=>{}); }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 focus-ring text-sm"
                        >Cancelar</button>
                      </>
                    )}
                    {r.status === "confirmada" && (()=>{ /* tenta pegar o orderId de forma assíncrona */ return (
                      <AsyncOrderLink reservationId={r.id} />
                    ); })()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {actionMsg && <div className="px-5 pb-5 -mt-2 text-sm text-emerald-700 dark:text-emerald-300">{actionMsg}</div>}
      </div>

      {/* Histórico de compras */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft-md">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="font-semibold">Histórico de compras</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Pagamentos registrados para suas viagens.</div>
        </div>
        <div className="p-5">
          {compras.length === 0 ? (
            <div className="text-sm text-slate-600 dark:text-slate-400">Nenhuma compra registrada ainda.</div>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {compras.map(c => (
                <li key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.destinoNome}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Pago em {new Date(c.pagoEm).toLocaleDateString()} • {c.metodo}{c.parcelas ? ` (${c.parcelas}x)` : ""}</div>
                  </div>
                  <div className="font-semibold">{formatBRL(c.total)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Segurança - Trocar senha */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft-md">
        <div className="flex items-center justify-between p-5">
          <div>
            <div className="font-semibold">Segurança</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Altere sua senha de acesso.</div>
          </div>
          <button
            type="button"
            onClick={() => setOpenPwd((v) => !v)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 focus-ring"
            aria-expanded={openPwd}
          >
            {openPwd ? "Fechar" : "Trocar senha"}
          </button>
        </div>
        {openPwd && (
          <div className="p-5 pt-0">
            {pwdErr && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">{pwdErr}</div>
            )}
            {pwdOk && (
              <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">{pwdOk}</div>
            )}
            <div className="grid gap-4 max-w-lg">
              <div>
                <label htmlFor="cur" className="block text-sm font-medium mb-1">Senha atual</label>
                <input id="cur" type="password" value={curPwd} onChange={(e)=>setCurPwd(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus-ring" />
              </div>
              <div>
                <label htmlFor="new" className="block text-sm font-medium mb-1">Nova senha</label>
                <input id="new" type="password" value={newPwd} onChange={(e)=>setNewPwd(e.target.value)} minLength={6} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus-ring" placeholder="Mínimo 6 caracteres" />
              </div>
              <div>
                <label htmlFor="conf" className="block text-sm font-medium mb-1">Confirmar nova senha</label>
                <input id="conf" type="password" value={confPwd} onChange={(e)=>setConfPwd(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus-ring" />
              </div>
              <div className="flex gap-2">
                <button
                  disabled={pwdLoading}
                  onClick={async ()=>{
                    setPwdErr(null); setPwdOk(null);
                    if (!curPwd || !newPwd) { setPwdErr("Preencha os campos."); return; }
                    if (newPwd.length < 6) { setPwdErr("A nova senha deve ter ao menos 6 caracteres."); return; }
                    if (newPwd !== confPwd) { setPwdErr("As senhas não coincidem."); return; }
                    setPwdLoading(true);
                    try {
                      await apiChangePassword({ current: curPwd, next: newPwd });
                    } catch (e: any) {
                      setPwdLoading(false);
                      setPwdErr(e?.data?.error || e?.message || "Falha ao alterar a senha.");
                      return;
                    }
                    setPwdLoading(false);
                    setPwdOk("Senha alterada com sucesso.");
                    setCurPwd(""); setNewPwd(""); setConfPwd("");
                  }}
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus-ring disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {pwdLoading ? "Salvando…" : "Salvar nova senha"}
                </button>
                <button type="button" onClick={()=>{ setOpenPwd(false); setCurPwd(""); setNewPwd(""); setConfPwd(""); setPwdErr(null); setPwdOk(null); }} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 focus-ring">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function AsyncOrderLink({ reservationId }: { reservationId: string }) {
  const [orderId, setOrderId] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    (async () => {
      const o = await apiGetOrderByReservationId(reservationId);
      if (active) setOrderId(o?.id ?? null);
    })();
    return () => { active = false; };
  }, [reservationId]);
  if (!orderId) return null;
  return <Link href={`/perfil/comprovante/${orderId}`} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 focus-ring text-sm">Comprovante</Link>;
}
