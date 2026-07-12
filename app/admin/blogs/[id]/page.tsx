'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Loader2, ChevronDown, FileText, Image as ImageIcon,
  Rocket, Search, Info, Trash2, ExternalLink, Save,
} from 'lucide-react';
import ImageDropzone from '@/components/admin/ImageDropzone';
import MarkdownEditor from '@/components/admin/MarkdownEditor';

const PRIMARY = '#2ab5ad';
const DARK    = '#1a9990';

interface BlogCategory { id: string; name: string; nameEn: string | null; }
interface Blog {
  id: string; title: string; titleEn: string | null; slug: string;
  content: string; excerpt: string | null; imageUrl: string | null;
  category: string | null; isPublished: boolean; publishedAt: string | null; createdAt: string;
}

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

function DeleteModal({ title, onClose, onConfirm, deleting }: { title: string; onClose: () => void; onConfirm: () => void; deleting: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-80 shadow-2xl">
        <h3 className="font-bold text-gray-800 mb-2">Delete blog?</h3>
        <p className="text-sm text-gray-500 mb-5">
          <span className="font-medium text-gray-700">{title}</span> will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-2">
            {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const primaryBtn = 'px-5 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 shadow-[0_4px_14px_-4px_rgba(42,181,173,0.5)] hover:shadow-[0_6px_18px_-4px_rgba(42,181,173,0.6)] hover:-translate-y-px active:translate-y-0 transition-all';
const ghostBtn   = 'px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors';

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [blog, setBlog]       = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [deleting, setDeleting]         = useState(false);
  const [deleteOpen, setDeleteOpen]     = useState(false);

  const [form, setForm] = useState({
    title: '', titleEn: '', content: '', excerpt: '',
    imageUrl: '', category: '', isPublished: false,
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/blogs/${id}`).then(r => r.json()),
      fetch('/api/admin/blog-categories').then(r => r.json()),
    ]).then(([bd, cd]) => {
      const b: Blog = bd.blog;
      setBlog(b);
      setCategories(cd.categories ?? []);
      if (b) {
        setForm({
          title: b.title, titleEn: b.titleEn ?? '', content: b.content, excerpt: b.excerpt ?? '',
          imageUrl: b.imageUrl ?? '', category: b.category ?? '', isPublished: b.isPublished,
        });
      }
      setLoading(false);
    });
  }, [id]);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim())   { setError('Title is required.');   return; }
    if (!form.content.trim()) { setError('Content is required.'); return; }
    setError(''); setSaving(true);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
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
      const d = await res.json();
      setBlog(d.blog);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
    router.push('/admin/blogs');
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(catSearch.toLowerCase()) ||
    (c.nameEn ?? '').toLowerCase().includes(catSearch.toLowerCase()));

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 size={28} className="animate-spin text-[#2ab5ad]" />
    </div>
  );
  if (!blog) return (
    <div className="flex items-center justify-center h-[60vh] text-gray-400">Blog မတွေ့ပါ</div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => router.push('/admin/blogs')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 shrink-0 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-800 truncate">{blog.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                style={form.isPublished ? { backgroundColor: '#d1fae5', color: '#059669' } : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}>
                {form.isPublished ? 'Published' : 'Draft'}
              </span>
              <span className="text-[10px] text-gray-300 font-mono">/{blog.slug}</span>
              {blog.isPublished && (
                <Link href={`/blog/${blog.slug}`} target="_blank"
                  className="text-[10px] font-semibold flex items-center gap-1 text-gray-400 hover:text-[#2ab5ad] transition-colors">
                  View live <ExternalLink size={10} />
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <button onClick={() => setDeleteOpen(true)}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors">
            <Trash2 size={16} />
          </button>
          <button onClick={handleSave} disabled={saving} className={primaryBtn} style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${DARK} 100%)` }}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <Info size={14} className="shrink-0" /> {error}
        </div>
      )}

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
            <p className="text-sm font-semibold text-gray-700">Published</p>
            <p className="text-xs text-gray-400 mt-0.5">Off = saved as draft</p>
          </div>
          <Toggle on={form.isPublished} onChange={v => set('isPublished', v)} label="Published" />
        </div>
      </Section>

      <div>
        <p className={lbl + ' px-1'}>Content</p>
        <MarkdownEditor value={form.content} onChange={v => set('content', v)} />
      </div>

      <div className="flex gap-3 pb-2">
        <button onClick={() => router.push('/admin/blogs')} className={`flex-none ${ghostBtn} px-6! py-3!`}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className={`flex-1 py-3! ${primaryBtn}`} style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${DARK} 100%)` }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {deleteOpen && (
        <DeleteModal
          title={blog.title}
          deleting={deleting}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
