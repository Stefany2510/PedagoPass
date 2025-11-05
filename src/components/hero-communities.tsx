
import Link from "next/link";
export function HeroCommunities() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      <div className="container-max py-16 md:py-20">
        <div className="max-w-3xl">
          <span className="text-sm uppercase tracking-widest text-primary-700 dark:text-primary-300">Comunidades</span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-bold leading-tight">Networking entre professores
            <span className="text-primary-600"> que viajam e ensinam</span></h1>
          <p className="mt-3 text-slate-700 dark:text-slate-300">Junte-se a grupos temáticos para trocar roteiros, materiais e práticas. Planeje viagens que viram aula — com o apoio de quem já foi.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/comunidades" className="px-5 py-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700">Explorar comunidades</Link>
            <Link href="/cadastro" className="px-5 py-2.5 rounded-lg border border-primary-200 text-primary-700 hover:bg-primary-50 dark:border-slate-700 dark:text-primary-300 dark:hover:bg-slate-900">Criar conta</Link>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 -bottom-10 h-24 bg-gradient-to-t from-white dark:from-slate-950 to-transparent" />
    </section>
  );
}
