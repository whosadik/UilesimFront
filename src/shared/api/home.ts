import { apiFetch } from './httpClient';

type HomeHeroSlideApi = {
  id: string;
  eyebrow?: string | null;
  title: string;
  description?: string | null;
  button_text?: string | null;
  button_to?: string | null;
};

export type HomeHeroSlideContent = {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  buttonText?: string;
  buttonTo?: string;
};

export interface HomeHeroResponse {
  ok: boolean;
  slides: HomeHeroSlideContent[];
}

export async function getHomeHero(): Promise<HomeHeroResponse> {
  const response = await apiFetch<{ ok: boolean; slides: HomeHeroSlideApi[] }>('/api/home/hero', {
    method: 'GET',
    skipCsrf: true,
  });

  return {
    ok: Boolean(response?.ok),
    slides: Array.isArray(response?.slides)
      ? response.slides.map((slide) => ({
          id: slide.id,
          eyebrow: typeof slide.eyebrow === 'string' ? slide.eyebrow : undefined,
          title: slide.title,
          description: typeof slide.description === 'string' ? slide.description : undefined,
          buttonText: typeof slide.button_text === 'string' ? slide.button_text : undefined,
          buttonTo: typeof slide.button_to === 'string' ? slide.button_to : undefined,
        }))
      : [],
  };
}
