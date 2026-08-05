'use client';

import { use, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import ProgramForm, { type Program } from '../ProgramForm';

export default function EditHealthcareProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/healthcare-programs/${id}`)
      .then(r => r.json())
      .then(d => setProgram(d.program ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-[#2ab5ad]" />
      </div>
    );
  }

  if (!program) {
    return <div className="p-6 text-sm text-gray-500">Program not found.</div>;
  }

  return <ProgramForm editing={program} />;
}
