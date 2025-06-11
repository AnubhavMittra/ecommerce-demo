import React from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { User, ShoppingCart } from 'lucide-react';
import CartSidebar from '@/features/cart/CartSidebar';
import { useCart } from '@/features/cart/CartContext';
import AuthForm from '@/features/auth/AuthForm';

const Header: React.FC = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const [cartOpen, setCartOpen] = React.useState(false);
  const { cart } = useCart();
  const [authOpen, setAuthOpen] = React.useState<'signin' | 'register' | null>(null);

  return (
    <header className="w-full bg-white shadow py-4 px-8 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-800">Ecom Store</h1>
      <nav className="flex items-center gap-4">
        <button className="relative" onClick={() => setCartOpen(!cartOpen)}>
          <ShoppingCart className="w-6 h-6 text-gray-700" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">{cart.length}</span>
          )}
        </button>
        {cartOpen && <CartSidebar onClose={() => setCartOpen(false)} />}
        {isLoggedIn ? (
          <div className="flex items-center gap-2 ml-4">
            <User className="w-6 h-6 text-gray-700" />
            <span className="text-gray-700 font-medium">{user?.name || 'User'}</span>
            <button onClick={logout} className="ml-2 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm">Logout</button>
          </div>
        ) : (
          <React.Fragment>
            <button className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 mr-2" onClick={() => setAuthOpen('signin')}>Sign In</button>
            <button className="px-4 py-2 rounded border border-black text-black hover:bg-gray-100" onClick={() => setAuthOpen('register')}>Register</button>
          </React.Fragment>
        )}
      </nav>
      {authOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="relative">
            <button className="absolute top-2 right-2 text-gray-500 text-2xl" onClick={() => setAuthOpen(null)}>&times;</button>
            <AuthForm mode={authOpen} onSuccess={() => setAuthOpen(null)} />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
