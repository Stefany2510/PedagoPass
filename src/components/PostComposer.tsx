'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';

type PostComposerProps = {
  onSubmit: (payload: { conteudo: string; tags: string[] }) => void | Promise<void>;
  suggestedTags?: string[];
  maxLength?: number;
};

const MIN_LENGTH = 3;

export function PostComposer({ onSubmit, suggestedTags = [], maxLength = 600 }: PostComposerProps) {
  const [conteudo, setConteudo] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remaining = maxLength - conteudo.length;
  const isTooLong = remaining < 0;
  const isValid = conteudo.trim().length >= MIN_LENGTH && !isTooLong;

  const orderedTags = useMemo(() => [...new Set(suggestedTags)].sort((a, b) => a.localeCompare(b, 'pt-BR')), [suggestedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    const payload = { conteudo: conteudo.trim(), tags: selectedTags };

    setIsSubmitting(true);
    Promise.resolve(onSubmit(payload))
      .then(() => {
        setConteudo('');
        setSelectedTags([]);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      aria-label="Publicar novo post"
    >
      <div>
        <label htmlFor="composer-text" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Compartilhe com a comunidade
        </label>
        <textarea
          id="composer-text"
          name="conteudo"
          rows={4}
          value={conteudo}
          onChange={(event) => setConteudo(event.target.value)}
          maxLength={maxLength}
          placeholder="Conte em poucas linhas sua ideia, dica ou dúvida."
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          aria-describedby="composer-help composer-counter"
        />
        <p id="composer-help" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Mínimo de {MIN_LENGTH} caracteres. Use tags para organizar o conteúdo.
        </p>
        <p
          id="composer-counter"
          className={clsx('mt-1 text-xs font-medium', isTooLong ? 'text-red-500' : 'text-slate-500 dark:text-slate-400')}
          aria-live="polite"
        >
          {remaining >= 0 ? `${remaining} caracteres restantes` : `${Math.abs(remaining)} caracteres acima do limite`}
        </p>
      </div>

      {orderedTags.length > 0 && (
        <div className="mt-4">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Tags sugeridas</span>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Selecionar tags">
            {orderedTags.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
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
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="inline-flex items-center justify-center rounded-xl border border-transparent bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900"
        >
          {isSubmitting ? 'Publicando...' : 'Publicar'}
        </button>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Você pode editar depois. O post aparece imediatamente para todos.
        </span>
      </div>
    </form>
  );
}
