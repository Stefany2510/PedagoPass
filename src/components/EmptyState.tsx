import type { ReactNode } from 'react';

type EmptyStateProps = {
  title?: string;
  description?: string;
  children?: ReactNode;
};

export function EmptyState({
  title = 'Nenhum resultado encontrado',
  description = 'Tente ajustar os filtros ou refinar a sua busca.',
  children,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      {children && <div className="mt-4 flex justify-center">{children}</div>}
    </div>
  );
}
