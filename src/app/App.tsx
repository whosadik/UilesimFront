import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from '../shared/auth/AuthContext';
import { CommerceProvider } from '../shared/commerce/CommerceContext';

export default function App() {
  return (
    <AuthProvider>
      <CommerceProvider>
        <RouterProvider router={router} />
      </CommerceProvider>
    </AuthProvider>
  );
}
