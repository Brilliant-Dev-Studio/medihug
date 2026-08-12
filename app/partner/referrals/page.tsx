'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { QrCode, Camera, CheckCircle2, XCircle, Loader2, User, Stethoscope, Calendar, RotateCcw } from 'lucide-react';

const Scanner = dynamic(() => import('@yudiel/react-qr-scanner').then(m => m.Scanner), { ssr: false });

const PRIMARY = '#3b5bdb';

interface VerifyResult {
  valid: boolean;
  error?: string;
  alreadyVerified?: boolean;
  patient?: { name: string; phone: string };
  doctor?: { name: string; nameEn: string | null; specialty: string; specialtyEn: string | null };
  reason?: string | null;
  appointmentDate?: string;
  verifiedAt?: string;
}

export default function PartnerReferralsPage() {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  async function verify(code: string) {
    if (!code.trim() || checking) return;
    setChecking(true);
    setScanning(false);
    try {
      const res = await fetch('/api/partner/referrals/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ valid: false, error: 'Network error. Please try again.' });
    } finally {
      setChecking(false);
    }
  }

  function reset() {
    setResult(null);
    setManualCode('');
  }

  return (
    <div className="p-4 lg:p-6 max-w-lg mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold text-gray-800">Verify Referral</h1>
        <p className="text-xs text-gray-400 mt-0.5">Scan or enter a patient&apos;s referral QR code to confirm it&apos;s legit.</p>
      </div>

      {result ? (
        <div className={`rounded-2xl border p-5 flex flex-col gap-4 ${result.valid ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-center gap-2.5">
            {result.valid ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" /> : <XCircle className="w-6 h-6 text-red-500 shrink-0" />}
            <div>
              <p className={`text-sm font-bold ${result.valid ? 'text-emerald-700' : 'text-red-600'}`}>
                {result.valid ? 'Legit referral' : 'Not valid'}
              </p>
              {result.valid && result.alreadyVerified && (
                <p className="text-xs text-emerald-600">Already verified earlier{result.verifiedAt ? ` — ${new Date(result.verifiedAt).toLocaleString()}` : ''}</p>
              )}
              {!result.valid && <p className="text-xs text-red-500">{result.error}</p>}
            </div>
          </div>

          {result.valid && result.patient && (
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
              <div className="flex items-center gap-2.5 px-3.5 py-2.5">
                <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient</p>
                  <p className="text-sm font-semibold text-gray-800">{result.patient.name} · {result.patient.phone}</p>
                </div>
              </div>
              {result.doctor && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5">
                  <Stethoscope className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Referred by</p>
                    <p className="text-sm font-semibold text-gray-800">Dr. {result.doctor.nameEn ?? result.doctor.name} ({result.doctor.specialtyEn ?? result.doctor.specialty})</p>
                  </div>
                </div>
              )}
              {result.appointmentDate && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Appointment</p>
                    <p className="text-sm font-semibold text-gray-800">{new Date(result.appointmentDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {result.reason && (
                <div className="px-3.5 py-2.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reason</p>
                  <p className="text-sm text-gray-700 mt-0.5">{result.reason}</p>
                </div>
              )}
            </div>
          )}

          <button onClick={reset}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: PRIMARY }}>
            <RotateCcw className="w-4 h-4" /> Verify another
          </button>
        </div>
      ) : (
        <>
          {scanning ? (
            <div className="rounded-2xl overflow-hidden border border-gray-100 bg-black relative">
              <Scanner
                onScan={codes => { if (codes[0]?.rawValue) verify(codes[0].rawValue); }}
                onError={() => setScanning(false)}
                formats={['qr_code']}
              />
              <button onClick={() => setScanning(false)}
                className="absolute top-3 right-3 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/90 text-gray-700">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setScanning(true)}
              className="flex flex-col items-center justify-center gap-2 py-10 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors">
              <Camera className="w-8 h-8" />
              <span className="text-sm font-semibold">Tap to scan QR</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">or enter code</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white">
              <QrCode className="w-4 h-4 text-gray-300 shrink-0" />
              <input
                value={manualCode}
                onChange={e => setManualCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && verify(manualCode)}
                placeholder="MHR-XXXXXXXXXX"
                className="flex-1 min-w-0 text-sm font-mono outline-none placeholder:text-gray-300"
              />
            </div>
            <button onClick={() => verify(manualCode)} disabled={checking || !manualCode.trim()}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center gap-1.5"
              style={{ backgroundColor: PRIMARY }}>
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
