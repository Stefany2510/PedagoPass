'use client';

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Community } from '@/data/communities';
import type { Post, PostComment } from '@/data/communityPosts';
import { PostComposer } from '@/components/PostComposer';
import { PostItem } from '@/components/PostItem';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/components/auth-provider';

const numberFormatter = new Intl.NumberFormat('pt-BR');

type CommunityClientProps = {
  community: Community;
  initialPosts: Post[];
  initialPage: number;
  postsPerPage: number;
  aboutSections: string[];
};

type TabKey = 'posts' | 'sobre';

export function CommunityClient({
  community,
  initialPosts,
  initialPage,
  postsPerPage,
  aboutSections,
}: CommunityClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [activeTab, setActiveTab] = useState<TabKey>('posts');
  const [membershipBusy, setMembershipBusy] = useState(false);
  const { user, memberships, joinCommunity: joinCommunityCtx, leaveCommunity: leaveCommunityCtx } = useAuth();

  const currentUserName = user?.nome ?? null;
  const viewerName = currentUserName ?? 'Você';
  const storageKey = useMemo(() => `pp.community.${community.slug}.posts`, [community.slug]);
  const [hydrated, setHydrated] = useState(false);

  const isMember = useMemo(
    () => memberships.some((item) => item.slug === community.slug),
    [memberships, community.slug]
  );

  const pageParam = searchParams.get('page') ?? String(initialPage);
  const currentPageFromUrl = Math.max(parseInt(pageParam, 10) || 1, 1);

  const totalPages = posts.length ? Math.ceil(posts.length / postsPerPage) : 1;
  const currentPage = Math.min(currentPageFromUrl, totalPages);

  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = posts.slice(startIndex, startIndex + postsPerPage);

  useEffect(() => {
    let isActive = true;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Post[];
        if (Array.isArray(parsed) && isActive) {
          setPosts(parsed);
        }
      }
    } catch (error) {
      console.warn('Não foi possível restaurar posts salvos da comunidade.', error);
    } finally {
      if (isActive) setHydrated(true);
    }
    return () => {
      isActive = false;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(posts));
    } catch (error) {
      console.warn('Não foi possível salvar posts da comunidade localmente.', error);
    }
  }, [posts, hydrated, storageKey]);

  const updatePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const handlePostSubmit = (payload: { conteudo: string; tags: string[] }) => {
    const sanitizedTags = payload.tags.filter((tag) => tag.trim().length > 0);
    const newPost: Post = {
      id: `novo-${Date.now()}`,
  autor: viewerName,
      conteudo: payload.conteudo,
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      replies: 0,
      comments: [],
      reaction: null,
      ...(sanitizedTags.length ? { tags: sanitizedTags } : {}),
    };

    setPosts((prev) => [newPost, ...prev]);
    updatePage(1);
  };

  const handlePostReaction = (postId: string, nextReaction: 'like' | 'dislike' | null) => {
    setPosts((prev) => prev.map((post) => {
      if (post.id !== postId) return post;
      const currentReaction = post.reaction ?? null;
      let likes = post.likes;
      let dislikes = post.dislikes ?? 0;

      if (currentReaction === 'like') {
        likes = Math.max(0, likes - 1);
      } else if (currentReaction === 'dislike') {
        dislikes = Math.max(0, dislikes - 1);
      }

      if (nextReaction === 'like') {
        likes += 1;
      } else if (nextReaction === 'dislike') {
        dislikes += 1;
      }

      return {
        ...post,
        likes,
        dislikes,
        reaction: nextReaction,
      };
    }));
  };

  const handleAddComment = (postId: string, content: string) => {
  const commentAuthor = viewerName;
    const newComment: PostComment = {
      id: `${postId}-c-${Date.now()}`,
      autor: commentAuthor,
      conteudo: content,
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      reaction: null,
    };

    setPosts((prev) => prev.map((post) => {
      if (post.id !== postId) return post;
      const nextComments = [newComment, ...(post.comments ?? [])];
      return {
        ...post,
        comments: nextComments,
        replies: nextComments.length,
      };
    }));
  };

  const handleReactComment = (postId: string, commentId: string, nextReaction: 'like' | 'dislike' | null) => {
    setPosts((prev) => prev.map((post) => {
      if (post.id !== postId) return post;
      const nextComments = (post.comments ?? []).map((comment) => {
        if (comment.id !== commentId) return comment;
        const currentReaction = comment.reaction ?? null;
        let likes = comment.likes ?? 0;
        let dislikes = comment.dislikes ?? 0;

        if (currentReaction === 'like') {
          likes = Math.max(0, likes - 1);
        } else if (currentReaction === 'dislike') {
          dislikes = Math.max(0, dislikes - 1);
        }

        if (nextReaction === 'like') {
          likes += 1;
        } else if (nextReaction === 'dislike') {
          dislikes += 1;
        }

        return {
          ...comment,
          likes,
          dislikes,
          reaction: nextReaction,
        };
      });
      return {
        ...post,
        comments: nextComments,
        replies: nextComments.length,
      };
    }));
  };

  const handleEditPost = (postId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const timestamp = new Date().toISOString();
    setPosts((prev) => prev.map((post) => (
      post.id === postId
        ? {
            ...post,
            conteudo: trimmed,
            updatedAt: timestamp,
          }
        : post
    )));
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => {
      const nextPosts = prev.filter((post) => post.id !== postId);
      const nextTotalPages = nextPosts.length ? Math.ceil(nextPosts.length / postsPerPage) : 1;
      const safePage = Math.min(currentPage, nextTotalPages);
      if (safePage !== currentPage) {
        updatePage(safePage);
      }
      return nextPosts;
    });
  };

  const handleEditComment = (postId: string, commentId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const timestamp = new Date().toISOString();
    setPosts((prev) => prev.map((post) => {
      if (post.id !== postId) return post;
      const nextComments = (post.comments ?? []).map((comment) => (
        comment.id === commentId
          ? { ...comment, conteudo: trimmed, updatedAt: timestamp }
          : comment
      ));
      return {
        ...post,
        comments: nextComments,
        replies: nextComments.length,
      };
    }));
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    setPosts((prev) => prev.map((post) => {
      if (post.id !== postId) return post;
      const nextComments = (post.comments ?? []).filter((comment) => comment.id !== commentId);
      return {
        ...post,
        comments: nextComments,
        replies: nextComments.length,
      };
    }));
  };

  const handleMembershipToggle = () => {
    if (membershipBusy) return;
    if (!user) {
      // redirect to login preserving return path
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setMembershipBusy(true);
    const result = isMember
      ? leaveCommunityCtx(community.slug)
      : joinCommunityCtx(community.slug);
    if (!result.ok && result.error) {
      console.warn(result.error);
    }
    setMembershipBusy(false);
  };

  const tabItems: { key: TabKey; label: string }[] = [
    { key: 'posts', label: 'Posts' },
    { key: 'sobre', label: 'Sobre' },
  ];

  const tagList = useMemo(
    () => community.tags.map((tag) => (
      <span
        key={tag}
        className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
      >
        {tag}
      </span>
    )),
    [community.tags]
  );

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {community.capa && (
          <div className="relative h-48 w-full">
            <Image
              src={community.capa}
              alt={`Imagem de capa da comunidade ${community.nome}`}
              fill
              className="object-cover"
              priority={false}
              sizes="(max-width: 768px) 100vw, 1200px"
            />
            <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
          </div>
        )}
        <div className="flex flex-col gap-6 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{community.nome}</h1>
              <p className="mt-2 max-w-2xl text-base text-slate-600 dark:text-slate-300">{community.descricao}</p>
            </div>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <span className="rounded-lg border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 dark:border-slate-700 dark:bg-slate-800 dark:text-primary-300">
                {numberFormatter.format(community.membros)} membros
              </span>
              <button
                type="button"
                onClick={handleMembershipToggle}
                aria-pressed={isMember}
                className={clsx(
                  'rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
                  isMember
                    ? 'border border-primary-500 bg-white text-primary-700 hover:bg-primary-50 dark:border-primary-400 dark:bg-slate-900 dark:text-primary-200 dark:hover:bg-primary-900/20'
                    : 'border border-transparent bg-primary-600 text-white hover:bg-primary-700'
                )}
                disabled={membershipBusy}
              >
                {isMember ? 'Sair da comunidade' : (user ? 'Participar' : 'Entrar para participar')}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">{tagList}</div>
        </div>
      </section>

      <nav aria-label="Seções da comunidade">
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          {tabItems.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'rounded-full px-5 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 hover:text-primary-700 dark:text-slate-300 dark:hover:text-primary-200'
                )}
                aria-pressed={isActive}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {activeTab === 'posts' ? (
        <section className="space-y-8" aria-label="Posts da comunidade">
          <PostComposer onSubmit={handlePostSubmit} suggestedTags={community.tags} />

          {paginatedPosts.length === 0 ? (
            <EmptyState
              title="Ainda não há posts publicados por aqui"
              description="Seja a primeira pessoa a compartilhar uma ideia, dúvida ou relato de campo."
            />
          ) : (
            <div className="space-y-6">
              {paginatedPosts.map((post) => (
                <PostItem
                  key={post.id}
                  post={post}
                  currentUserName={viewerName}
                  onReact={handlePostReaction}
                  onAddComment={handleAddComment}
                  onEditPost={handleEditPost}
                  onDeletePost={handleDeletePost}
                  onEditComment={handleEditComment}
                  onDeleteComment={handleDeleteComment}
                  onReactComment={handleReactComment}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="flex flex-wrap items-center justify-between gap-4" aria-label="Paginação de posts">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updatePage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-primary-400 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-primary-400 dark:hover:text-primary-200 dark:focus-visible:ring-offset-slate-900"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  const isActive = pageNumber === currentPage;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => updatePage(pageNumber)}
                      aria-current={isActive ? 'page' : undefined}
                      className={clsx(
                        'inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
                        isActive
                          ? 'border-primary-500 bg-primary-600 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-primary-400 hover:text-primary-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-primary-400 dark:hover:text-primary-200'
                      )}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => updatePage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-primary-400 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-primary-400 dark:hover:text-primary-200 dark:focus-visible:ring-offset-slate-900"
                >
                  Próxima
                </button>
              </div>
            </nav>
          )}
        </section>
      ) : (
        <section className="space-y-6" aria-label="Sobre a comunidade">
          {aboutSections.map((paragraph, index) => (
            <p key={index} className="text-base leading-relaxed text-slate-700 dark:text-slate-200">
              {paragraph}
            </p>
          ))}
        </section>
      )}
    </div>
  );
}
