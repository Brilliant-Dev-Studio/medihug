'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Plus } from 'lucide-react';

interface Product {
  id: string; name: string; nameEn: string | null;
  imageUrl: string | null; price: number; stock: number;
}

function Skel({ className }: { className: string }) {
  return <div className={`bg-gray-100 rounded-md animate-pulse ${className}`} />;
}

function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <Skel className="aspect-square rounded-none" />
          <div className="p-3 flex flex-col gap-2">
            <Skel className="h-3.5 w-3/4" />
            <div className="flex items-center justify-between">
              <Skel className="h-3 w-1/3" />
              <Skel className="h-2.5 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PartnerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/partner/products')
      .then(r => r.json())
      .then(d => setProducts(d.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">Products</h1>
        <Link href="/partner/products/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#3b5bdb' }}>
          <Plus size={16} /> New Product
        </Link>
      </div>

      {loading ? (
        <ProductsSkeleton />
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <ShoppingBag className="w-8 h-8 mx-auto text-gray-200 mb-2" />
          <p className="text-sm text-gray-400 mb-4">No products linked to this clinic yet.</p>
          <Link href="/partner/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#3b5bdb' }}>
            <Plus size={16} /> Add your first product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="relative aspect-square bg-gray-50">
                {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover" />}
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-gray-800 truncate">{p.nameEn ?? p.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs font-bold" style={{ color: '#3b5bdb' }}>{p.price.toLocaleString()} MMK</p>
                  <p className="text-[10px] text-gray-400">Stock: {p.stock}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
