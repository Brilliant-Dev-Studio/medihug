'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, ImagePlus, Package, Search, X, ChevronDown, Plus } from 'lucide-react';

const PRIMARY = '#2ab5ad';
const inp = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad] transition-colors';
const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';

interface Product {
  id: string; name: string; nameEn: string | null;
  description: string | null; price: number; stock: number;
  imageUrl: string | null; category: string | null; isActive: boolean;
  brand: string | null; type: string | null; strength: string | null;
  packSize: string | null; tags: string[]; keyBenefits: string[];
  rating: number; reviewCount: number;
}
interface Category { id: string; name: string; nameEn: string | null; }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <h2 className="font-semibold text-gray-700 text-sm">{title}</h2>
      {children}
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)} aria-label={label}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${on ? 'bg-[#2ab5ad]' : 'bg-gray-300'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function CategoryDropdown({ value, onChange, categories }: {
  value: string; onChange: (v: string) => void; categories: Category[];
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen]   = useState(false);
  const ref               = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const selected = categories.find(c => c.name === value);
  const filtered = categories.filter(c => !query || c.name.toLowerCase().includes(query.toLowerCase()) || (c.nameEn ?? '').toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 cursor-pointer rounded-xl border bg-gray-50 px-3 py-2.5 text-sm transition-colors ${open ? 'border-[#2ab5ad] ring-2 ring-[#2ab5ad]/40' : 'border-gray-200 hover:border-gray-300'}`}>
        {selected ? (
          <><span className="flex-1 text-gray-800">{selected.name}</span>
            {selected.nameEn && <span className="text-gray-400 text-xs">{selected.nameEn}</span>}
            <button type="button" onClick={e => { e.stopPropagation(); onChange(''); setQuery(''); }} className="shrink-0 text-gray-400 hover:text-red-400"><X size={14} /></button></>
        ) : (
          <><span className="flex-1 text-gray-400">Select category...</span>
            <ChevronDown size={14} className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} /></>
        )}
      </div>
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#2ab5ad]"
                placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)} onClick={e => e.stopPropagation()} autoFocus />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">No categories found</p>
              : filtered.map(c => (
                <button key={c.id} type="button" onClick={() => { onChange(c.name); setQuery(''); setOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${value === c.name ? 'bg-teal-50 text-[#2ab5ad] font-medium' : 'text-gray-700'}`}>
                  <span>{c.name}</span>
                  {c.nameEn && <span className="text-xs text-gray-400 ml-2">{c.nameEn}</span>}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [val, setVal] = useState('');
  const add = () => {
    const v = val.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setVal('');
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input className={inp} value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="e.g. 500mg, Tablet..." />
        <button type="button" onClick={add} className="shrink-0 px-3 py-2 rounded-xl text-white text-sm font-semibold" style={{ backgroundColor: PRIMARY }}>
          <Plus size={16} />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => (
            <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium">
              {t}
              <button type="button" onClick={() => onChange(tags.filter(x => x !== t))} className="text-teal-400 hover:text-teal-700"><X size={11} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function BenefitsList({ benefits, onChange }: { benefits: string[]; onChange: (b: string[]) => void }) {
  const [val, setVal] = useState('');
  const add = () => {
    const v = val.trim();
    if (v) { onChange([...benefits, v]); setVal(''); }
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input className={inp} value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="e.g. Reduces fever effectively" />
        <button type="button" onClick={add} className="shrink-0 px-3 py-2 rounded-xl text-white text-sm font-semibold" style={{ backgroundColor: PRIMARY }}>
          <Plus size={16} />
        </button>
      </div>
      {benefits.length > 0 && (
        <ul className="space-y-1">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
              <span className="flex-1">{b}</span>
              <button type="button" onClick={() => onChange(benefits.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400"><X size={13} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct]       = useState<Product | null>(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm]             = useState({
    name: '', nameEn: '', description: '',
    price: 0, stock: 0, imageUrl: '', category: '', isActive: true,
    brand: '', type: '', strength: '', packSize: '',
    tags: [] as string[], keyBenefits: [] as string[],
    rating: 0, reviewCount: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/products/${id}`).then(r => r.json()),
      fetch('/api/admin/product-categories').then(r => r.json()),
    ]).then(([pd, cd]) => {
      const p: Product = pd.product;
      setProduct(p);
      setCategories(cd.categories ?? []);
      setForm({
        name:        p.name,
        nameEn:      p.nameEn      ?? '',
        description: p.description ?? '',
        price:       p.price,
        stock:       p.stock,
        imageUrl:    p.imageUrl    ?? '',
        category:    p.category    ?? '',
        isActive:    p.isActive,
        brand:       p.brand       ?? '',
        type:        p.type        ?? '',
        strength:    p.strength    ?? '',
        packSize:    p.packSize    ?? '',
        tags:        p.tags        ?? [],
        keyBenefits: p.keyBenefits ?? [],
        rating:      p.rating      ?? 0,
        reviewCount: p.reviewCount ?? 0,
      });
      setLoading(false);
    });
  }, [id]);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Product name is required.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:        form.name,
          nameEn:      form.nameEn      || null,
          description: form.description || null,
          price:       Number(form.price),
          stock:       Number(form.stock),
          imageUrl:    form.imageUrl    || null,
          category:    form.category    || null,
          brand:       form.brand       || null,
          type:        form.type        || null,
          strength:    form.strength    || null,
          packSize:    form.packSize    || null,
          tags:        form.tags,
          keyBenefits: form.keyBenefits,
          rating:      Number(form.rating),
          reviewCount: Number(form.reviewCount),
          isActive:    form.isActive,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Error'); return; }
      router.push('/admin/products');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 size={28} className="animate-spin text-[#2ab5ad]" />
    </div>
  );
  if (!product) return (
    <div className="flex items-center justify-center h-[60vh] text-gray-400">Product not found</div>
  );

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/products')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
          <div className="flex items-center gap-3">
            {product.imageUrl
              ? <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-xl object-cover border border-gray-100" />
              : <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center"><Package size={18} className="text-gray-400" /></div>}
            <div>
              <h1 className="text-xl font-bold text-gray-800">{product.name}</h1>
              {product.nameEn && <p className="text-xs text-gray-400">{product.nameEn}</p>}
            </div>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 hover:opacity-90"
          style={{ backgroundColor: PRIMARY }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}

      <div className="grid grid-cols-2 gap-5">
        {/* LEFT */}
        <div className="space-y-5">
          <Section title="Product Info">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Name (Myanmar) *</label>
                <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Name (English)</label>
                <input className={inp} value={form.nameEn} onChange={e => set('nameEn', e.target.value)} />
              </div>
            </div>
            <div>
              <label className={lbl}>Category</label>
              <CategoryDropdown value={form.category} onChange={v => set('category', v)} categories={categories} />
            </div>
            <div>
              <label className={lbl}>Description</label>
              <textarea className={inp + ' resize-none'} rows={4} value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </Section>

          <Section title="Product Details">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Brand</label>
                <input className={inp} value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. Panadol" />
              </div>
              <div>
                <label className={lbl}>Type</label>
                <input className={inp} value={form.type} onChange={e => set('type', e.target.value)} placeholder="e.g. Tablet, Capsule, Syrup" />
              </div>
              <div>
                <label className={lbl}>Strength</label>
                <input className={inp} value={form.strength} onChange={e => set('strength', e.target.value)} placeholder="e.g. 500mg" />
              </div>
              <div>
                <label className={lbl}>Pack Size</label>
                <input className={inp} value={form.packSize} onChange={e => set('packSize', e.target.value)} placeholder="e.g. 10 tablets/strip" />
              </div>
            </div>
          </Section>

          <Section title="Pricing & Stock">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Price (Ks)</label>
                <input className={inp} type="number" min={0} value={form.price} onChange={e => set('price', e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Stock Quantity</label>
                <input className={inp} type="number" min={0} value={form.stock} onChange={e => set('stock', e.target.value)} />
              </div>
            </div>
          </Section>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          <Section title="Image">
            <p className="text-xs text-gray-400 -mt-2">S3 upload coming soon — use URL for now</p>
            <div>
              <label className={lbl}>Image URL</label>
              <div className="flex gap-2">
                <input className={inp} value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://..." />
                <button type="button" disabled title="S3 upload — coming soon"
                  className="shrink-0 px-3 py-2.5 rounded-xl border border-dashed border-gray-300 text-gray-400 disabled:cursor-not-allowed">
                  <ImagePlus size={16} />
                </button>
              </div>
              {form.imageUrl && (
                <img src={form.imageUrl} alt="preview" className="mt-3 h-40 w-40 rounded-2xl object-cover border border-gray-100"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
            </div>
          </Section>

          <Section title="Tags">
            <p className="text-xs text-gray-400 -mt-2">Short labels shown on product (e.g. 500mg, Tablet)</p>
            <TagInput tags={form.tags} onChange={v => set('tags', v)} />
          </Section>

          <Section title="Key Benefits">
            <p className="text-xs text-gray-400 -mt-2">Bullet points shown on product detail page</p>
            <BenefitsList benefits={form.keyBenefits} onChange={v => set('keyBenefits', v)} />
          </Section>

          <Section title="Settings">
            <div>
              <label className={lbl}>Rating (0–5)</label>
              <input className={inp} type="number" min={0} max={5} step={0.1} value={form.rating} onChange={e => set('rating', e.target.value)} />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-700">Active</p>
                <p className="text-xs text-gray-400">Show this product to patients</p>
              </div>
              <Toggle on={form.isActive} onChange={v => set('isActive', v)} label="Active" />
            </div>
          </Section>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex justify-end gap-3 pb-2">
        <button onClick={() => router.push('/admin/products')} className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={handleSave} disabled={saving}
          className="px-8 py-3 rounded-xl text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 hover:opacity-90"
          style={{ backgroundColor: PRIMARY }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
