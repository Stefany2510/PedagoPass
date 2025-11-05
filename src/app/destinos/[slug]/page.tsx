
import Image from "next/image";
import { DESTINOS } from "@/data/destinations";
import { ReservationForm } from "@/components/reservation-form";
import { formatBRL } from "@/lib/utils";

type Props = { params: { slug: string } };

export function generateStaticParams() { return DESTINOS.map(d => ({ slug: d.slug })); }

export default function Page({ params }: Props) {
  const d = DESTINOS.find(x => x.slug === params.slug);
  if (!d) return <div className="container-max py-10">Destino não encontrado.</div>;

  return (
    <div className="container-max py-10">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative h-80 w-full overflow-hidden rounded-2xl">
          <Image src={d.imagem} alt={d.nome} fill className="object-cover" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{d.nome} <span className="text-slate-500">– {d.estado}</span></h1>
          <p className="mt-2 text-slate-700 dark:text-slate-300">{d.descricao}</p>
          <div className="mt-4">
            <h4 className="font-semibold">Atrações</h4>
            <ul className="list-disc ml-5 text-slate-700 dark:text-slate-300">
              {d.atracoes.map(a => <li key={a}>{a}</li>)}
            </ul>
          </div>
          <div className="mt-4">
            <h4 className="font-semibold">Hospedagem</h4>
            <p className="text-slate-700 dark:text-slate-300">{d.hospedagem.join(", ")}</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
              <div className="text-slate-500">Dias</div>
              <div className="font-semibold">{d.dias}</div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
              <div className="text-slate-500">Preço</div>
              <div className="font-semibold">{formatBRL(d.preco)}</div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
              <div className="text-slate-500">Pagamento</div>
              <div className="font-semibold">{d.pagamento}</div>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-semibold">Inclusos</h4>
            <p className="text-slate-700 dark:text-slate-300">{d.inclusos.join(" · ")}</p>
          </div>
        </div>
      </div>

      <div id="reserva" className="mt-10">
        <h2 className="text-2xl font-bold">Solicitar reserva</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">Preencha seus dados e retornaremos com a confirmação.</p>
        <ReservationForm destinoSlug={d.slug} />
      </div>
    </div>
  );
}
