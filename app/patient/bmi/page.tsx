'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Venus, Mars } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY = '#0d2b6e';

type Category = 'under' | 'normal' | 'over' | 'obese';
type Gender = 'female' | 'male';
type HeightUnit = 'cm' | 'in';
type WeightUnit = 'kg' | 'lb';

function getCategory(bmi: number): Category {
  if (bmi < 18.5) return 'under';
  if (bmi < 25)   return 'normal';
  if (bmi < 30)   return 'over';
  return 'obese';
}

const SEGMENTS: { key: Category; color: string; weight: number }[] = [
  { key: 'under',  color: '#6366f1', weight: 14 },
  { key: 'normal', color: '#14b8a6', weight: 26 },
  { key: 'over',   color: '#f59e0b', weight: 20 },
  { key: 'obese',  color: '#f43f5e', weight: 40 },
];

const CATEGORY_LABEL: Record<Category, { mm: string; en: string }> = {
  under:  { mm: 'အလေးချိန် နည်းသည်',   en: 'Underweight' },
  normal: { mm: 'ပုံမှန်',              en: 'Normal weight' },
  over:   { mm: 'အလေးချိန် ကျော်သည်', en: 'Overweight' },
  obese:  { mm: 'ဝသည်',                en: 'Obese' },
};

const R = 80;
const STROKE = 26;
const CX = 110;
const CY = 110;
const CIRC = 2 * Math.PI * R;
const GAP = 6; // px gap between segments along circumference

export default function BmiPage() {
  const { lang } = useLang();
  const mm = lang === 'mm';

  const [gender, setGender]       = useState<Gender>('female');
  const [age, setAge]             = useState('26');
  const [height, setHeight]       = useState('170');
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm');
  const [weight, setWeight]       = useState('56');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [result, setResult]       = useState<{ bmi: number; hMeters: number } | null>(null);

  const canCalculate = parseFloat(height) > 0 && parseFloat(weight) > 0 && parseFloat(age) > 0;

  const calculate = () => {
    const hRaw = parseFloat(height);
    const wRaw = parseFloat(weight);
    if (!hRaw || !wRaw) return;
    const hMeters = heightUnit === 'cm' ? hRaw / 100 : hRaw * 0.0254;
    const wKg     = weightUnit === 'kg' ? wRaw : wRaw * 0.453592;
    const bmi = Math.round((wKg / (hMeters * hMeters)) * 10) / 10;
    setResult({ bmi, hMeters });
  };

  const category = result ? getCategory(result.bmi) : null;
  const active   = category ? SEGMENTS.find(s => s.key === category)! : null;

  // Build donut arcs
  const segLens = SEGMENTS.map(seg => (seg.weight / 100) * CIRC);
  const cumulatives = segLens.reduce<number[]>((acc, len, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + segLens[i - 1]);
    return acc;
  }, []);
  const arcs = SEGMENTS.map((seg, i) => {
    const segLen  = segLens[i];
    const cumulative = cumulatives[i];
    const dashLen = Math.max(0, segLen - GAP);
    const dashArray = `${dashLen} ${CIRC - dashLen}`;
    const dashOffset = -cumulative;
    const startDeg = -90 + (cumulative / CIRC) * 360;
    const midDeg   = startDeg + ((segLen / CIRC) * 360) / 2;
    return { ...seg, dashArray, dashOffset, midDeg };
  });

  const activeArc = active ? arcs.find(a => a.key === active.key)! : null;
  const labelPoint = activeArc ? {
    x: CX + (R + 22) * Math.cos((activeArc.midDeg * Math.PI) / 180),
    y: CY + (R + 22) * Math.sin((activeArc.midDeg * Math.PI) / 180),
  } : null;
  const linePoint = activeArc ? {
    x: CX + (R + 6) * Math.cos((activeArc.midDeg * Math.PI) / 180),
    y: CY + (R + 6) * Math.sin((activeArc.midDeg * Math.PI) / 180),
  } : null;

  // Extra metrics
  const healthyLowKg  = result ? Math.round(18.5 * result.hMeters * result.hMeters * 10) / 10 : 0;
  const healthyHighKg = result ? Math.round(24.9 * result.hMeters * result.hMeters * 10) / 10 : 0;
  const bmiPrime      = result ? Math.round((result.bmi / 25) * 100) / 100 : 0;
  const ponderal      = result ? Math.round(((weightUnit === 'kg' ? parseFloat(weight) : parseFloat(weight) * 0.453592) / (result.hMeters ** 3)) * 10) / 10 : 0;

  return (
    <div className="min-h-full bg-gray-50 py-6 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <Link href="/patient/dashboard" className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white border border-gray-200">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{mm ? 'ကျန်းမာရေး' : 'Fitness & Health'}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left: form */}
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{mm ? 'BMI ကယ်လကူလေတာ' : 'BMI Calculator'}</h1>
              <p className="text-sm text-gray-400 mt-1.5">
                {mm ? 'အချက်အလက်များဖြည့်ပြီး ရလဒ်ရယူရန် Calculate ကိုနှိပ်ပါ' : 'Enter the values and click the calculate button to get results.'}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{mm ? 'ကျား/မ' : 'Gender'}</label>
              <div className="grid grid-cols-2 gap-2">
                {(['female', 'male'] as Gender[]).map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-colors"
                    style={{
                      borderColor: gender === g ? PRIMARY : '#e5e7eb',
                      backgroundColor: gender === g ? `${PRIMARY}0d` : '#fff',
                      color: gender === g ? PRIMARY : '#6b7280',
                    }}
                  >
                    {g === 'female' ? <Venus className="w-3.5 h-3.5" /> : <Mars className="w-3.5 h-3.5" />}
                    {g === 'female' ? (mm ? 'မ' : 'Female') : (mm ? 'ကျား' : 'Male')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{mm ? 'အသက်' : 'Age'}</label>
              <input
                type="number" inputMode="numeric" value={age} onChange={e => setAge(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d2b6e]/20 focus:border-[#0d2b6e] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{mm ? 'အရပ်' : 'Height'}</label>
              <div className="flex gap-2">
                <input
                  type="number" inputMode="decimal" value={height} onChange={e => setHeight(e.target.value)}
                  className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d2b6e]/20 focus:border-[#0d2b6e] transition-all"
                />
                <select
                  value={heightUnit} onChange={e => setHeightUnit(e.target.value as HeightUnit)}
                  className="shrink-0 w-16 rounded-xl border border-gray-200 bg-gray-50 px-2 text-sm font-semibold text-gray-600 focus:outline-none"
                >
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{mm ? 'ကိုယ်အလေးချိန်' : 'Weight'}</label>
              <div className="flex gap-2">
                <input
                  type="number" inputMode="decimal" value={weight} onChange={e => setWeight(e.target.value)}
                  className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d2b6e]/20 focus:border-[#0d2b6e] transition-all"
                />
                <select
                  value={weightUnit} onChange={e => setWeightUnit(e.target.value as WeightUnit)}
                  className="shrink-0 w-16 rounded-xl border border-gray-200 bg-gray-50 px-2 text-sm font-semibold text-gray-600 focus:outline-none"
                >
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </div>
            </div>

            <button
              onClick={calculate}
              disabled={!canCalculate}
              className="mt-2 w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#f43f5e' }}
            >
              {mm ? 'တွက်ချက်မည်' : 'Calculate'}
            </button>
          </div>

          {/* Right: results */}
          <div className="rounded-2xl bg-gray-50 p-6 flex flex-col">
            <h2 className="text-base font-bold text-gray-900">{mm ? 'သင့်ရလဒ်' : 'Your results'}</h2>

            {!result || !category || !active ? (
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                {mm ? 'ရလဒ်ကြည့်ရန် Calculate ကိုနှိပ်ပါ' : 'Fill the form and calculate to see your results here.'}
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  {category === 'normal'
                    ? (mm ? '၁၈.၅ မှ ၂၄.၉ ကြား BMI သည် ပုံမှန် ကိုယ်အလေးချိန်ဟု သတ်မှတ်ပြီး ကျန်းမာရေးအန္တရာယ် လျော့နည်းစေသည်။' : 'A BMI between 18.5 and 24.9 is considered normal weight, reducing the risk of weight related health issues.')
                    : (mm ? `သင့် BMI သည် ${CATEGORY_LABEL[category].mm} အပိုင်းအခြားတွင် ရှိနေပါသည်။` : `Your BMI falls in the ${CATEGORY_LABEL[category].en.toLowerCase()} range.`)}
                </p>

                <div className="relative mx-auto mt-4" style={{ width: 220, height: 220 }}>
                  <svg viewBox="0 0 220 220" width={220} height={220}>
                    {arcs.map(a => (
                      <circle
                        key={a.key}
                        cx={CX} cy={CY} r={R}
                        fill="none"
                        stroke={a.color}
                        strokeWidth={STROKE}
                        strokeDasharray={a.dashArray}
                        strokeDashoffset={a.dashOffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${CX} ${CY})`}
                        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                      />
                    ))}
                    {linePoint && labelPoint && (
                      <line x1={linePoint.x} y1={linePoint.y} x2={labelPoint.x} y2={labelPoint.y} stroke="#9ca3af" strokeWidth={1} />
                    )}
                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-lg font-bold text-gray-800">BMI= {result.bmi}</p>
                  </div>

                  {labelPoint && (
                    <span
                      className="absolute text-[10px] font-semibold text-gray-500 whitespace-nowrap"
                      style={{
                        left: labelPoint.x, top: labelPoint.y,
                        transform: `translate(${labelPoint.x > CX ? '0%' : '-100%'}, -50%)`,
                      }}
                    >
                      {mm ? CATEGORY_LABEL[category].mm : CATEGORY_LABEL[category].en.toLowerCase()}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-3">
                  {SEGMENTS.map(s => (
                    <span key={s.key} className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      {mm ? CATEGORY_LABEL[s.key].mm : CATEGORY_LABEL[s.key].en.toLowerCase()}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-2 mt-5 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>{mm ? 'ကျန်းမာသော BMI အပိုင်းအခြား' : 'Healthy BMI range'}</span>
                    <span className="font-semibold text-gray-700">18.5 kg/m² – 24.9 kg/m²</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{mm ? 'အရပ်နှင့်ကိုက်ညီသော ကျန်းမာသည့်အလေးချိန်' : 'Healthy weight for the height'}</span>
                    <span className="font-semibold text-gray-700">{healthyLowKg} kg – {healthyHighKg} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>BMI Prime</span>
                    <span className="font-semibold text-gray-700">{bmiPrime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{mm ? 'Ponderal Index' : 'Ponderal index'}</span>
                    <span className="font-semibold text-gray-700">{ponderal} kg/m³</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
