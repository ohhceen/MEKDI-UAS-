// 📂 contexts/CartContext.tsx
import React, { createContext, useState, useContext } from 'react';

type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: any, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: any, qty: number) => {
    setItems((prevItems) => {
      // Cek apakah barang sudah ada di keranjang?
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        // Jika ada, tambah jumlahnya saja
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      } else {
        // Jika belum, masukkan sebagai barang baru
        return [...prevItems, { ...product, quantity: qty }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  // Hitung total harga & total item otomatis
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalPrice, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};