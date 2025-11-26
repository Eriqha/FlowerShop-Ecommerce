// src/context/CartContext.jsx
import React, { createContext, useEffect, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const initial = JSON.parse(localStorage.getItem('cart')) || [];
  const [cartItems, setCartItems] = useState(initial);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    if (!item || !item.product || !item.product._id) return;

    setCartItems(prev => {
      const exist = prev.find(i => i.product?._id === item.product._id);
      if (exist) {
        return prev.map(i =>
          i.product?._id === item.product._id
            ? {
                ...i,
                quantity: (i.quantity || 0) + (item.quantity || 1),
                addOns: mergeAddOns(i.addOns || [], item.addOns || [])
              }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const mergeAddOns = (existing, incoming) => {
    const merged = [...existing];
    incoming.forEach(inAdd => {
      if (!inAdd || !inAdd.addOnId) return;
      const found = merged.find(e => e.addOnId === inAdd.addOnId);
      if (found) {
        found.quantity = (found.quantity || 1) + (inAdd.quantity || 1);
        found.customMessage = inAdd.customMessage;
      } else {
        merged.push({ ...inAdd, quantity: inAdd.quantity || 1 });
      }
    });
    return merged;
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(i => i.product?._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems(prev => prev.map(i =>
      i.product?._id === productId ? { ...i, quantity } : i
    ));
  };

  // New: update add-on quantity
  const updateAddOnQuantity = (productId, addOnId, quantity) => {
    setCartItems(prev => prev.map(i => {
      if (i.product?._id === productId) {
        return {
          ...i,
          addOns: (i.addOns || []).map(a =>
            a.addOnId === addOnId ? { ...a, quantity } : a
          )
        };
      }
      return i;
    }));
  };

  // New: remove single add-on
  const removeAddOn = (productId, addOnId) => {
    setCartItems(prev => prev.map(i => {
      if (i.product?._id === productId) {
        return { ...i, addOns: (i.addOns || []).filter(a => a.addOnId !== addOnId) };
      }
      return i;
    }));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      updateAddOnQuantity,
      removeAddOn
    }}>
      {children}
    </CartContext.Provider>
  );
};
