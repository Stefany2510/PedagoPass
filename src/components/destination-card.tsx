
import Image from "next/image";
import Link from "next/link";
import { Destination } from "@/data/destinations";
import { formatBRL } from "@/lib/utils";

export function DestinationCard({ d }: { d: Destination }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-48 w-full">
        <Image src={d.imagem} alt={d.nome} fill className="object-cover group-hover:scale-[1.02] transition" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{d.nome} <span className="text-slate-500">– {d.estado}</span></h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{d.descricao}</p>
        {/* BNCC destacado separadamente */}
        {d.bnccAtividade && (
          <div className="mt-4 rounded-xl border border-primary-100 dark:border-slate-800 bg-primary-50/50 dark:bg-slate-800/40 p-3">
            <div className="text-xs font-semibold text-primary-700 dark:text-primary-300">BNCC — atividade sugerida</div>
            <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{d.bnccAtividade}</div>
            {d.bnccTema && (
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Tema: {d.bnccTema}</div>
            )}
          </div>
        )}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="text-[0.8rem] uppercase tracking-wide text-slate-500">A partir de</div>
            <div className="text-xl font-bold text-primary-700 dark:text-primary-300">{formatBRL(d.preco)}</div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              ≈ {formatBRL(Math.round(d.preco / Math.max(d.dias,1)))} / dia
              {d.pagamento ? <> • {d.pagamento}</> : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs text-slate-600 dark:text-slate-300">
              {d.dias} {d.dias>1?"dias":"dia"}
            </span>
            <Link href={`/destinos/${d.slug}`} className="text-sm px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700">Ver</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
