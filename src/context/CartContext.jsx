import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = (product, quantity, notes) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id && i.notes === notes);
      if (existing) {
        return prev.map(i =>
          i === existing
            ? { ...i, quantity: i.quantity + quantity, subtotal: (i.quantity + quantity) * i.unit_price }
            : i
        );
      }
      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        product_image: product.image || '',
        quantity,
        unit_price: product.price,
        subtotal: quantity * product.price,
        notes: notes || ''
      }];
    });
  };

  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, quantity, subtotal: quantity * item.unit_price } : item
    ));
  };

  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}