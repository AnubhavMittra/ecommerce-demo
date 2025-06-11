import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  checkout: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      axios.get('http://localhost:8081/api/v1/cart', { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } })
        .then(res => setCart(res.data.cart || []))
        .catch(() => setCart([]));
    } else {
      const localCart = localStorage.getItem('cart');
      setCart(localCart ? JSON.parse(localCart) : []);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isLoggedIn]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    if (isLoggedIn) {
      axios.post('http://localhost:8081/api/v1/cart', item, { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } })
        .catch(() => {/* Ignore API errors for addToCart */});
    }
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
    if (isLoggedIn) {
      axios.delete(`http://localhost:8081/api/v1/cart/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } });
    }
  };

  const clearCart = () => {
    setCart([]);
    if (isLoggedIn) {
      axios.delete('http://localhost:8081/api/v1/cart', { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } });
    }
  };

  const checkout = async () => {
    if (!isLoggedIn) throw new Error('You must be logged in to checkout.');
    await axios.post('http://localhost:8081/api/v1/checkout', {}, { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } });
    clearCart();
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, checkout }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
