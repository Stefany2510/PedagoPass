
export function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 dark:border-slate-800">
      <div className="container-max py-8 text-sm text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} PedagoPass — Viagens educacionais para professores.</p>
        <nav className="flex gap-4">
          <a className="hover:underline" href="/manifest.json">Manifesto</a>
          <a className="hover:underline" href="/politica-privacidade">Privacidade</a>
        </nav>
      </div>
    </footer>
  );
}
