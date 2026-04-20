import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = (product, quantity, notes, options = {}) => {
    const addons = options.addons || [];
    const removedIngredients = options.removedIngredients || [];
    const addonsTotal = addons.reduce((s, a) => s + (Number(a.price) || 0), 0);
    const unitPrice = (Number(product.price) || 0) + addonsTotal;

    setItems(prev => {
      const addonKey = addons.map(a => a.name).sort().join('|');
      const removedKey = [...removedIngredients].sort().join('|');
      const existing = prev.find(i =>
        i.product_id === product.id &&
        i.notes === (notes || '') &&
        (i.addonKey || '') === addonKey &&
        (i.removedKey || '') === removedKey
      );
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
        unit_price: unitPrice,
        subtotal: quantity * unitPrice,
        notes: notes || '',
        addons,
        removed_ingredients: removedIngredients,
        addonKey,
        removedKey,
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

  const updateItem = (index, { quantity, notes }) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const newQty = quantity ?? item.quantity;
      return { ...item, quantity: newQty, notes: notes ?? item.notes, subtotal: newQty * item.unit_price };
    }));
  };

  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, updateItem, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}