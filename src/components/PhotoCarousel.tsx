'use client';

import { useId, useMemo, useState } from 'react';
import clsx from 'clsx';
import Image from 'next/image';

type PhotoCarouselProps = {
  images: { src: string; alt: string }[];
};

export function PhotoCarousel({ images }: PhotoCarouselProps) {
  const validImages = useMemo(() => images.filter((image) => Boolean(image.src)), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselId = useId();

  if (validImages.length === 0) {
    return null;
  }

  const goTo = (index: number) => {
    setActiveIndex(((index % validImages.length) + validImages.length) % validImages.length);
  };

  const handlePrev = () => {
    goTo(activeIndex - 1);
  };

  const handleNext = () => {
    goTo(activeIndex + 1);
  };

  return (
    <section aria-labelledby={`${carouselId}-label`} className="space-y-4">
      <h2 id={`${carouselId}-label`} className="sr-only">
        Galeria de fotos
      </h2>
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900/5 dark:border-slate-700 dark:bg-slate-900">
        <div className="relative h-64 w-full sm:h-80">
          {validImages.map((image, index) => (
            <div
              key={image.src}
              className={clsx(
                'absolute inset-0 transition-opacity duration-500 ease-out',
                index === activeIndex ? 'opacity-100' : 'opacity-0'
              )}
              aria-hidden={index !== activeIndex}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                priority={index === activeIndex}
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <button
            type="button"
            onClick={handlePrev}
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-slate-900/80 dark:text-slate-100"
            aria-label="Foto anterior"
          >
            <span aria-hidden="true">&lt;</span>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-slate-900/80 dark:text-slate-100"
            aria-label="Próxima foto"
          >
            <span aria-hidden="true">&gt;</span>
          </button>
        </div>
      </div>

      {validImages.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {validImages.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={image.src}
                type="button"
                onClick={() => goTo(index)}
                className={clsx(
                  'relative h-16 w-24 overflow-hidden rounded-xl border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
                  isActive
                    ? 'border-primary-500 ring-2 ring-primary-500'
                    : 'border-transparent hover:border-primary-400'
                )}
                aria-label={`Ir para foto ${index + 1}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="96px" />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
