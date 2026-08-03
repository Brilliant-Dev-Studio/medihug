'use client';

import { useState, useEffect, useCallback } from 'react';

const CART_KEY = 'medihug_cart';
const CART_EVENT = 'medihug-cart-updated';

export interface CartLine { productId: string; quantity: number; }

function readCart(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]'); } catch { return []; }
}

function writeCart(lines: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    setLines(readCart());
    const sync = () => setLines(readCart());
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener(CART_EVENT, sync); window.removeEventListener('storage', sync); };
  }, []);

  const add = useCallback((productId: string, quantity = 1) => {
    const current = readCart();
    const existing = current.find(l => l.productId === productId);
    const next = existing
      ? current.map(l => l.productId === productId ? { ...l, quantity: l.quantity + quantity } : l)
      : [...current, { productId, quantity }];
    writeCart(next);
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const current = readCart();
    const next = quantity <= 0
      ? current.filter(l => l.productId !== productId)
      : current.map(l => l.productId === productId ? { ...l, quantity } : l);
    writeCart(next);
  }, []);

  const removeItem = useCallback((productId: string) => {
    writeCart(readCart().filter(l => l.productId !== productId));
  }, []);

  const clear = useCallback(() => writeCart([]), []);

  const count = lines.reduce((sum, l) => sum + l.quantity, 0);

  return { lines, count, add, setQuantity, removeItem, clear };
}
