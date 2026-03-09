import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

import heroMainVideo from '../../assets/banner.mp4';
import jpgBrandVideo from '../../assets/jpgbanner.mp4';

import banner1 from '../../assets/bannerimage.jpeg';
import banner2 from '../../assets/jpgbannerimage.png';
import banner3 from '../../assets/clarins.png';
import banner4 from '../../assets/dalba.png';
import banner5 from '../../assets/darling.png';

type SlideContentPosition = 'left' | 'center' | 'right';
type SlideTone = 'dark' | 'light';

type SlideBase = {
  id: string;
  tone: SlideTone;
  contentPosition: SlideContentPosition;
  overlayClassName?: string;
  mediaClassName?: string;
  contentLayoutClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  content?: {
    eyebrow?: string;
    title: string;
    description?: string;
    buttonText?: string;
  };
};

type VideoSlide = SlideBase & {
  type: 'video';
  src: string;
  poster?: string;
};

type ImageSlide = SlideBase & {
  type: 'image';
  src: string;
  durationMs: number;
};

type HeroSlide = VideoSlide | ImageSlide;

const HEADER_HEIGHT = 112;

const slides: HeroSlide[] = [
  {
    id: 'main-video',
    type: 'video',
    src: heroMainVideo,
    poster: banner1,
    tone: 'dark',
    contentPosition: 'right',
    overlayClassName: 'bg-black/4',
    mediaClassName: 'object-cover',
    contentLayoutClassName: 'items-center justify-end',
    contentClassName: 'max-w-[480px] mr-4 lg:mr-10 text-left',
    titleClassName: 'lg:text-[72px]',
    content: {
      eyebrow: 'эксклюзивно',
      title: 'На первый заказ',
      description: 'Промокод, скидки и специальные предложения для новых покупателей.',
      buttonText: 'Узнать подробнее',
    },
  },
  {
    id: 'jpg-video',
    type: 'video',
    src: jpgBrandVideo,
    poster: banner2,
    tone: 'light',
    contentPosition: 'right',
    overlayClassName: 'bg-black/8',
    mediaClassName: 'object-cover brightness-[1.03] saturate-[1.03]',
    contentLayoutClassName: 'items-center justify-end',
    contentClassName: 'max-w-[500px] mr-6 lg:mr-14 text-left',
    titleClassName: 'lg:text-[70px]',
    content: {
      eyebrow: 'Jean Paul Gaultier',
      title: 'Iconic fragrances',
      description: 'Легендарные ароматы и эффектная бренд-зона с динамичным видео.',
      buttonText: 'Смотреть бренд',
    },
  },
  {
  id: 'clarins',
  type: 'image',
  src: banner3,
  durationMs: 8000,
  tone: 'dark',
  contentPosition: 'left',
  overlayClassName: 'bg-gradient-to-r from-white/10 via-transparent to-transparent',
  mediaClassName: 'object-cover',
  contentLayoutClassName: 'items-center justify-start',
  contentClassName: 'max-w-[360px] ml-8 lg:ml-24 mt-16 lg:mt-20 text-left',
  titleClassName: 'lg:text-[56px] leading-[0.94]',
  descriptionClassName: 'max-w-[320px]',
  content: {
    eyebrow: 'Clarins',
    title: 'Уход, который работает мягко',
    description: 'Текстуры, комфорт и ежедневные ритуалы для кожи.',
    buttonText: 'Выбрать уход',
  },
},
  {
  id: 'dalba',
  type: 'image',
  src: banner4,
  durationMs: 8000,
  tone: 'dark',
  contentPosition: 'right',
  overlayClassName: 'bg-white/2',
  mediaClassName: 'object-cover',
  contentLayoutClassName: 'items-center justify-end',
  contentClassName: 'max-w-[430px] mr-10 lg:mr-24 mt-24 lg:mt-28 text-left',
  titleClassName: 'lg:text-[62px] leading-[0.94]',
  descriptionClassName: 'max-w-[360px]',
  content: {
    eyebrow: 'd’Alba',
    title: 'Премиальный glow-уход',
    description: 'Минималистичная подборка для сияния и увлажнения.',
    buttonText: 'Смотреть продукты',
  },
},
  {
    id: 'darling',
    type: 'image',
    src: banner5,
    durationMs: 8000,
    tone: 'dark',
    contentPosition: 'center',
    overlayClassName: 'bg-gradient-to-r from-white/28 via-white/10 to-transparent',
    mediaClassName: 'object-cover',
    contentLayoutClassName: 'items-center justify-start',
    contentClassName: 'max-w-[380px] ml-4 lg:ml-16 text-left',
    titleClassName: 'lg:text-[60px] leading-[0.95]',
    descriptionClassName: 'max-w-[340px]',
    content: {
      eyebrow: 'Darling',
      title: 'Summer essentials',
      description: 'Легкий летний акцент в каталоге ухода и body care.',
      buttonText: 'Открыть подборку',
    },
  },
];

function getContentAlignment(position: SlideContentPosition) {
  if (position === 'left') return 'justify-start text-left';
  if (position === 'center') return 'justify-center text-center';
  return 'justify-end text-left';
}

function getContentWidth(position: SlideContentPosition) {
  if (position === 'center') return 'max-w-[680px] mx-auto';
  return 'max-w-[520px]';
}

export function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  const activeSlide = useMemo(() => slides[activeIndex], [activeIndex]);

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (activeSlide.type === 'image') {
      timerRef.current = window.setTimeout(() => {
        goToNext();
      }, activeSlide.durationMs);
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [activeSlide]);

  const textColorClass =
    activeSlide.tone === 'light' ? 'text-white' : 'text-neutral-950';

  const subTextColorClass =
    activeSlide.tone === 'light' ? 'text-white/85' : 'text-neutral-700';

  const buttonClass =
    activeSlide.tone === 'light'
      ? 'bg-white text-black hover:bg-white/90'
      : 'bg-black text-white hover:bg-black/90';

  return (
    <section
      className="relative overflow-hidden"
      style={{
        marginTop: HEADER_HEIGHT,
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        minHeight: 620,
      }}
    >
      <div className="absolute inset-0">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {slide.type === 'video' ? (
                <video
                  key={`${slide.id}-${isActive ? 'active' : 'inactive'}`}
                  className={`absolute inset-0 h-full w-full ${slide.mediaClassName ?? 'object-cover'}`}
                  src={slide.src}
                  poster={slide.poster}
                  autoPlay={isActive}
                  muted
                  playsInline
                  preload="metadata"
                  onEnded={() => {
                    if (isActive) goToNext();
                  }}
                />
              ) : (
                <img
                  src={slide.src}
                  alt=""
                  className={`absolute inset-0 h-full w-full ${slide.mediaClassName ?? 'object-cover'}`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              )}

              <div className={`absolute inset-0 ${slide.overlayClassName ?? ''}`} />
              <div className="absolute inset-0 bg-gradient-to-r from-white/6 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/3 via-transparent to-transparent" />
            </div>
          );
        })}
      </div>

      <div className="relative z-20 h-full">
        <div className="mx-auto flex h-full max-w-[1440px] px-6 lg:px-10">
          <div
            className={`flex w-full ${
              activeSlide.contentLayoutClassName ?? 'items-center justify-end'
            }`}
          >
            {activeSlide.content ? (
              <div
                className={`${
                  activeSlide.contentClassName ?? 'max-w-[520px] text-left'
                } ${textColorClass}`}
              >
                <div className="space-y-4">
                  {activeSlide.content.eyebrow ? (
                    <p className="text-sm font-medium uppercase tracking-[0.14em] opacity-80">
                      {activeSlide.content.eyebrow}
                    </p>
                  ) : null}

                  <h1
  className={`text-4xl font-semibold tracking-[-0.04em] sm:text-5xl ${
    activeSlide.titleClassName ?? 'lg:text-[72px] leading-[0.95]'
  }`}
>
                    {activeSlide.content.title}
                  </h1>

                  {activeSlide.content.description ? (
                    <p
  className={`text-base leading-relaxed lg:text-lg ${subTextColorClass} ${
    activeSlide.descriptionClassName ?? 'max-w-[480px]'
  }`}
>
                      {activeSlide.content.description}
                    </p>
                  ) : null}

                  {activeSlide.content.buttonText ? (
                    <div>
                      <button
                        type="button"
                        className={`inline-flex items-center gap-2 rounded-none px-6 py-4 text-sm font-semibold uppercase tracking-[0.08em] transition-colors ${buttonClass}`}
                      >
                        {activeSlide.content.buttonText}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Перейти к баннеру ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'w-8 bg-black'
                  : 'w-2 bg-black/30 hover:bg-black/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}