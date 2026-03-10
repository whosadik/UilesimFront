import { Outlet } from 'react-router';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toaster } from 'sonner';
import { useCommerce } from '../shared/commerce/CommerceContext';

export default function Root() {
  const { wishlistCount, cartCount } = useCommerce();

  return (
    <div className="min-h-screen bg-white">
      <Navbar wishlistCount={wishlistCount} cartCount={cartCount} />
      <main>
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-right" richColors />
    </div>
  );
}
