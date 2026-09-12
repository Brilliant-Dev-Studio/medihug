'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Phone, MapPin, User, Loader2, HeartHandshake, MessageCircle } from 'lucide-react';
import { useLang } from '@/app/lib/LanguageContext';

const PRIMARY = '#0d2b6e';

interface CommunityPartner {
  id: string;
  name: string; nameEn: string | null;
  descriptionMm: string | null; descriptionEn: string | null;
  contactPerson: string | null;
  phone: string | null; viber: string | null;
  location: string | null;
  address: string | null; addressEn: string | null;
  imageUrl: string | null;
}

export default function CommunityPartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [partner, setPartner] = useState<CommunityPartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/community-partners/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setPartner(d.partner); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
      </div>
    );
  }

  if (notFound || !partner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-6">
        <HeartHandshake className="w-12 h-12 text-gray-200" />
        <p className="text-gray-400">{mm ? 'ရှာမတွေ့ပါ' : 'Not found'}</p>
        <Link href="/" className="text-sm font-semibold" style={{ color: PRIMARY }}>
          ← {mm ? 'ပင်မစာမျက်နှာသို့' : 'Back to home'}
        </Link>
      </div>
    );
  }

  const name = mm ? partner.name : (partner.nameEn ?? partner.name);
  const description = mm ? partner.descriptionMm : (partner.descriptionEn ?? partner.descriptionMm);
  const address = mm ? (partner.address ?? partner.addressEn) : (partner.addressEn ?? partner.address);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" /> {mm ? 'ပင်မစာမျက်နှာသို့' : 'Back to home'}
        </Link>

        {/* header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100">
            {partner.imageUrl ? (
              <Image src={partner.imageUrl} alt={name} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain p-8" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, #1a3a8f 100%)` }}>
                <HeartHandshake className="w-16 h-16 text-white/40" strokeWidth={1.2} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {mm ? 'အစိုးရဆေးရုံ၊ လူမှုကူညီရေးအသင်း' : 'Government Hospital / Charity Association'}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{name}</h1>

            {partner.location && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="w-4 h-4 shrink-0" /> {partner.location}
              </div>
            )}

            <div className="flex flex-col gap-0 rounded-2xl border border-gray-100 overflow-hidden">
              {partner.contactPerson && (
                <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}15` }}>
                    <User className="w-4 h-4" style={{ color: PRIMARY }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium">{mm ? 'ဆက်သွယ်ရမည့်သူ' : 'Contact Person'}</p>
                    <p className="text-sm font-semibold text-gray-700 truncate">{partner.contactPerson}</p>
                  </div>
                </div>
              )}
              {partner.phone && (
                <a href={`tel:${partner.phone}`} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}15` }}>
                    <Phone className="w-4 h-4" style={{ color: PRIMARY }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium">{mm ? 'ဖုန်းနံပါတ်' : 'Phone'}</p>
                    <p className="text-sm font-bold truncate" style={{ color: PRIMARY }}>{partner.phone}</p>
                  </div>
                </a>
              )}
              {partner.viber && (
                <a href={`viber://chat?number=${encodeURIComponent(partner.viber)}`} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}15` }}>
                    <MessageCircle className="w-4 h-4" style={{ color: PRIMARY }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium">Viber</p>
                    <p className="text-sm font-bold truncate" style={{ color: PRIMARY }}>{partner.viber}</p>
                  </div>
                </a>
              )}
              {address && (
                <div className="flex items-center gap-3 px-4 py-3 bg-white">
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium">{mm ? 'လိပ်စာ' : 'Address'}</p>
                    <p className="text-sm font-semibold text-gray-700">{address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* description */}
        {description && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 max-w-3xl">
            <p className="text-sm font-bold text-gray-800 mb-3">{mm ? 'အကြောင်းအရာ' : 'About'}</p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
