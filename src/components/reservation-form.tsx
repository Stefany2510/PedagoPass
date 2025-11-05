
"use client";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { apiAddReservation } from "@/lib/api";
import { DESTINOS } from "@/data/destinations";

type Props = { destinoSlug: string };
export function ReservationForm({ destinoSlug }: Props) {
  const { user } = useAuth();
  const [sent, setSent] = useState<null | { ok: boolean; message: string }>(null);

  const destino = DESTINOS.find(d => d.slug === destinoSlug);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const acompanhantes = Number(form.get("acompanha") || 0) || 0;
    const ida = String(form.get("ida") || "");
    const volta = String(form.get("volta") || "");
    const formaPagamento = String(form.get("pagamento") || "");

    if (user && destino) {
      const pessoas = 1 + Math.max(0, acompanhantes);
      const totalEstimado = Math.max(1, Math.floor(pessoas)) * (destino.preco || 0);
      apiAddReservation({
        destinoSlug,
        destinoNome: destino.nome,
        destinoImagem: destino.imagem,
        ida,
        volta,
        pessoas,
        formaPagamento,
        totalEstimado,
      })
        .then(() => setSent({ ok: true, message: `Reserva registrada para ${destino.nome}. Você pode acompanhar em Perfil > Minhas reservas.` }))
        .catch((e: any) => setSent({ ok: false, message: e?.data?.error || e?.message || 'Falha ao registrar reserva.' }));
    } else {
      setSent({ ok: true, message: `Pedido enviado para ${destino?.nome ?? "o destino"}. Entre na sua conta para acompanhar a reserva.` });
    }
  }

  if (sent) return (
    <div className="p-6 rounded-xl border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
      <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">Pedido enviado!</h4>
      <p className="text-sm mt-1 text-green-700 dark:text-green-300">{sent.message}</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><label className="block text-sm mb-1">Nome completo</label><input required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"/></div>
      <div><label className="block text-sm mb-1">E-mail</label><input type="email" required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"/></div>
      <div><label className="block text-sm mb-1">Telefone (WhatsApp)</label><input required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" placeholder="(DDD) 9xxxx-xxxx"/></div>
      <div><label className="block text-sm mb-1">CPF ou Passaporte</label><input required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"/></div>
      <div><label className="block text-sm mb-1">Data de nascimento</label><input type="date" required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"/></div>
      <div><label className="block text-sm mb-1">Nº de acompanhantes</label><input name="acompanha" type="number" min={0} defaultValue={0} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"/></div>
      <div><label className="block text-sm mb-1">Data de ida</label><input name="ida" type="date" required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"/></div>
      <div><label className="block text-sm mb-1">Data de volta</label><input name="volta" type="date" required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"/></div>
      <div className="md:col-span-2"><label className="block text-sm mb-1">Forma de pagamento</label><select name="pagamento" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"><option>Cartão de crédito (até 12x)</option><option>PIX à vista</option><option>Boleto bancário</option></select></div>
      <div className="md:col-span-2"><label className="block text-sm mb-1">Observações</label><textarea rows={4} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" placeholder="Restrições, preferências, necessidades especiais..."/></div>
      <div className="md:col-span-2 flex gap-3"><button className="px-5 py-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700">Enviar pedido</button><span className="text-sm text-slate-600 dark:text-slate-300">Sem cobrança agora.</span></div>
    </form>
  );
}
