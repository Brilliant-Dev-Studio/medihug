'use client';

import { use, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import OfferForm, { type Offer } from '../OfferForm';

export default function EditSpecialOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [offer, setOffer]     = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/special-offers/${id}`)
      .then(r => r.json())
      .then(d => setOffer(d.offer ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-[#2ab5ad]" />
      </div>
    );
  }

  if (!offer) {
    return <div className="p-6 text-sm text-gray-500">Offer not found.</div>;
  }

  return <OfferForm editing={offer} />;
}
