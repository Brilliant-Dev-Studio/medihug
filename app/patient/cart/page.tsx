'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingCart, ShoppingBag, Minus, Plus, Trash2, Package, Loader2, ArrowLeft,
  Sparkles, Check, Store,
} from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';
import { useCart } from '../../lib/useCart';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';

interface Product {
  id: string; name: string; nameEn: string | null;
  imageUrl: string | null; price: number; stock: number; packSize: string | null;
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className="shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors"
      style={{ borderColor: checked ? PRIMARY : '#d1d5db', backgroundColor: checked ? PRIMARY : 'transparent' }}>
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </button>
  );
}

export default function CartPage() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const { lines, setQuantity, removeItem } = useCart();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (lines.length === 0) { setProducts({}); setLoading(false); return; }
    setLoading(true);
    Promise.all(lines.map(l => fetch(`/api/admin/products/${l.productId}`).then(r => r.ok ? r.json() : null)))
      .then(results => {
        const map: Record<string, Product> = {};
        results.forEach(r => { if (r?.product) map[r.product.id] = r.product; });
        setProducts(map);
        setSelected(prev => {
          const ids = lines.map(l => l.productId);
          const next = new Set(prev.size === 0 ? ids : [...prev].filter(id => ids.includes(id)));
          ids.forEach(id => { if (prev.size === 0) next.add(id); });
          return next;
        });
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.map(l => l.productId).join(',')]);

  const toggleOne = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const allIds = lines.map(l => l.productId);
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(allIds));

  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const selectedCount = lines.filter(l => selected.has(l.productId)).reduce((sum, l) => sum + l.quantity, 0);
  const selectedTotal = lines.reduce((sum, l) => {
    if (!selected.has(l.productId)) return sum;
    const p = products[l.productId];
    return sum + (p ? p.price * l.quantity : 0);
  }, 0);

  return (
    <div className="min-h-full bg-gray-50">

      {/* Compact header */}
      <div className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4 flex items-center gap-3">
        <Link href="/patient/records" className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center shrink-0 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>
        <ShoppingCart className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
        <h1 className="text-base font-bold text-gray-800">{mm ? 'ဈေးဝယ်ခြင်း' : 'My Cart'}</h1>
        {itemCount > 0 && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PRIMARY}14`, color: PRIMARY }}>
            {itemCount}
          </span>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-5 pb-28 lg:pb-8">

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} />
          </div>
        ) : lines.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center text-center gap-3">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${PRIMARY}18 0%, ${SECONDARY}0f 100%)` }}>
              <ShoppingBag className="w-8 h-8" style={{ color: PRIMARY }} />
            </div>
            <p className="text-sm font-bold text-gray-700 mt-1">{mm ? 'ဈေးခြင်းထဲ ဘာမှ မရှိသေးပါ' : 'Your cart is empty'}</p>
            <p className="text-xs text-gray-400 max-w-[220px]">{mm ? 'ကြိုက်နှစ်သက်ရာ ကုန်ပစ္စည်းများ ရွေးချယ်ပြီး ဈေးခြင်းထဲ ထည့်ပါ' : 'Browse products and add your favorites to the cart'}</p>
            <Link href="/patient/records"
              className="flex items-center gap-2 text-xs font-bold px-6 py-3 rounded-2xl text-white mt-2 shadow-sm hover:opacity-90 transition-opacity"
              style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
              <Sparkles className="w-3.5 h-3.5" />
              {mm ? 'ကုန်ပစ္စည်းများ ကြည့်ရန်' : 'Browse Products'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

            {/* ── Left: item list ── */}
            <div className="lg:col-span-2 flex flex-col gap-3">

              {/* Store-style group header */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 bg-gray-50/60">
                  <Checkbox checked={allSelected} onChange={toggleAll} />
                  <Store className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs font-bold text-gray-500">{mm ? 'MediHug ဆေးဆိုင်' : 'MediHug Pharmacy'}</p>
                  <span className="text-[10px] font-semibold text-gray-400 ml-auto">{mm ? 'အားလုံးရွေးမည်' : 'Select all'}</span>
                </div>

                {/* Column labels — desktop only */}
                <div className="hidden lg:flex items-center gap-3 px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span className="w-5" />
                  <span className="flex-1">{mm ? 'ကုန်ပစ္စည်း' : 'Product'}</span>
                  <span className="w-28 text-center">{mm ? 'အရေအတွက်' : 'Quantity'}</span>
                  <span className="w-24 text-right">{mm ? 'ငွေပေါင်း' : 'Subtotal'}</span>
                  <span className="w-8" />
                </div>

                <div className="divide-y divide-gray-50">
                  {lines.map(line => {
                    const p = products[line.productId];
                    if (!p) return null;
                    const name = mm ? p.name : (p.nameEn ?? p.name);
                    const lineTotal = p.price * line.quantity;
                    const isSel = selected.has(line.productId);
                    return (
                      <div key={line.productId} className="flex items-center gap-3 px-4 py-4">
                        <Checkbox checked={isSel} onChange={() => toggleOne(line.productId)} />

                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                          {p.imageUrl ? (
                            <Image src={p.imageUrl} alt={name} fill sizes="64px" className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center"><Package className="w-6 h-6 text-gray-300" /></div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <Link href={`/patient/records/${p.id}`} className="text-sm font-semibold text-gray-800 hover:underline block truncate">{name}</Link>
                          {p.packSize && <p className="text-[11px] text-gray-400 mt-0.5">{p.packSize}</p>}
                          <p className="text-sm font-bold mt-1" style={{ color: PRIMARY }}>{p.price.toLocaleString()} Ks</p>
                          {/* Mobile: qty + subtotal + remove inline */}
                          <div className="flex lg:hidden items-center justify-between mt-2">
                            <div className="flex items-center gap-0.5 rounded-full border border-gray-200 bg-gray-50 p-0.5">
                              <button onClick={() => setQuantity(line.productId, line.quantity - 1)}
                                className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-bold text-gray-700">{line.quantity}</span>
                              <button onClick={() => setQuantity(line.productId, Math.min(p.stock, line.quantity + 1))} disabled={line.quantity >= p.stock}
                                className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 disabled:opacity-30">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-gray-700">{lineTotal.toLocaleString()} Ks</p>
                              <button onClick={() => removeItem(line.productId)} className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Desktop columns */}
                        <div className="hidden lg:flex w-28 justify-center">
                          <div className="flex items-center gap-0.5 rounded-full border border-gray-200 bg-gray-50 p-0.5">
                            <button onClick={() => setQuantity(line.productId, line.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-gray-700">{line.quantity}</span>
                            <button onClick={() => setQuantity(line.productId, Math.min(p.stock, line.quantity + 1))} disabled={line.quantity >= p.stock}
                              className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-30 transition-colors">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="hidden lg:block w-24 text-right text-sm font-bold text-gray-800">{lineTotal.toLocaleString()}</p>
                        <button onClick={() => removeItem(line.productId)}
                          className="hidden lg:flex w-8 h-8 rounded-full items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Right: sticky order summary (desktop) ── */}
            <div className="hidden lg:block">
              <div className="sticky top-5 bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3.5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{mm ? 'ငွေရှင်းအကျဉ်း' : 'Order Summary'}</p>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-500">{mm ? `ရွေးချယ်ထား (${selectedCount})` : `Selected (${selectedCount})`}</p>
                  <p className="font-semibold text-gray-700">{selectedTotal.toLocaleString()} Ks</p>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-700">{mm ? 'စုစုပေါင်း' : 'Total'}</p>
                  <p className="text-2xl font-bold" style={{ color: PRIMARY }}>{selectedTotal.toLocaleString()} <span className="text-sm font-semibold text-gray-400">Ks</span></p>
                </div>
                <button disabled
                  className="w-full py-3.5 rounded-2xl text-sm font-bold text-white opacity-50 cursor-not-allowed mt-1"
                  style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
                  {mm ? `အော်ဒါတင်မည် (${selectedCount})` : `Checkout (${selectedCount})`}
                </button>
                <p className="text-[11px] text-gray-400 text-center -mt-1">
                  {mm ? 'Checkout function ကို မကြာမီ ထည့်သွင်းပေးပါမည်' : "Checkout isn't live yet — coming soon."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile sticky checkout bar ── */}
      {lines.length > 0 && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
          <Checkbox checked={allSelected} onChange={toggleAll} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 leading-none">{mm ? 'စုစုပေါင်း' : 'Total'}</p>
            <p className="text-base font-bold leading-tight" style={{ color: PRIMARY }}>{selectedTotal.toLocaleString()} Ks</p>
          </div>
          <button disabled
            className="px-6 py-3 rounded-2xl text-sm font-bold text-white opacity-50 cursor-not-allowed shrink-0"
            style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
            {mm ? `အော်ဒါတင်မည် (${selectedCount})` : `Checkout (${selectedCount})`}
          </button>
        </div>
      )}
    </div>
  );
}
