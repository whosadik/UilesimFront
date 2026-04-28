import { Outlet } from 'react-router';

import { AuthProvider } from '../shared/auth/AuthContext';
import { CommerceProvider } from '../shared/commerce/CommerceContext';
import { LanguageProvider } from '../shared/i18n/LanguageContext';

export default function AppProviders() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CommerceProvider>
          <Outlet />
        </CommerceProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
