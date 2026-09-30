'use client';

import { useState, useEffect, useCallback } from 'react';

const CART_KEY = 'medihug_cart';
const CART_EVENT = 'medihug-cart-updated';

// sizeId is null for a product with no sizes; a product WITH sizes can appear as several
// distinct lines (one per size), so the cart's real identity per line is (productId, sizeId).
export interface CartLine { productId: string; sizeId: string | null; quantity: number; }

/** Stable identity for a cart line, since (productId, sizeId) is a compound key. */
export function cartLineKey(productId: string, sizeId?: string | null): string {
  return `${productId}::${sizeId ?? ''}`;
}

function readCart(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');
    // Back-compat: lines saved before sizes existed have no sizeId field at all.
    return (Array.isArray(raw) ? raw : []).map((l: { productId: string; sizeId?: string | null; quantity: number }) => ({
      productId: l.productId, sizeId: l.sizeId ?? null, quantity: l.quantity,
    }));
  } catch { return []; }
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

  const add = useCallback((productId: string, quantity = 1, sizeId: string | null = null) => {
    const current = readCart();
    const existing = current.find(l => l.productId === productId && l.sizeId === sizeId);
    const next = existing
      ? current.map(l => (l.productId === productId && l.sizeId === sizeId) ? { ...l, quantity: l.quantity + quantity } : l)
      : [...current, { productId, sizeId, quantity }];
    writeCart(next);
  }, []);

  const setQuantity = useCallback((productId: string, sizeId: string | null, quantity: number) => {
    const current = readCart();
    const next = quantity <= 0
      ? current.filter(l => !(l.productId === productId && l.sizeId === sizeId))
      : current.map(l => (l.productId === productId && l.sizeId === sizeId) ? { ...l, quantity } : l);
    writeCart(next);
  }, []);

  const removeItem = useCallback((productId: string, sizeId: string | null = null) => {
    writeCart(readCart().filter(l => !(l.productId === productId && l.sizeId === sizeId)));
  }, []);

  const clear = useCallback(() => writeCart([]), []);

  const count = lines.reduce((sum, l) => sum + l.quantity, 0);

  return { lines, count, add, setQuantity, removeItem, clear };
}
