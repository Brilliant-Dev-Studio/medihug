'use client';
import { theme } from '../../../lib/theme'; void theme;

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ChevronLeft, Star, Heart, Package, Shield, Truck,
  CheckCircle2, ZoomIn, X, Loader2, Minus, Plus, ShoppingCart,
} from 'lucide-react';
import { useLang } from '../../../lib/LanguageContext';
import { useFavorites } from '../../../lib/useFavorites';
import { useCart } from '../../../lib/useCart';
import IdentifyModal from '../../../components/IdentifyModal';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';

type Product = {
  id: string;
  name: string;
  nameEn: string | null;
  imageUrl: string | null;
  category: string | null;
  packSize: string | null;
  brand: string | null;
  type: string | null;
  strength: string | null;
  price: number;
  stock: number;
  rating: number;
  reviewCount: number;
  description: string | null;
  keyBenefits: string[];
  tags: string[];
  isActive: boolean;
};

export default function ProductDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const { lang } = useLang();
  const mm       = lang === 'mm';

  const [product,   setProduct]   = useState<Product | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [notFound,  setNotFound]  = useState(false);
  const { favorites, toggle: toggleFav, needsIdentity, closeIdentity, submitIdentity } = useFavorites('product');
  const [zoom,      setZoom]      = useState(false);
  const [qty, setQty] = useState(1);
  const { add: addToCart } = useCart();

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setProduct(d.product); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-400 gap-3">
        <Package className="w-12 h-12 text-gray-300" />
        <p className="text-sm">{mm ? 'ကုန်ပစ္စည်း မတွေ့ပါ' : 'Product not found'}</p>
        <button onClick={() => router.back()} className="text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50">
          {mm ? 'နောက်သို့' : 'Go back'}
        </button>
      </div>
    );
  }

  const favorited = favorites.has(product.id);

  // Build specs from real fields
  const specs = [
    product.type     ? { label_mm: 'အမျိုးအစား', label_en: 'Type',      value: product.type }     : null,
    product.strength ? { label_mm: 'ပါဝင်မှု',   label_en: 'Strength',  value: product.strength } : null,
    product.packSize ? { label_mm: 'ထုပ်ပိုးမှု', label_en: 'Pack Size', value: product.packSize } : null,
    product.brand    ? { label_mm: 'ထုတ်လုပ်သူ', label_en: 'Brand',     value: product.brand }    : null,
  ].filter((s): s is NonNullable<typeof s> => s !== null);

  const handleAddToCart = () => {
    addToCart(product.id, qty);
    toast.success(mm ? 'ဈေးခြင်းထဲ ထည့်ပြီးပါပြီ' : 'Added to cart');
    setQty(1);
  };

  const qtyStepper = (
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-1 py-1 w-fit">
      <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50">
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-6 text-center text-sm font-bold text-gray-700">{qty}</span>
      <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30">
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  /* ── Lightbox ── */
  const lightbox = zoom && product.imageUrl && (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setZoom(false)}>
      <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
        <X className="w-5 h-5 text-white" />
      </button>
      <div className="relative w-full max-w-2xl aspect-square mx-8" onClick={e => e.stopPropagation()}>
        <Image src={product.imageUrl} alt={product.name} fill className="object-contain" />
      </div>
    </div>
  );

  /* ── Image block ── */
  const imageBlock = (
    <div className="relative overflow-hidden bg-gray-100 cursor-zoom-in rounded-2xl" style={{ paddingBottom: '80%' }}
      onClick={() => product.imageUrl && setZoom(true)}>
      {product.imageUrl ? (
        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="w-16 h-16 text-gray-300" />
        </div>
      )}
      {/* Favorite */}
      <button onClick={e => { e.stopPropagation(); toggleFav(product.id); }}
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
        <Heart className="w-4.5 h-4.5" fill={favorited ? '#ef4444' : 'none'} stroke={favorited ? '#ef4444' : '#9ca3af'} />
      </button>
      {/* Category badge */}
      {product.category && (
        <span className="absolute top-3 left-3 z-10 text-xs font-semibold px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm" style={{ color: PRIMARY }}>
          {product.category}
        </span>
      )}
      {/* Zoom icon */}
      {product.imageUrl && (
        <span className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <ZoomIn className="w-4 h-4 text-white" />
        </span>
      )}
      {/* Pack size */}
      {product.packSize && (
        <span className="absolute bottom-3 left-3 z-10 text-xs font-semibold px-3 py-1 rounded-full bg-black/40 text-white">
          {product.packSize}
        </span>
      )}
    </div>
  );

  /* ── Product info ── */
  const productInfo = (
    <div className="flex flex-col gap-4">
      {/* Name + rating */}
      <div>
        <h1 className="text-xl font-bold leading-snug" style={{ color: PRIMARY }}>{product.name}</h1>
        {product.nameEn && <p className="text-sm text-gray-500 mt-0.5">{product.nameEn}</p>}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className="w-3.5 h-3.5" fill={s <= Math.round(product.rating) ? '#facc15' : 'none'} stroke="#facc15" />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({product.reviewCount} {mm ? 'သုံးစွဲသူ' : 'reviews'})</span>
          {product.packSize && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 ml-1">{product.packSize}</span>
          )}
        </div>
        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {product.tags.map(t => (
              <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${PRIMARY}15`, color: PRIMARY }}>{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold" style={{ color: PRIMARY }}>{product.price.toLocaleString()}</span>
        <span className="text-sm font-semibold text-gray-400">Ks</span>
        {product.stock <= 0 && (
          <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full ml-2">
            {mm ? 'ကုန်သွားပြီ' : 'Out of stock'}
          </span>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* Key Benefits */}
      {product.keyBenefits.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{mm ? 'အကျိုးကျေးဇူးများ' : 'Key Benefits'}</p>
          <div className="flex flex-col gap-1.5">
            {product.keyBenefits.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#10b981' }} />
                <span className="text-sm text-gray-700">{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specs */}
      {specs.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{mm ? 'ကုန်ပစ္စည်း အချက်အလက်' : 'Product Details'}</p>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            {specs.map((s, i) => (
              <div key={i} className={`flex items-center px-4 py-2.5 ${i !== specs.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <span className="text-xs text-gray-400 w-32 shrink-0">{mm ? s.label_mm : s.label_en}</span>
                <span className="text-xs font-semibold text-gray-700">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Shield,  mm: 'အာမခံချက်',             en: 'Guaranteed'   },
          { icon: Package, mm: 'လုံခြုံသောထုပ်ပိုးမှု', en: 'Safe Packing' },
          { icon: Truck,   mm: 'လျင်မြန်သောဆောင်ရွက်ချက်', en: 'Fast Delivery' },
        ].map(({ icon: Icon, mm: lMm, en: lEn }) => (
          <div key={lEn} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl">
            <Icon className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] font-semibold text-gray-500 text-center leading-tight">{mm ? lMm : lEn}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const addToCartButton = (
    <button onClick={handleAddToCart} disabled={product.stock <= 0}
      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ backgroundColor: PRIMARY }}>
      <ShoppingCart className="w-4 h-4" />
      {mm ? 'ဈေးခြင်းထဲ ထည့်မည်' : 'Add to Cart'}
    </button>
  );

  return (
    <>
      {lightbox}
      <div className="min-h-full bg-gray-50 lg:bg-gray-100">

        {/* ══ DESKTOP ══ */}
        <div className="hidden lg:flex gap-5 h-screen overflow-hidden px-6 py-6">
          {/* Left: image + info */}
          <div className="flex-1 overflow-y-auto rounded-2xl bg-white flex flex-col">
            <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
              <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-sm font-semibold" style={{ color: PRIMARY }}>{mm ? 'ကုန်ပစ္စည်း အချက်အလက်' : 'Product Detail'}</span>
            </div>
            <div className="flex gap-8 p-6 flex-1">
              <div className="w-80 shrink-0">{imageBlock}</div>
              <div className="flex-1 min-w-0">{productInfo}</div>
            </div>
          </div>

          {/* Right: order card */}
          <div className="shrink-0 w-72">
            <div className="sticky top-0 rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
              <div className="px-5 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
                <p className="text-white/60 text-xs mb-1">{mm ? 'တန်ဖိုး' : 'Price'}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{product.price.toLocaleString()}</span>
                  <span className="text-sm font-semibold text-white/60">Ks</span>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className="w-3 h-3" fill={s <= Math.round(product.rating) ? '#facc15' : 'none'} stroke="#facc15" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-white/80">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-white/50">({product.reviewCount})</span>
                </div>
              </div>

              <div className="bg-white px-5 py-4 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Package,      mm: 'မြန်ဆန်သောဆောင်ရွက်ချက်', en: 'Fast Delivery'    },
                    { icon: Shield,       mm: 'စစ်မှန်သောကုန်ပစ္စည်း',   en: 'Genuine Product'  },
                    { icon: Truck,        mm: 'လုံခြုံသောထုပ်ပိုးမှု',    en: 'Safe Packing'     },
                    { icon: CheckCircle2, mm: 'အရည်အသွေး အာမခံ',         en: 'Quality Assured'  },
                  ].map(({ icon: Icon, mm: lMm, en: lEn }) => (
                    <div key={lEn} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: SECONDARY }} />
                      <span className="text-[10px] font-semibold text-gray-600 leading-tight">{mm ? lMm : lEn}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500">{mm ? 'အရေအတွက်' : 'Quantity'}</p>
                  {qtyStepper}
                </div>

                {addToCartButton}

                <button onClick={() => toggleFav(product.id)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border font-semibold text-sm transition-all"
                  style={{ borderColor: favorited ? '#ef4444' : '#e5e7eb', color: favorited ? '#ef4444' : '#9ca3af', backgroundColor: favorited ? '#fff5f5' : '#fafafa' }}>
                  <Heart className="w-4 h-4" fill={favorited ? '#ef4444' : 'none'} />
                  {mm ? (favorited ? 'သိမ်းဆည်းထားသည်' : 'နှစ်သက်သောပစ္စည်းများ') : (favorited ? 'Saved' : 'Save to Wishlist')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ══ MOBILE ══ */}
        <div className="lg:hidden">
          <div className="flex items-center gap-3 px-4 py-3"
            style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
            <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <span className="text-sm font-semibold text-white truncate">{product.name}</span>
          </div>

          {imageBlock}

          <div className="px-4 py-5 pb-36 flex flex-col gap-5">{productInfo}</div>

          <div className="fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-2.5">
            <button onClick={() => toggleFav(product.id)}
              className="w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 transition-all"
              style={{ borderColor: favorited ? '#ef4444' : '#e5e7eb' }}>
              <Heart className="w-4.5 h-4.5" fill={favorited ? '#ef4444' : 'none'} stroke={favorited ? '#ef4444' : '#9ca3af'} />
            </button>
            {qtyStepper}
            <div className="flex-1 min-w-0">{addToCartButton}</div>
          </div>
        </div>
      </div>

      {needsIdentity && <IdentifyModal mm={mm} onClose={closeIdentity} onSubmit={submitIdentity} />}
    </>
  );
}
