
import { DESTINOS } from "@/data/destinations";
import { DestinationCard } from "@/components/destination-card";

export const metadata = { title: "Destinos", description: "Pacotes educativos com hospedagens reais e atividades." };

export default function Page() {
  return (
    <div className="container-max py-10">
      <h1 className="text-3xl font-bold">Destinos</h1>
      <p className="text-slate-600 dark:text-slate-300 mt-2">Escolha um pacote e faça sua reserva.</p>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {DESTINOS.map(d => <DestinationCard d={d} key={d.slug} />)}
      </div>
    </div>
  );
}
