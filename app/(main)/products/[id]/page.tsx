'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Star, Package, Loader2, ShoppingCart } from 'lucide-react';
import { useLang } from '@/app/lib/LanguageContext';

const PRIMARY = '#0d2b6e';

type Product = {
  id: string;
  name: string;
  nameEn: string | null;
  imageUrl: string | null;
  category: string | null;
  packSize: string | null;
  brand: string | null;
  price: number;
  stock: number;
  rating: number;
  reviewCount: number;
  description: string | null;
  keyBenefits: string[];
  isActive: boolean;
};

export default function PublicProductDetailPage() {
  const { id }   = useParams();
  const { lang } = useLang();
  const mm       = lang === 'mm';
  const router   = useRouter();

  const [product,  setProduct]  = useState<Product | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setProduct(d.product); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  function handleBuyNow() {
    let isAuthed = false;
    try { isAuthed = !!JSON.parse(localStorage.getItem('medihug_patient') ?? 'null')?.phone; } catch {}
    router.push(isAuthed ? `/patient/records/${id}` : '/signin');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-6">
        <Package className="w-12 h-12 text-gray-200" />
        <p className="text-gray-400">{mm ? 'ကုန်ပစ္စည်း မတွေ့ပါ' : 'Product not found'}</p>
        <Link href="/products" className="text-sm font-semibold" style={{ color: PRIMARY }}>
          ← {mm ? 'ပြန်သွားမည်' : 'Back to products'}
        </Link>
      </div>
    );
  }

  const name = mm ? product.name : (product.nameEn ?? product.name);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" /> {mm ? 'ကုန်ပစ္စည်းများသို့' : 'Back to Products'}
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={name} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-200" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            {product.category && <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{product.category}</p>}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{name}</h1>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4" fill={s < Math.round(product.rating) ? '#f59e0b' : 'none'} stroke={s < Math.round(product.rating) ? '#f59e0b' : '#d1d5db'} />
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.rating.toFixed(1)} ({product.reviewCount})</span>
              {product.packSize && <span className="text-xs text-gray-400 ml-2">{product.packSize}</span>}
            </div>

            <p className="text-3xl font-extrabold" style={{ color: PRIMARY }}>
              {product.price.toLocaleString()} <span className="text-base font-semibold text-gray-400">MMK</span>
            </p>

            <button
              onClick={handleBuyNow}
              className="inline-flex items-center justify-center gap-2 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity w-full sm:w-fit"
              style={{ backgroundColor: PRIMARY }}
            >
              <ShoppingCart className="w-4 h-4" />
              {mm ? 'ယခုဝယ်ယူမည်' : 'Buy Now'}
            </button>

            {product.description && <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>}

            {product.keyBenefits?.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {product.keyBenefits.map((b, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: PRIMARY }} />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
