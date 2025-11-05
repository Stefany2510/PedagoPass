import type { Metadata } from 'next';
import Link from 'next/link';
import { FilterBar } from '@/components/FilterBar';
import { CommunityCard } from '@/components/community-card';
import { EmptyState } from '@/components/EmptyState';
import { COMMUNITIES } from '@/data/communities';

const COMMUNITIES_PER_PAGE = 9;
const SORT_VALUES = ['populares', 'recentes', 'az'] as const;

type SortValue = (typeof SORT_VALUES)[number];

type ComunidadesPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export const metadata: Metadata = {
  title: 'Comunidades | PedagoPass',
  description:
    'Encontre comunidades temáticas de educadores viajantes, filtre por interesses e entre em grupos para trocar experiências.',
};

type Community = (typeof COMMUNITIES)[number];

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .toLowerCase()
    .trim();

const tokenize = (value: string) => normalizeText(value).split(/\s+/).filter(Boolean);

const formatSort = (value: string | undefined): SortValue => {
  if (SORT_VALUES.includes(value as SortValue)) {
    return value as SortValue;
  }
  return 'populares';
};

const normalizeTags = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((entry) => entry.split(',')).filter(Boolean);
  }
  return value.split(',').filter(Boolean);
};

const filterByQuery = (value: string, target: Community) => {
  if (!value.trim()) return true;
  const queryTokens = tokenize(value).filter(Boolean);
  if (!queryTokens.length) return true;

  const targetTokens = Array.from(
    new Set([
      ...tokenize(target.nome),
      ...tokenize(target.descricao ?? ''),
      ...tokenize(target.slug),
      ...target.tags.flatMap((tag) => tokenize(tag)),
    ])
  );

  return queryTokens.every((token) =>
    targetTokens.some((candidate) => candidate.startsWith(token))
  );
};

const filterByTags = (selectedTags: string[], targetTags: string[]) => {
  if (!selectedTags.length) return true;
  const normalizedTarget = targetTags.map((tag) => normalizeText(tag));
  return selectedTags.every((tag) => normalizedTarget.includes(normalizeText(tag)));
};

const sortCommunities = (sort: SortValue) => {
  switch (sort) {
    case 'populares':
      return (a: Community, b: Community) => b.membros - a.membros;
    case 'recentes':
      return (a: Community, b: Community) => a.membros - b.membros;
    case 'az':
    default:
      return (a: Community, b: Community) => a.nome.localeCompare(b.nome, 'pt-BR');
  }
};

export default async function ComunidadesPage({ searchParams }: ComunidadesPageProps) {
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const selectedTags = normalizeTags(searchParams.tags);
  const sort = formatSort(typeof searchParams.sort === 'string' ? searchParams.sort : undefined);

  const currentPageParam = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const currentPage = Math.max(parseInt(currentPageParam ?? '1', 10) || 1, 1);

  // Usa os dados locais diretamente para evitar chamadas HTTP internas
  const communities: Community[] = COMMUNITIES;
  const allTags = Array.from(new Set(communities.flatMap((community) => community.tags)));

  const filtered = communities.filter((community) => {
    return filterByQuery(query, community) && filterByTags(selectedTags, community.tags);
  }).sort(sortCommunities(sort));

  const totalPages = filtered.length ? Math.ceil(filtered.length / COMMUNITIES_PER_PAGE) : 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * COMMUNITIES_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + COMMUNITIES_PER_PAGE);

  const baseQuery = {
    ...(query ? { q: query } : {}),
    ...(selectedTags.length ? { tags: selectedTags.join(',') } : {}),
    ...(sort ? { sort } : {}),
  } satisfies Record<string, string>;

  const makePageQuery = (page: number) => ({
    ...baseQuery,
    ...(page > 1 ? { page: page.toString() } : {}),
  });

  return (
    <div className="container-max py-12">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Comunidades</h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
          Descubra grupos de educadoras e educadores que planejam viagens pedagógicas, compartilham materiais e fazem
          conexões pelo Brasil.
        </p>
      </header>

      {/* Pré-visualização agora é controlada dentro do FilterBar pela busca */}

      <div className="mt-8">
        <FilterBar query={query} selectedTags={selectedTags} sort={sort} availableTags={allTags} />
      </div>

      <section className="mt-10">
        <h2 className="sr-only">Lista de comunidades</h2>
        {paginated.length === 0 ? (
          <EmptyState
            title="Nenhum resultado encontrado para seus filtros"
            description="Ajuste a busca ou selecione outras tags para continuar explorando."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {paginated.map((community) => (
              <CommunityCard key={community.slug} c={community} />
            ))}
          </div>
        )}
      </section>

      {paginated.length > 0 && totalPages > 1 && (
        <nav className="mt-12 flex flex-wrap items-center justify-between gap-4" aria-label="Paginação de comunidades">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Página {safePage} de {totalPages}
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              const isActive = pageNumber === safePage;
              return (
                <Link
                  key={pageNumber}
                  href={{ pathname: '/comunidades', query: makePageQuery(pageNumber) }}
                  className={`
                    inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
                    dark:focus-visible:ring-offset-slate-900
                    ${
                      isActive
                        ? 'border-primary-500 bg-primary-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-primary-400 hover:text-primary-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-primary-400 dark:hover:text-primary-200'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {pageNumber}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
