'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronLeft, Loader2, Stethoscope, HeartPulse, ShoppingCart } from 'lucide-react';
import { useLang } from '../../../lib/LanguageContext';

const PRIMARY = '#0d2b6e';

interface Program {
  id: string; imageUrl: string; titleMm: string; titleEn: string | null;
  descMm: string | null; descEn: string | null; price: number;
  doctors: { id: string; name: string; nameEn: string | null; specialty: string; specialtyEn: string | null; imageUrl: string | null }[];
}

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { lang } = useLang();
  const mm = lang === 'mm';
  const router = useRouter();

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/healthcare-programs/${id}`)
      .then(r => r.json())
      .then(d => setProgram(d.program ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  function handleBuyNow() {
    let isAuthed = false;
    try { isAuthed = !!JSON.parse(localStorage.getItem('medihug_patient') ?? 'null')?.phone; } catch {}
    router.push(isAuthed ? `/patient/programs/${id}` : '/signin');
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div>;
  }

  if (!program) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
        <HeartPulse className="w-10 h-10 text-gray-200" />
        <p className="text-sm text-gray-500">{mm ? 'အစီအစဉ် ရှာမတွေ့ပါ' : 'Program not found'}</p>
        <Link href="/" className="text-sm font-semibold" style={{ color: PRIMARY }}>{mm ? 'ပင်မစာမျက်နှာသို့' : 'Back to home'}</Link>
      </div>
    );
  }

  const title = mm ? program.titleMm : (program.titleEn ?? program.titleMm);
  const desc  = mm ? (program.descMm ?? program.descEn) : (program.descEn ?? program.descMm);

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Banner */}
      <div className="w-full pt-20 relative overflow-hidden" style={{ backgroundColor: PRIMARY }}>
        <div className="absolute inset-0 opacity-25">
          <Image src={program.imageUrl} alt={title} fill className="object-cover" />
        </div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${PRIMARY}cc 0%, ${PRIMARY}f2 100%)` }} />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-14">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/70 text-sm mb-6 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" /> {mm ? 'ပင်မစာမျက်နှာသို့' : 'Back to home'}
          </Link>
          <p className="text-white/50 text-xs uppercase tracking-widest mb-3">{mm ? 'ကျန်းမာရေး အစီအစဉ်' : 'Healthcare Program'}</p>
          <h1 className="text-3xl sm:text-5xl font-bold text-white">{title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            {program.price > 0 && (
              <p className="text-white/80 text-lg font-semibold">{program.price.toLocaleString()} MMK</p>
            )}
            <button
              onClick={handleBuyNow}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-transform hover:scale-105"
              style={{ backgroundColor: '#fff', color: PRIMARY }}
            >
              <ShoppingCart className="w-4 h-4" />
              {mm ? 'ဝယ်ယူရန်' : 'Buy Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="relative w-full h-56 sm:h-80 rounded-2xl overflow-hidden mb-8">
          <Image src={program.imageUrl} alt={title} fill className="object-cover" />
        </div>

        {desc && (
          <div className="prose prose-sm sm:prose max-w-none wrap-break-word prose-headings:font-bold prose-a:wrap-break-word mb-10" style={{ color: '#4b5563', overflowWrap: 'anywhere' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{desc}</ReactMarkdown>
          </div>
        )}

        {program.doctors.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              {mm ? 'ပါဝင်ဆောင်ရွက်မည့် ဆရာဝန်များ' : 'Doctors on this program'}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {program.doctors.map(d => (
                <div key={d.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50">
                  <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-white flex items-center justify-center">
                    {d.imageUrl ? (
                      <Image src={d.imageUrl} alt={d.name} width={44} height={44} className="object-cover w-full h-full" />
                    ) : (
                      <Stethoscope className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{mm ? d.name : (d.nameEn ?? d.name)}</p>
                    <p className="text-xs text-gray-500 truncate">{mm ? d.specialty : (d.specialtyEn ?? d.specialty)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
