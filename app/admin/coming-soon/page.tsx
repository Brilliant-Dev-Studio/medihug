'use client';

import { Construction } from 'lucide-react';

export default function AdminComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6 bg-white rounded-2xl border border-gray-200">
      <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
        <Construction className="w-6 h-6 text-teal-500" />
      </div>
      <p className="text-sm font-bold text-gray-800">Coming Soon</p>
      <p className="text-xs text-gray-400 mt-1 max-w-xs">This section is not built yet. Check back later.</p>
    </div>
  );
}
