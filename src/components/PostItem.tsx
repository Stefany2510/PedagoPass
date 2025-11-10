'use client';

import { useEffect, useMemo, useState } from 'react';
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

type PostItemProps = {
  post: Post;
  currentUserName: string | null;
  onReact: (postId: string, nextReaction: 'like' | 'dislike' | null) => void;
  onAddComment: (postId: string, content: string) => void;
  onEditPost: (postId: string, content: string) => void;
  onDeletePost: (postId: string) => void;
  onEditComment: (postId: string, commentId: string, content: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
};

export function PostItem({
  post,
  currentUserName,
  onReact,
  onAddComment,
  onEditPost,
  onDeletePost,
  onEditComment,
  onDeleteComment,
}: PostItemProps) {
  const comments = post.comments ?? [];
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [commentsOpen, setCommentsOpen] = useState(comments.length > 0);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editedContent, setEditedContent] = useState(post.conteudo);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  useEffect(() => {
    setEditedContent(post.conteudo);
  }, [post.conteudo]);

  useEffect(() => {
    if (comments.length > 0) {
      setCommentsOpen(true);
    }
  }, [comments.length]);

  const relativeTime = useMemo(() => formatRelativeTime(post.createdAt), [post.createdAt]);
  const initials = useMemo(() => getInitials(post.autor), [post.autor]);
  const avatarStyle = useMemo(() => avatarColors[post.autor.length % avatarColors.length], [post.autor.length]);
  const dislikeCount = post.dislikes ?? 0;
  const commentCount = post.replies ?? comments.length;
  const canManagePost = Boolean(currentUserName && post.autor === currentUserName);
  const myReaction = post.reaction ?? null;
  const isLiked = myReaction === 'like';
  const isDisliked = myReaction === 'dislike';

  const handleLike = () => onReact(post.id, isLiked ? null : 'like');
  const handleDislike = () => onReact(post.id, isDisliked ? null : 'dislike');

  const handleReplyToggle = () => {
    if (!commentsOpen) setCommentsOpen(true);
    setIsReplyOpen((prev) => !prev);
    if (isReplyOpen) {
      setReplyText('');
    }
  };

  const handleReplySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = replyText.trim();
    if (!trimmed) return;
    onAddComment(post.id, trimmed);
    setReplyText('');
    setIsReplyOpen(false);
    setCommentsOpen(true);
  };

  const handlePostEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = editedContent.trim();
    if (!trimmed) return;
    onEditPost(post.id, trimmed);
    setIsEditingPost(false);
  };

  const handleCancelPostEdit = () => {
    setIsEditingPost(false);
    setEditedContent(post.conteudo);
  };

  const handleDeletePostClick = () => {
    if (typeof window !== 'undefined' && !window.confirm('Deseja excluir este post?')) {
      return;
    }
    onDeletePost(post.id);
  };

  const startEditComment = (comment: PostComment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.conteudo);
  };

  const handleCommentEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingCommentId) return;
    const trimmed = editingCommentText.trim();
    if (!trimmed) return;
    onEditComment(post.id, editingCommentId, trimmed);
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleCancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleDeleteCommentClick = (commentId: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Deseja excluir este comentário?')) {
      return;
    }
    onDeleteComment(post.id, commentId);
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
            {post.updatedAt && <span className="text-xs text-slate-400 dark:text-slate-500">• editado</span>}
          </div>
          {post.titulo && <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{post.titulo}</p>}
        </div>
        {canManagePost && (
          <div className="ml-3 flex flex-col items-end gap-1">
            {!isEditingPost && (
              <button
                type="button"
                onClick={() => setIsEditingPost(true)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-primary-400 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:text-primary-200 dark:focus-visible:ring-offset-slate-900"
              >
                Editar
              </button>
            )}
            <button
              type="button"
              onClick={handleDeletePostClick}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-red-300 dark:hover:border-red-400 dark:hover:text-red-200 dark:focus-visible:ring-offset-slate-900"
            >
              Excluir
            </button>
          </div>
        )}
      </header>

      {isEditingPost ? (
        <form onSubmit={handlePostEditSubmit} className="mt-4 space-y-3" aria-label="Editar post">
          <label htmlFor={`${post.id}-edit`} className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Conteúdo do post
          </label>
          <textarea
            id={`${post.id}-edit`}
            value={editedContent}
            onChange={(event) => setEditedContent(event.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={handleCancelPostEdit}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-primary-400 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:text-primary-200 dark:focus-visible:ring-offset-slate-900"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-4 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">{post.conteudo}</p>
      )}

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
          className={clsx(
            'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
            isLiked
              ? 'border-primary-500 bg-primary-100 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-200'
              : 'border-slate-200 text-slate-600 hover:border-primary-400 hover:text-primary-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:text-primary-200'
          )}
          aria-pressed={isLiked}
          aria-label={`Curtir post de ${post.autor}`}
        >
          ❤️ {post.likes}
        </button>
        <button
          type="button"
          onClick={handleDislike}
          className={clsx(
            'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
            isDisliked
              ? 'border-red-400 bg-red-100 text-red-600 dark:border-red-400 dark:bg-red-900/30 dark:text-red-200'
              : 'border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-400 dark:hover:text-red-200'
          )}
          aria-pressed={isDisliked}
          aria-label={`Descurtir post de ${post.autor}`}
        >
          👎 {dislikeCount}
        </button>
        <button
          type="button"
          onClick={() => setCommentsOpen((prev) => !prev)}
          aria-expanded={commentsOpen}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-primary-400 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:text-primary-200 dark:focus-visible:ring-offset-slate-900"
        >
          💬 {commentCount}
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

      {commentsOpen && comments.length > 0 && (
        <div className="mt-4 space-y-3 border-l border-slate-200 pl-4 dark:border-slate-700">
          {comments.map((comment) => {
            const commentTime = formatRelativeTime(comment.createdAt);
            const initialsComment = getInitials(comment.autor);
            const avatarStyleComment = avatarColors[comment.autor.length % avatarColors.length];
            const canManageComment = Boolean(currentUserName && comment.autor === currentUserName);
            const isEditingCurrent = editingCommentId === comment.id;
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
                    {comment.updatedAt && <span className="text-slate-400 dark:text-slate-500">• editado</span>}
                  </div>
                  {isEditingCurrent ? (
                    <form onSubmit={handleCommentEditSubmit} className="mt-2 space-y-2" aria-label="Editar comentário">
                      <textarea
                        value={editingCommentText}
                        onChange={(event) => setEditingCommentText(event.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelCommentEdit}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-primary-400 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:text-primary-200 dark:focus-visible:ring-offset-slate-900"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{comment.conteudo}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                        {typeof comment.likes === 'number' && <span>❤️ {comment.likes}</span>}
                        {canManageComment && (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditComment(comment)}
                              className="rounded-full border border-slate-200 px-2 py-0.5 font-semibold text-slate-600 transition hover:border-primary-400 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:text-primary-200 dark:focus-visible:ring-offset-slate-900"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCommentClick(comment.id)}
                              className="rounded-full border border-slate-200 px-2 py-0.5 font-semibold text-red-600 transition hover:border-red-300 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-red-300 dark:hover:border-red-400 dark:hover:text-red-200 dark:focus-visible:ring-offset-slate-900"
                            >
                              Excluir
                            </button>
                          </>
                        )}
                      </div>
                    </>
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
