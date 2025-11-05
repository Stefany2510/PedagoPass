'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { COMMUNITIES } from '@/data/communities';

const SORT_OPTIONS = [
  { value: 'populares', label: 'Mais populares' },
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'az', label: 'A-Z' },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

type FilterBarProps = {
  query: string;
  selectedTags: string[];
  sort: SortValue;
  availableTags: string[];
};

export function FilterBar({ query, selectedTags, sort, availableTags }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const orderedTags = useMemo(() => [...availableTags].sort((a, b) => a.localeCompare(b, 'pt-BR')), [availableTags]);

  const applyParams = (params: URLSearchParams) => {
    params.delete('page');
    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    });
  };

  const upsertParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (value && value.trim().length > 0) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    applyParams(params);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localQuery !== query) {
        upsertParam('q', localQuery.trim() ? localQuery.trim() : null);
      }
    }, 350);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQuery]);

  const handleTagToggle = (tag: string) => {
    const nextTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    upsertParam('tags', nextTags.length ? nextTags.join(',') : null);
  };

  const handleSortChange = (value: SortValue) => {
    if (value !== sort) {
      upsertParam('sort', value);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    upsertParam('q', localQuery.trim() ? localQuery.trim() : null);
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.delete('q');
    params.delete('tags');
    params.delete('sort');
    applyParams(params);
    setLocalQuery('');
  };

  const matchedCommunity = useMemo(() => {
    const q = localQuery.trim().toLowerCase();
    if (!q) return null;
    return (
      COMMUNITIES.find(
        (c) => c.nome.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q) || c.descricao.toLowerCase().includes(q)
      ) || null
    );
  }, [localQuery]);

  const previewSrc = matchedCommunity?.capa;

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-busy={pending}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Coluna esquerda: Preview + busca */}
        <div className="space-y-4">
          <div className="relative h-40 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 md:h-56">
            {previewSrc ? (
              <Link
                href={`/comunidades/${matchedCommunity!.slug}`}
                className="group/link block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                aria-label={`Ir para a comunidade ${matchedCommunity!.nome}`}
                title={`Abrir comunidade ${matchedCommunity!.nome}`}
              >
                <Image
                  src={previewSrc}
                  alt={`Capa da comunidade ${matchedCommunity!.nome}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover transition-transform duration-300 group-hover/link:scale-[1.02]"
                  priority={false}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" aria-hidden="true" />
                <div className="pointer-events-none absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white">
                  {matchedCommunity!.nome}
                </div>
              </Link>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                Digite para ver a capa da comunidade
              </div>
            )}
          </div>

          <div>
            <label htmlFor="community-search" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Buscar comunidades
            </label>
            <input
              id="community-search"
              name="q"
              type="search"
              value={localQuery}
              onChange={(event) => setLocalQuery(event.target.value)}
              placeholder="Digite nome ou descrição"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Coluna direita: tags e ordenação */}
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Filtrar por tags</span>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Filtrar por tags">
              {orderedTags.map((tag) => {
                const isActive = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    aria-pressed={isActive}
                    className={clsx(
                      'rounded-full border px-3 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
                      isActive
                        ? 'border-primary-500 bg-primary-100 text-primary-800 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-200'
                        : 'border-slate-200 bg-slate-100 text-slate-700 hover:border-primary-300 hover:text-primary-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-primary-400 dark:hover:text-primary-200'
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-end">
            <div className="sm:col-span-2">
              <label htmlFor="community-sort" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Ordenar por
              </label>
              <select
                id="community-sort"
                value={sort}
                onChange={(event) => handleSortChange(event.target.value as SortValue)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl border border-transparent bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
              >
                Aplicar busca
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-primary-400 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:text-primary-200 dark:focus-visible:ring-offset-slate-900"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
