import React from 'react';
import { useCart } from './CartContext';
import { useAuth } from '../auth/AuthContext';

const CartSidebar: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { cart, removeFromCart, clearCart, checkout } = useCart();
  const { isLoggedIn } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleCheckout = async () => {
    setError(null);
    setSuccess(null);
    try {
      await checkout();
      setSuccess('Checkout successful!');
    } catch (e: any) {
      setError(e.message || 'Checkout failed.');
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <aside className="w-80 bg-white shadow p-4 fixed right-0 top-0 h-full z-50 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Cart</h2>
        {onClose && (
          <button
            className="text-gray-500 text-2xl hover:text-black px-2"
            onClick={onClose}
            aria-label="Close cart sidebar"
          >
            &times;
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex items-center justify-between mb-3 border-b pb-2">
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-gray-600">${item.price.toFixed(2)} x {item.quantity}</div>
              </div>
              <button className="text-red-500 ml-2" onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))
        )}
      </div>
      <div className="mt-4">
        <div className="font-semibold mb-2">Total: ${total.toFixed(2)}</div>
        <button
          className="w-full bg-black text-white py-2 rounded mb-2 disabled:opacity-50"
          onClick={handleCheckout}
          disabled={cart.length === 0 || !isLoggedIn}
        >
          Checkout
        </button>
        {!isLoggedIn && <div className="text-xs text-red-500 mb-2">Login to checkout</div>}
        {error && <div className="text-xs text-red-500 mb-2">{error}</div>}
        {success && <div className="text-xs text-green-600 mb-2">{success}</div>}
        <button className="w-full border py-2 rounded" onClick={clearCart} disabled={cart.length === 0}>Clear Cart</button>
      </div>
    </aside>
  );
};

export default CartSidebar;
