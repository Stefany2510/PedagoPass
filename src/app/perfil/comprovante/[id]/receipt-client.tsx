"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiGetOrderById, apiGetReservationById } from "@/lib/api";
import { DESTINOS } from "@/data/destinations";
import { formatBRL } from "@/lib/utils";

export default function ReceiptClient({ id }: { id: string }){
  const [notFound, setNotFound] = useState(false);
  const [order, setOrder] = useState<Awaited<ReturnType<typeof apiGetOrderById>>>(null);
  const [reservation, setReservation] = useState<Awaited<ReturnType<typeof apiGetReservationById>>>(null);
  const destino = useMemo(()=> DESTINOS.find(d => d.slug === order?.destinoSlug), [order]);

  useEffect(()=>{
    (async () => {
      const byOrder = await apiGetOrderById(id);
      if (byOrder) {
        setOrder(byOrder);
        if (byOrder.reservationId) {
          const r = await apiGetReservationById(byOrder.reservationId);
          setReservation(r);
        }
      } else {
        // fallback: talvez o link veio com reservationId
        const r = await apiGetReservationById(id);
        if (r) {
          setReservation(r);
          // tentar localizar order mais recente do user para este reservationId (não temos endpoint dedicado; opcional)
        }
      }
    })();
  }, [id]);

  useEffect(()=>{ setNotFound(!order && !reservation); }, [order, reservation]);

  if (notFound) {
    return (
      <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-soft-md">
        <h1 className="text-2xl font-bold">Comprovante</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Compra não encontrada.</p>
        <div className="mt-4"><Link className="px-4 py-2 rounded-lg bg-primary-600 text-white" href="/perfil">Voltar ao perfil</Link></div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-soft-md print:shadow-none">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Comprovante de pagamento</h1>
          <p className="text-slate-600 dark:text-slate-400">ID: {order!.id}</p>
        </div>
        <button onClick={()=>window.print()} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 focus-ring">Imprimir</button>
      </div>
      <div className="p-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <div className="flex gap-3 items-center">
            {destino?.imagem && (
              <div className="relative h-16 w-24 overflow-hidden rounded-md">
                <Image src={destino.imagem} alt={order!.destinoNome} fill className="object-cover" />
              </div>
            )}
            <div>
              <div className="text-lg font-semibold">{order!.destinoNome}</div>
              {reservation && (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {new Date(reservation.ida).toLocaleDateString()} → {new Date(reservation.volta).toLocaleDateString()} • {reservation.pessoas} {reservation.pessoas>1?"pessoas":"pessoa"}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="text-slate-600 dark:text-slate-400 text-sm">Método de pagamento</div>
            <div className="font-medium">{order?.metodo ?? "-"}{order?.parcelas ? ` (${order?.parcelas}x)` : ""}</div>
            <div className="text-slate-600 dark:text-slate-400 text-sm mt-2">Pago em</div>
            <div className="font-medium">{order ? new Date(order.pagoEm).toLocaleString() : "-"}</div>
          </div>

          {destino?.inclusos && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="text-slate-600 dark:text-slate-400 text-sm">Inclusos no pacote</div>
              <div className="text-sm">{destino.inclusos.join(" · ")}</div>
            </div>
          )}
        </div>
        <div className="md:col-span-1">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="text-slate-600 dark:text-slate-400 text-sm">Total pago</div>
            <div className="text-2xl font-bold">{formatBRL(order?.total ?? reservation?.totalEstimado ?? 0)}</div>
            <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">Este documento serve como comprovante de pagamento para fins de prestação de contas escolares.</div>
          </div>
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            <Link href="/perfil" className="underline">Voltar ao perfil</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
