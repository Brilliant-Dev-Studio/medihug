'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ArrowRight, Loader2, ChevronDown, Check, FileText, PenSquare,
  Search, Info, Image as ImageIcon, Rocket,
} from 'lucide-react';
import ImageDropzone from '@/components/admin/ImageDropzone';
import MarkdownEditor from '@/components/admin/MarkdownEditor';

const PRIMARY = '#2ab5ad';
const DARK    = '#1a9990';

interface BlogCategory { id: string; name: string; nameEn: string | null; }

const inp = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-[#2ab5ad] focus:bg-white focus:ring-4 focus:ring-[#2ab5ad]/10 transition-all';
const lbl = 'block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5';

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] p-6 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
          <Icon className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
        </div>
        <h2 className="font-bold text-gray-700 text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button" onClick={() => onChange(!on)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0"
      style={{ backgroundColor: on ? PRIMARY : '#d1d5db' }}
      aria-label={label}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

const EMPTY = {
  title: '', titleEn: '', content: '', excerpt: '',
  imageUrl: '', category: '', isPublished: false,
};

const STEPS = [
  { n: 1, label: 'Details',       icon: FileText },
  { n: 2, label: 'Write Content', icon: PenSquare },
] as const;

const primaryBtn = 'px-5 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 shadow-[0_4px_14px_-4px_rgba(42,181,173,0.5)] hover:shadow-[0_6px_18px_-4px_rgba(42,181,173,0.6)] hover:-translate-y-px active:translate-y-0 transition-all';
const ghostBtn   = 'px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors';

export default function NewBlogPage() {
  const router = useRouter();
  const [step, setStep]       = useState<1 | 2>(1);
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [catSearch, setCatSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/blog-categories').then(r => r.json()).then(d => setCategories(d.categories ?? []));
  }, []);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const goToStep2 = () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!form.title.trim())   { setError('Title is required.');   setStep(1); return; }
    if (!form.content.trim()) { setError('Content is required.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:       form.title,
          titleEn:     form.titleEn     || null,
          content:     form.content,
          excerpt:     form.excerpt     || null,
          imageUrl:    form.imageUrl    || null,
          category:    form.category    || null,
          isPublished: form.isPublished,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Error'); return; }
      router.push('/admin/blogs');
    } finally { setLoading(false); }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(catSearch.toLowerCase()) ||
    (c.nameEn ?? '').toLowerCase().includes(catSearch.toLowerCase()));

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => (step === 1 ? router.back() : setStep(1))} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Create Blog</h1>
            <p className="text-xs text-gray-400">{step === 1 ? 'Fill in the article details' : 'Write your story in Markdown'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.back()} className={ghostBtn}>
            Cancel
          </button>
          {step === 1 ? (
            <button onClick={goToStep2} className={primaryBtn} style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${DARK} 100%)` }}>
              Next: Write Content <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className={primaryBtn} style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${DARK} 100%)` }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={15} />}
              {loading ? 'Saving...' : (form.isPublished ? 'Publish Blog' : 'Save Draft')}
            </button>
          )}
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] px-6 py-4">
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const done   = step > s.n;
            const active = step === s.n;
            const Icon   = s.icon;
            const clickable = s.n === 1 || form.title.trim().length > 0;
            return (
              <div key={s.n} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && setStep(s.n)}
                  className="flex items-center gap-2.5 shrink-0 disabled:cursor-default group"
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all"
                    style={{
                      background: done ? `linear-gradient(135deg, ${PRIMARY} 0%, ${DARK} 100%)` : '#fff',
                      borderColor: done || active ? PRIMARY : '#e5e7eb',
                      boxShadow: active ? `0 0 0 4px ${PRIMARY}1a` : 'none',
                    }}>
                    {done
                      ? <Check className="w-4 h-4 text-white" />
                      : <Icon className="w-4 h-4" style={{ color: active ? PRIMARY : '#9ca3af' }} />}
                  </div>
                  <p className="text-xs font-bold whitespace-nowrap" style={{ color: active || done ? '#1f2937' : '#9ca3af' }}>{s.label}</p>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 rounded-full bg-gray-100 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ background: `linear-gradient(90deg, ${PRIMARY}, ${DARK})` }}
                      initial={false}
                      animate={{ width: done ? '100%' : '0%' }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <Info size={14} className="shrink-0" /> {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-5"
          >
            <Section title="Basic Info" icon={FileText}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Title (Myanmar) *</label>
                  <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="ဆောင်းပါး ခေါင်းစဉ်" />
                </div>
                <div>
                  <label className={lbl}>Title (English)</label>
                  <input className={inp} value={form.titleEn} onChange={e => set('titleEn', e.target.value)} placeholder="Article title" />
                </div>
              </div>

              <div>
                <label className={lbl}>Category</label>
                <div className="relative">
                  <button type="button" onClick={() => setCatOpen(o => !o)}
                    className={`${inp} flex items-center justify-between text-left`}>
                    <span className={form.category ? 'text-gray-800' : 'text-gray-400'}>
                      {form.category || 'Select category (optional)'}
                    </span>
                    <ChevronDown size={14} className={`shrink-0 text-gray-400 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {catOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => { setCatOpen(false); setCatSearch(''); }} />
                      <div className="absolute z-20 mt-1.5 w-full bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                        <div className="relative p-2 border-b border-gray-100">
                          <Search size={13} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            autoFocus
                            value={catSearch}
                            onChange={e => setCatSearch(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            placeholder="Search category..."
                            className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-[#2ab5ad]/40"
                          />
                        </div>
                        <div className="max-h-52 overflow-y-auto">
                          <button onClick={() => { set('category', ''); setCatOpen(false); setCatSearch(''); }}
                            className="w-full text-left px-3.5 py-2.5 text-sm text-gray-400 hover:bg-gray-50 transition-colors">
                            No category
                          </button>
                          {filteredCategories.map(c => (
                            <button key={c.id} onClick={() => { set('category', c.name); setCatOpen(false); setCatSearch(''); }}
                              className={`w-full text-left px-3.5 py-2.5 text-sm hover:bg-gray-50 transition-colors ${form.category === c.name ? 'text-[#2ab5ad] font-semibold bg-teal-50' : 'text-gray-700'}`}>
                              {c.name}{c.nameEn && <span className="text-xs text-gray-400 ml-1.5">{c.nameEn}</span>}
                            </button>
                          ))}
                          {filteredCategories.length === 0 && (
                            <p className="px-3 py-3 text-xs text-gray-400 text-center">No matching category</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className={lbl}>Excerpt</label>
                <textarea rows={2} className={inp + ' resize-none'} value={form.excerpt}
                  onChange={e => set('excerpt', e.target.value)} placeholder="Short summary shown in listings..." />
              </div>
            </Section>

            <Section title="Cover Image" icon={ImageIcon}>
              <ImageDropzone label="Cover Image (16:9)" value={form.imageUrl} onChange={v => set('imageUrl', v)} aspect="wide" />
            </Section>

            <Section title="Publishing" icon={Rocket}>
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Publish immediately</p>
                  <p className="text-xs text-gray-400 mt-0.5">Off = saved as draft</p>
                </div>
                <Toggle on={form.isPublished} onChange={v => set('isPublished', v)} label="Publish immediately" />
              </div>
            </Section>

            <div className="flex gap-3 pb-2">
              <button onClick={() => router.back()} className={`flex-none ${ghostBtn} px-6! py-3!`}>
                Cancel
              </button>
              <button onClick={goToStep2}
                className={`flex-1 py-3! ${primaryBtn}`}
                style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${DARK} 100%)` }}>
                Next: Write Content <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-5"
          >
            <div className="flex items-center gap-2 px-1">
              <h2 className="text-lg font-bold text-gray-800 truncate">{form.title || 'Untitled article'}</h2>
              {form.category && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-gray-100 text-gray-500 shrink-0">
                  {form.category}
                </span>
              )}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-gray-100 text-gray-500 shrink-0">
                {form.isPublished ? 'Will publish' : 'Draft'}
              </span>
            </div>

            <MarkdownEditor value={form.content} onChange={v => set('content', v)} />

            <div className="flex gap-3 pb-2">
              <button onClick={() => setStep(1)} className={`flex-none ${ghostBtn} px-6! py-3! flex items-center gap-2`}>
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className={`flex-1 py-3! ${primaryBtn}`}
                style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${DARK} 100%)` }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={15} />}
                {loading ? 'Saving...' : (form.isPublished ? 'Publish Blog' : 'Save Draft')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
