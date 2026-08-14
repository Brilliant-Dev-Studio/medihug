'use client';

import Image from 'next/image';
import { Printer } from 'lucide-react';

const PRIMARY = '#2ab5ad';

export interface InvoiceLine { label: string; qty?: number; amount: number }

export interface InvoiceData {
  invoiceNo: string;
  date: string;
  status: string;
  billTo: { name: string; phone: string };
  providerLabel?: string; // e.g. doctor name for appointments
  paymentMethod: string | null;
  lines: InvoiceLine[];
  total: number;
  refundTotal?: number;
  cancelReason?: string | null;
}

/** Print-friendly invoice/receipt, shared by admin appointment/order invoices and the patient appointment invoice. */
export default function InvoiceView({ data }: { data: InvoiceData }) {
  return (
    <div className="max-w-2xl mx-auto p-4 print:p-0">
      <div className="flex justify-end mb-4 print:hidden">
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: PRIMARY }}>
          <Printer className="w-4 h-4" /> Print / Download PDF
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 print:border-0 print:shadow-none print:p-0">
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Image src="/medihug-logo.png" alt="MediHug" width={40} height={40} className="object-contain" />
            <div>
              <p className="text-lg font-bold text-gray-800">MediHug</p>
              <p className="text-xs text-gray-400">Invoice / Receipt</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-700">#{data.invoiceNo}</p>
            <p className="text-xs text-gray-400">{new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
            <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PRIMARY}14`, color: PRIMARY }}>{data.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-6 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bill To</p>
            <p className="text-sm font-semibold text-gray-700">{data.billTo.name}</p>
            <p className="text-xs text-gray-400">{data.billTo.phone}</p>
          </div>
          {data.providerLabel && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Provider</p>
              <p className="text-sm font-semibold text-gray-700">{data.providerLabel}</p>
            </div>
          )}
        </div>

        <div className="py-6 border-b border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.lines.map((l, i) => (
                <tr key={i}>
                  <td className="py-2 text-gray-600">{l.label}{l.qty ? ` × ${l.qty}` : ''}</td>
                  <td className="py-2 text-right font-semibold text-gray-700">{l.amount.toLocaleString()} MMK</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">Total Paid</p>
            <p className="text-lg font-bold" style={{ color: PRIMARY }}>{data.total.toLocaleString()} MMK</p>
          </div>
          {!!data.refundTotal && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-500">Refunded</p>
              <p className="text-sm font-semibold text-red-500">−{data.refundTotal.toLocaleString()} MMK</p>
            </div>
          )}
          {data.paymentMethod && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">Payment Method</p>
              <p className="text-xs font-semibold text-gray-500 uppercase">{data.paymentMethod}</p>
            </div>
          )}
          {data.cancelReason && (
            <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2 mt-2">Cancelled: {data.cancelReason}</p>
          )}
        </div>
      </div>
    </div>
  );
}
