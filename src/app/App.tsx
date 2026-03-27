import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from '../shared/auth/AuthContext';
import { CommerceProvider } from '../shared/commerce/CommerceContext';
import { LanguageProvider } from '../shared/i18n/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CommerceProvider>
          <RouterProvider router={router} />
        </CommerceProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
