
import Link from "next/link";
import { HeroCommunities } from "@/components/hero-communities";
import { COMMUNITIES } from "@/data/communities";
import { CommunityCard } from "@/components/community-card";
import { DESTINOS } from "@/data/destinations";

export default function Page() {
  const destaques = DESTINOS.filter(d=>d.destaque).slice(0,4);
  return (
    <div>
      <HeroCommunities />

      <section className="container-max py-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Comunidades em destaque</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1">Conecte-se e troque experiências com outros educadores.</p>
          </div>
          <Link href="/comunidades" className="text-sm px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 border border-primary-100 hover:bg-primary-100/50 dark:bg-slate-900 dark:text-primary-300 dark:border-slate-700">Ver todas</Link>
        </div>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COMMUNITIES.map(c => <CommunityCard key={c.slug} c={c} />)}
        </div>
      </section>

      <section className="container-max py-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Descubra destinos educativos</h3>
              <p className="text-slate-600 dark:text-slate-300">Quando quiser planejar a viagem, veja os pacotes com hospedagens reais.</p>
            </div>
            <Link href="/destinos" className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">Ver destinos</Link>
          </div>
          <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            {destaques.map(d => (
              <li key={d.slug} className="flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
                <span>{d.nome}</span>
                <Link href={`/destinos/${d.slug}`} className="text-primary-600 hover:underline">ver</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
