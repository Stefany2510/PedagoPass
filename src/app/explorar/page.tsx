
import type { Metadata } from 'next';
import { ExplorerFeed, type ExplorerPost } from './explorer-feed';
import { COMMUNITY_POSTS } from '@/data/communityPosts';
import { COMMUNITIES } from '@/data/communities';

export const metadata: Metadata = {
  title: 'Explorar | PedagoPass',
  description: 'Veja um feed estilo Threads com as conversas mais recentes entre educadores e descubra novas comunidades.',
};

function buildInitialPosts(): ExplorerPost[] {
  const communityMap = new Map(COMMUNITIES.map((community) => [community.slug, community]));
  const flattened: ExplorerPost[] = [];

  for (const [slug, posts] of Object.entries(COMMUNITY_POSTS)) {
    const community = communityMap.get(slug);
    posts.forEach((post) => {
      flattened.push({
        ...post,
        communitySlug: slug,
        communityNome: community?.nome ?? slug,
        communityCapa: community?.capa,
      });
    });
  }

  return flattened.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function buildSuggestions() {
  return [...COMMUNITIES]
    .sort((a, b) => b.membros - a.membros)
    .slice(0, 6)
    .map((community) => ({
      slug: community.slug,
      nome: community.nome,
      descricao: community.descricao,
      membros: community.membros,
      capa: community.capa,
    }));
}

export default function ExplorePage() {
  const initialPosts = buildInitialPosts();
  const suggestions = buildSuggestions();

  return (
    <div className="container-max space-y-10 py-12">
      <header className="max-w-3xl space-y-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">Explorar</span>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            Descubra o que educadores estão compartilhando agora
          </h1>
        </div>
        <p className="text-base text-slate-600 dark:text-slate-300">
          Acompanhe relatos de viagens pedagógicas, dicas de planejamento e perguntas rápidas. Siga comunidades, filtre por tags
          e participe das conversas no estilo Threads.
        </p>
      </header>

      <ExplorerFeed initialPosts={initialPosts} suggestedCommunities={suggestions} />
    </div>
  );
}
