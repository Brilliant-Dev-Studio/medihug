'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Check, X, Loader2, Receipt, Trash2, Tag } from 'lucide-react';

const PRIMARY = '#2ab5ad';
const inp = 'flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

interface Category { id: string; name: string; type: 'FIXED' | 'VARIABLE' | 'ONE_TIME' }
interface Expense {
  id: string; categoryId: string; amount: number; description: string | null;
  date: string; createdBy: string | null; category: Category;
}

const TYPE_LABEL: Record<Category['type'], string> = { FIXED: 'Fixed', VARIABLE: 'Variable', ONE_TIME: 'One-time' };

export default function ExpensesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('');

  const [creating, setCreating] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<Category['type']>('VARIABLE');
  const [addingCat, setAddingCat] = useState(false);

  const load = useCallback(async (catFilter?: string) => {
    setLoading(true);
    const qs = catFilter ? `?categoryId=${catFilter}` : '';
    const [catRes, expRes] = await Promise.all([
      fetch('/api/admin/finance/expense-categories'),
      fetch(`/api/admin/finance/expenses${qs}`),
    ]);
    const catData = await catRes.json();
    const expData = await expRes.json();
    setCategories(catData.categories ?? []);
    setExpenses(expData.expenses ?? []);
    if (!categoryId && catData.categories?.length) setCategoryId(catData.categories[0].id);
    setLoading(false);
  }, [categoryId]);

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    const amt = Number(amount);
    if (!categoryId || Number.isNaN(amt) || amt <= 0) { setError('Category and a positive amount are required.'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/admin/finance/expenses', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, amount: amt, description: description || null, date }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? 'Server error'); return; }
    setCreating(false); setAmount(''); setDescription(''); load(filterCategory || undefined);
  };

  const handleDelete = async (e: Expense) => {
    setBusyId(e.id);
    await fetch(`/api/admin/finance/expenses/${e.id}`, { method: 'DELETE' });
    setBusyId(null); load(filterCategory || undefined);
  };

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    await fetch('/api/admin/finance/expense-categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCatName.trim(), type: newCatType }),
    });
    setNewCatName(''); setAddingCat(false); load(filterCategory || undefined);
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Expenses</h1>
          <p className="text-sm text-gray-400 mt-0.5">Operating cost tracking, feeds the P&amp;L net-profit calculation.</p>
        </div>
        {!creating && (
          <button onClick={() => { setCreating(true); setError(''); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: PRIMARY }}>
            <Plus className="w-4 h-4" /> New Expense
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-800 flex items-center gap-2"><Tag className="w-4 h-4 text-gray-400" /> Categories</p>
          {!addingCat && (
            <button onClick={() => setAddingCat(true)} className="text-xs font-semibold" style={{ color: PRIMARY }}>+ Add category</button>
          )}
        </div>
        {addingCat && (
          <div className="flex gap-2">
            <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Category name" className={inp} />
            <select value={newCatType} onChange={e => setNewCatType(e.target.value as Category['type'])} className={inp}>
              <option value="FIXED">Fixed</option>
              <option value="VARIABLE">Variable</option>
              <option value="ONE_TIME">One-time</option>
            </select>
            <button onClick={addCategory} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: PRIMARY }}>
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setAddingCat(false)} className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400"><X className="w-4 h-4" /></button>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => { setFilterCategory(''); load(); }}
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${!filterCategory ? 'text-white' : 'text-gray-500 bg-gray-50'}`}
            style={filterCategory ? {} : { backgroundColor: PRIMARY }}>All</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => { setFilterCategory(c.id); load(c.id); }}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${filterCategory === c.id ? 'text-white' : 'text-gray-500 bg-gray-50'}`}
              style={filterCategory === c.id ? { backgroundColor: PRIMARY } : {}}>
              {c.name} <span className="opacity-60">· {TYPE_LABEL[c.type]}</span>
            </button>
          ))}
        </div>
      </div>

      {creating && (
        <div className="bg-white rounded-2xl border-2 p-4 flex flex-col gap-3" style={{ borderColor: PRIMARY }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>New Expense</p>
          <div className="flex gap-2">
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inp}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="number" min={0} value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (MMK)" className={inp} />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inp} />
          </div>
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" className={inp} />
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={saving}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center gap-1.5" style={{ backgroundColor: PRIMARY }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
            </button>
            <button onClick={() => setCreating(false)} className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50">
              <X className="w-4 h-4" />
            </button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">By</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <Receipt className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No expenses recorded.</p>
                </td></tr>
              ) : expenses.map(e => (
                <tr key={e.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(e.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-700">{e.category.name}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{e.description ?? '—'}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">{e.createdBy ?? '—'}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-700 text-right">{e.amount.toLocaleString()} MMK</td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => handleDelete(e)} disabled={busyId === e.id}
                      className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 disabled:opacity-30">
                      {busyId === e.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {expenses.length > 0 && (
              <tfoot>
                <tr className="border-t border-gray-100 bg-gray-50/60">
                  <td colSpan={4} className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Total</td>
                  <td className="px-5 py-3 text-sm font-bold text-gray-800 text-right">{total.toLocaleString()} MMK</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
