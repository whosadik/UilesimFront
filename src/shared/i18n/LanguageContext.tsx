import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  supportedLanguages,
  translationMessages,
  type AppLanguage,
  type TranslationMessages,
} from './messages';

const LANGUAGE_STORAGE_KEY = 'uilesim.language';

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  messages: TranslationMessages;
  supportedLanguages: readonly AppLanguage[];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isSupportedLanguage(value: string | null): value is AppLanguage {
  return value !== null && supportedLanguages.includes(value as AppLanguage);
}

function getInitialLanguage(): AppLanguage {
  if (typeof window === 'undefined') {
    return 'ru';
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (isSupportedLanguage(stored)) {
    return stored;
  }

  return 'ru';
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<AppLanguage>(() => getInitialLanguage());

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      messages: translationMessages[language],
      supportedLanguages,
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useI18n must be used within LanguageProvider');
  }

  return context;
}
