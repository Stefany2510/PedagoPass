import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CommunityClient } from './community-client';
import { COMMUNITY_POSTS } from '@/data/communityPosts';
import { COMMUNITIES } from '@/data/communities';

const POSTS_PER_PAGE = 10;

type PageProps = {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
};

type Community = (typeof COMMUNITIES)[number];

async function fetchCommunity(slug: string): Promise<Community | null> {
  const community = COMMUNITIES.find((c) => c.slug === slug) || null;
  return community;
}

const createAboutSections = (community: Community): string[] => {
  const listFormat = new Intl.ListFormat('pt-BR', { style: 'long', type: 'conjunction' });
  const focusTopics = community.tags.slice(0, 3);
  const topics = focusTopics.length ? listFormat.format(focusTopics) : 'diversos temas';

  return [
    community.descricao,
    `Nesta comunidade, educadoras e educadores trocam experiências sobre ${topics}, compartilham materiais de apoio e indicam roteiros testados em sala de aula.`,
    'Participe para acompanhar encontros ao vivo, receber modelos de atividades e divulgar suas próprias iniciativas com a turma.',
  ];
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const community = await fetchCommunity(params.slug);

  if (!community) {
    return {
      title: 'Comunidade não encontrada | PedagoPass',
    };
  }

  return {
    title: `${community.nome} | PedagoPass`,
    description: community.descricao,
  };
}

export default async function CommunityPage({ params, searchParams }: PageProps) {
  const community = await fetchCommunity(params.slug);

  if (!community) {
    notFound();
  }

  const initialPosts = COMMUNITY_POSTS[community.slug] ?? [];
  const pageParam = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const initialPage = Math.max(parseInt(pageParam ?? '1', 10) || 1, 1);
  const aboutSections = createAboutSections(community);

  return (
    <div className="container-max py-12">
      <CommunityClient
        community={community}
        initialPosts={initialPosts}
        initialPage={initialPage}
        postsPerPage={POSTS_PER_PAGE}
        aboutSections={aboutSections}
      />
    </div>
  );
}
