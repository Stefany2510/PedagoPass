"use client";
 
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import clsx from 'clsx';
import type { Community } from '@/data/communities';

const formatter = new Intl.NumberFormat('pt-BR');

// Sem fallback fotográfico para evitar imagens fora de contexto;
// quando não houver capa, o card exibe apenas o conteúdo textual.

export function CommunityCard({ c }: { c: Community }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const galleryImages = useMemo(() => {
    // Exibir apenas UMA imagem por comunidade (somente a capa, se existir)
    return c.capa ? [c.capa] : [];
  }, [c.capa]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-primary-500 dark:border-slate-800 dark:bg-slate-900">
      {galleryImages.length > 0 && (
        <div className="group relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          {galleryImages.map((src, index) => (
            <div
              key={src}
              className={clsx(
                'absolute inset-0 transition-opacity duration-300',
                index === activeImageIndex ? 'opacity-100' : 'opacity-0'
              )}
              aria-hidden={index !== activeImageIndex}
            >
              <Image
                src={src}
                alt={`Foto ${index + 1} da comunidade ${c.nome}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={false}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/40" aria-hidden="true" />

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 text-slate-700 opacity-0 transition-opacity hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 group-hover:opacity-100 dark:bg-slate-900/80 dark:text-slate-100"
                aria-label="Foto anterior"
              >
                <span aria-hidden="true">&lt;</span>
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 text-slate-700 opacity-0 transition-opacity hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 group-hover:opacity-100 dark:bg-slate-900/80 dark:text-slate-100"
                aria-label="Próxima foto"
              >
                <span aria-hidden="true">&gt;</span>
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1" role="status" aria-label="Indicador de imagens">
                {galleryImages.map((_, index) => (
                  <div
                    key={index}
                    className={clsx(
                      'h-1 rounded-full transition-all',
                      index === activeImageIndex
                        ? 'w-3 bg-white'
                        : 'w-1.5 bg-white/50'
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
      <div className="flex grow flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{c.nome}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{c.descricao}</p>
          </div>
          <span className="shrink-0 rounded-lg border border-primary-100 bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 dark:border-slate-700 dark:bg-slate-800 dark:text-primary-300">
            {formatter.format(c.membros)} membros
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {c.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Link
            href={`/comunidades/${c.slug}`}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            aria-label={`Ver detalhes da comunidade ${c.nome}`}
          >
            Ver comunidade
          </Link>
        </div>
      </div>
    </article>
  );
}
