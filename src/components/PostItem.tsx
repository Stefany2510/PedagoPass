'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import type { Post, PostComment } from '@/data/communityPosts';

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);

  if (diffMinutes < 1) return 'agora mesmo';
  if (diffMinutes < 60) return `há ${diffMinutes} minuto${diffMinutes === 1 ? '' : 's'}`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `há ${diffHours} hora${diffHours === 1 ? '' : 's'}`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `há ${diffDays} dia${diffDays === 1 ? '' : 's'}`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `há ${diffWeeks} semana${diffWeeks === 1 ? '' : 's'}`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `há ${diffMonths} mês${diffMonths === 1 ? '' : 'es'}`;

  const diffYears = Math.floor(diffDays / 365);
  return `há ${diffYears} ano${diffYears === 1 ? '' : 's'}`;
}

const avatarColors = ['bg-primary-100 text-primary-700', 'bg-slate-200 text-slate-700', 'bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700'];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
  return initials || 'P';
}

export function PostItem({ post }: { post: Post }) {
  const [likes, setLikes] = useState(post.likes);
  const initialComments = useMemo(() => post.comments ?? [], [post.comments]);
  const [commentList, setCommentList] = useState<PostComment[]>(initialComments);
  const [replies, setReplies] = useState(post.replies || initialComments.length);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [commentsOpen, setCommentsOpen] = useState(initialComments.length > 0);

  const relativeTime = useMemo(() => formatRelativeTime(post.createdAt), [post.createdAt]);
  const initials = useMemo(() => getInitials(post.autor), [post.autor]);
  const avatarStyle = useMemo(() => avatarColors[post.autor.length % avatarColors.length], [post.autor.length]);

  const handleLike = () => {
    setLikes((prev) => prev + 1);
  };

  const handleReplyToggle = () => {
    if (!commentsOpen) setCommentsOpen(true);
    setIsReplyOpen((prev) => !prev);
    if (isReplyOpen) {
      setReplyText('');
    }
  };

  const handleReplySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!replyText.trim()) return;
    const newComment: PostComment = {
      id: `${post.id}-reply-${Date.now()}`,
      autor: 'Você',
      conteudo: replyText.trim(),
      createdAt: new Date().toISOString(),
    };
    setCommentList((prev) => [newComment, ...prev]);
    setReplies((prev) => prev + 1);
    setCommentsOpen(true);
    setReplyText('');
    setIsReplyOpen(false);
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="flex items-start gap-3">
        {post.avatar ? (
          <Image
            src={post.avatar}
            alt={`Foto de ${post.autor}`}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className={clsx('flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold', avatarStyle)}
          >
            {initials}
          </span>
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{post.autor}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{relativeTime}</span>
          </div>
          {post.titulo && <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{post.titulo}</p>}
        </div>
      </header>

      <p className="mt-4 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">{post.conteudo}</p>

      {post.tags && post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleLike}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-primary-400 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:text-primary-200 dark:focus-visible:ring-offset-slate-900"
          aria-label={`Curtir post de ${post.autor}`}
        >
          ❤️ {likes}
        </button>
        <button
          type="button"
          onClick={() => setCommentsOpen((prev) => !prev)}
          aria-expanded={commentsOpen}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-primary-400 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:text-primary-200 dark:focus-visible:ring-offset-slate-900"
        >
          💬 {replies}
        </button>
        <button
          type="button"
          onClick={handleReplyToggle}
          aria-expanded={isReplyOpen}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-primary-400 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:text-primary-200 dark:focus-visible:ring-offset-slate-900"
        >
          ✏️ Responder
        </button>
      </div>

      {commentsOpen && commentList.length > 0 && (
        <div className="mt-4 space-y-3 border-l border-slate-200 pl-4 dark:border-slate-700">
          {commentList.map((comment) => {
            const commentTime = formatRelativeTime(comment.createdAt);
            const initialsComment = getInitials(comment.autor);
            const avatarStyleComment = avatarColors[comment.autor.length % avatarColors.length];
            return (
              <div key={comment.id} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={clsx('flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold', avatarStyleComment)}
                >
                  {initialsComment}
                </span>
                <div className="flex-1 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/70">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{comment.autor}</span>
                    <span className="text-slate-500 dark:text-slate-400">{commentTime}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{comment.conteudo}</p>
                  {typeof comment.likes === 'number' && (
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">❤️ {comment.likes}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isReplyOpen && (
        <form onSubmit={handleReplySubmit} className="mt-4 space-y-3" aria-label="Responder ao post">
          <label htmlFor={`${post.id}-reply`} className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Sua resposta
          </label>
          <textarea
            id={`${post.id}-reply`}
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              Enviar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsReplyOpen(false);
                setReplyText('');
              }}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-primary-400 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:text-primary-200 dark:focus-visible:ring-offset-slate-900"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </article>
  );
}
