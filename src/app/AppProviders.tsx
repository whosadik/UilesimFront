import { useEffect, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

import { AuthProvider } from '../shared/auth/AuthContext';
import { CommerceProvider } from '../shared/commerce/CommerceContext';
import { LanguageProvider } from '../shared/i18n/LanguageContext';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!('scrollRestoration' in window.history)) {
      return;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    document
      .querySelectorAll<HTMLElement>('[data-route-scroll-container]')
      .forEach((element) => {
        element.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      });
  }, [pathname]);

  return null;
}

export default function AppProviders() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CommerceProvider>
          <ScrollToTop />
          <Outlet />
        </CommerceProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
