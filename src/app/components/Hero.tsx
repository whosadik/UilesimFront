import { useCallback, useEffect, useMemo, useRef, useState, type TransitionEvent } from 'react';
import { useNavigate } from 'react-router';
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

type SlideTextBox = {
  x?: number;         // сдвиг по X в px
  y?: number;         // сдвиг по Y в px
  maxWidth?: number;  // ширина блока
  align?: 'left' | 'center' | 'right';
};

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
  textBox?: SlideTextBox;
  content?: {
    eyebrow?: string;
    title: string;
    description?: string;
    buttonText?: string;
    buttonTo?: string;
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
const SLIDE_TRANSITION_MS = 1450;
const SLIDE_TRANSITION_EASING = 'cubic-bezier(0.42, 0, 0.22, 1)';

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
  textBox: {
    x: -36,
    y: 0,
    maxWidth: 360,
    align: 'left',
  },
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
  textBox: {
    x: -28,
    y: -26,
    maxWidth: 360,
    align: 'left',
  },
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
    textBox: {
      x: -20,
      y: -14,
      maxWidth: 360,
      align: 'left',
  },
    descriptionClassName: 'max-w-[340px]',
    content: {
      eyebrow: 'Darling',
      title: 'Summer essentials',
      description: 'Легкий летний акцент в каталоге ухода и body care.',
      buttonText: 'Открыть подборку',
    },
  },
];

const HERO_CTA_ROUTES: Record<string, string> = {
  'main-video': '/promotions',
  'jpg-video': '/search?q=Jean%20Paul%20Gaultier',
  clarins: '/search?q=Clarins',
  dalba: '/search?q=d%27Alba',
  darling: '/search?q=Darling',
};

function getContentLayout(position: SlideContentPosition) {
  if (position === 'left') return 'justify-start';
  if (position === 'center') return 'justify-center';
  return 'justify-end';
}

function getContentAlignment(position: SlideContentPosition) {
  if (position === 'center') return 'text-center';
  return 'text-left';
}

function getContentWidth(position: SlideContentPosition) {
  if (position === 'center') return 'max-w-[720px]';
  return 'max-w-[560px]';
}

export function Hero() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const timerRef = useRef<number | null>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  const activeSlide = useMemo(() => slides[activeIndex], [activeIndex]);
  const slidesWithLoop = useMemo(() => [...slides, slides[0]], []);

  const goToNext = useCallback(() => {
    if (isSliding) {
      return;
    }

    setIsSliding(true);
    setActiveIndex((prev) => (prev + 1) % slides.length);
    setTrackIndex((prev) => prev + 1);
  }, [isSliding]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isSliding || index === activeIndex) {
        return;
      }

      setIsSliding(true);
      setActiveIndex(index);
      setTrackIndex(index);
    },
    [activeIndex, isSliding],
  );

  const handleTrackTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || event.propertyName !== 'transform') {
        return;
      }

      if (trackIndex === slides.length) {
        setIsTransitionEnabled(false);
        setTrackIndex(0);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsTransitionEnabled(true);
            setIsSliding(false);
          });
        });
        return;
      }

      setIsSliding(false);
    },
    [trackIndex],
  );

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) {
        return;
      }

      if (index === trackIndex) {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            // keep slider alive via fallback timer below
          });
        }
      } else {
        video.pause();
      }
    });
  }, [trackIndex]);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!isSliding) {
      if (activeSlide.type === 'image') {
        timerRef.current = window.setTimeout(() => {
          goToNext();
        }, activeSlide.durationMs);
      } else {
        const activeVideo = videoRefs.current[trackIndex];
        const durationMs =
          activeVideo && Number.isFinite(activeVideo.duration) && activeVideo.duration > 0
            ? activeVideo.duration * 1000
            : 12000;

        timerRef.current = window.setTimeout(() => {
          goToNext();
        }, durationMs);
      }
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [activeSlide, goToNext, isSliding, trackIndex]);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        marginTop: HEADER_HEIGHT,
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        minHeight: 620,
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="flex h-full w-full"
          style={{
            transform: `translateX(-${trackIndex * 100}%)`,
            transition: isTransitionEnabled
              ? `transform ${SLIDE_TRANSITION_MS}ms ${SLIDE_TRANSITION_EASING}`
              : 'none',
            willChange: 'transform',
          }}
          onTransitionEnd={handleTrackTransitionEnd}
        >
          {slidesWithLoop.map((slide, index) => {
            const logicalIndex = index === slides.length ? 0 : index;
            const isTrackActive = index === trackIndex;
            const isLightTone = slide.tone === 'light';

            const textColorClass = isLightTone ? 'text-white' : 'text-[#111827]';
            const subTextColorClass = isLightTone ? 'text-white/80' : 'text-[#6B7280]';
            const eyebrowClass = isLightTone ? 'text-white/85' : 'text-[#111827]/75';
            const buttonClass = isLightTone
              ? 'bg-white text-[#111827] border border-white/80 hover:bg-white/90'
              : 'bg-[#111827] text-white border border-[#111827] hover:bg-[#0B1220]';
            const buttonTo = HERO_CTA_ROUTES[slide.id];
            const textBox = slide.textBox;
            const contentWidthClass = getContentWidth(slide.contentPosition);
            const textAlignClass = textBox?.align
              ? textBox.align === 'center'
                ? 'text-center'
                : textBox.align === 'right'
                ? 'text-right'
                : 'text-left'
              : getContentAlignment(slide.contentPosition);
            const contentLayoutClass =
              slide.contentLayoutClassName ?? `items-center ${getContentLayout(slide.contentPosition)}`;

            return (
              <div
                key={`${slide.id}-${index === slides.length ? 'loop' : 'slide'}`}
                className="relative h-full w-full shrink-0"
              >
                {slide.type === 'video' ? (
                  <video
                    ref={(node) => {
                      videoRefs.current[index] = node;
                    }}
                    className={`absolute inset-0 h-full w-full ${slide.mediaClassName ?? 'object-cover'}`}
                    src={slide.src}
                    poster={slide.poster}
                    autoPlay={isTrackActive}
                    muted
                    playsInline
                    preload="metadata"
                    onEnded={() => {
                      if (isTrackActive) goToNext();
                    }}
                  />
                ) : (
                  <img
                    src={slide.src}
                    alt=""
                    className={`absolute inset-0 h-full w-full ${slide.mediaClassName ?? 'object-cover'}`}
                    loading={logicalIndex === 0 ? 'eager' : 'lazy'}
                  />
                )}

                <div className={`absolute inset-0 ${slide.overlayClassName ?? ''}`} />
                <div className="absolute inset-0 bg-gradient-to-r from-white/6 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/3 via-transparent to-transparent" />

                <div className="absolute inset-0 z-20 h-full">
                  <div className="mx-auto flex h-full max-w-[1440px] px-6 lg:px-10">
                    <div className={`flex w-full ${contentLayoutClass}`}>
                      {slide.content ? (
                        <div
                          className={`${contentWidthClass} ${slide.contentClassName ?? ''} ${textColorClass} ${textAlignClass}`}
                          style={{
                            maxWidth: textBox?.maxWidth ? `${textBox.maxWidth}px` : undefined,
                            transform: `translate(${textBox?.x ?? 0}px, ${textBox?.y ?? 0}px)`,
                          }}
                        >
                          <div className="space-y-4 sm:space-y-5">
                            {slide.content.eyebrow ? (
                              <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${eyebrowClass}`}>
                                {slide.content.eyebrow}
                              </p>
                            ) : null}

                            <h1
                              className={`text-4xl font-semibold tracking-[-0.04em] sm:text-5xl ${
                                slide.titleClassName ?? 'lg:text-[72px] leading-[0.95]'
                              }`}
                            >
                              {slide.content.title}
                            </h1>

                            {slide.content.description ? (
                              <p
                                className={`text-base leading-relaxed lg:text-lg ${subTextColorClass} ${
                                  slide.descriptionClassName ?? 'max-w-[480px]'
                                }`}
                              >
                                {slide.content.description}
                              </p>
                            ) : null}

                            {slide.content.buttonText ? (
                              <div>
                                <button
                                  type="button"
                                  className={`group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-200 ${buttonClass}`}
                                  onClick={() => {
                                    if (buttonTo) {
                                      navigate(buttonTo);
                                    }
                                  }}
                                >
                                  <span>{slide.content.buttonText}</span>
                                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goToSlide(index)}
            aria-label={`Go to banner ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === activeIndex ? 'w-8 bg-black' : 'w-2 bg-black/30 hover:bg-black/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
