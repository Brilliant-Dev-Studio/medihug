'use client';

import Image from 'next/image';
import { Printer } from 'lucide-react';

const PRIMARY = '#2ab5ad';

export interface ReceiptLine { label: string; qty: number; unit: string; price: number; total: number; discountLabel?: string; }

export interface OrderReceiptData {
  saleNo: string;
  date: string;
  status: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: string | null;
  lines: ReceiptLine[];
  pointsDiscountAmount: number;
  voucherCode: string | null;
  voucherDiscountAmount: number;
  grossTotal: number;
  grandTotal: number;
  refundTotal?: number;
  cancelReason?: string | null;
}

/** Thermal-receipt-styled printable invoice for Product orders — narrow paper-strip layout
 * matching the physical POS receipt format requested, distinct from the generic card-style
 * InvoiceView used for appointment invoices. */
export default function OrderReceiptView({ data }: { data: OrderReceiptData }) {
  return (
    <div className="max-w-sm mx-auto p-4 print:p-0">
      <div className="flex justify-end mb-4 print:hidden">
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: PRIMARY }}>
          <Printer className="w-4 h-4" /> Print / Download PDF
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 print:border-0 print:shadow-none print:p-0 print:rounded-none text-[13px] leading-snug text-gray-800 font-mono">

        <p className="text-center text-[11px] text-gray-500 leading-snug">
          Products sold are not refundable, exchangeable, or returnable.
        </p>

        <div className="flex flex-col items-center gap-1 mt-3 pb-3 border-b border-dashed border-gray-300">
          <Image src="/medihug-logo.png" alt="MediHug" width={40} height={40} className="object-contain" />
          <p className="font-bold text-sm">MediHug</p>
          <p className="text-[11px] text-gray-500 text-center">23 Kyaik Latt Street, Sanchaung, Yangon</p>
          <p className="text-[11px] text-gray-500">09 784 101005</p>
        </div>

        <div className="flex justify-between gap-3 py-3 border-b border-dashed border-gray-300">
          <div className="flex flex-col gap-0.5">
            <p>Date: {new Date(data.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} {new Date(data.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            <p>Sale No/Ref: {data.saleNo}</p>
            {data.paymentMethod && <p className="uppercase">Payment: {data.paymentMethod}</p>}
          </div>
          <div className="flex flex-col gap-0.5 text-right">
            <p>Customer: {data.customerName}</p>
            <p>Phone: {data.customerPhone}</p>
          </div>
        </div>

        <div className="py-3 border-b border-dashed border-gray-300">
          <div className="flex text-[11px] font-bold text-gray-500 pb-1.5">
            <span className="flex-1">Description</span>
            <span className="w-14 text-right">Qty</span>
            <span className="w-16 text-right">Price</span>
            <span className="w-20 text-right">Total</span>
          </div>
          <div className="flex flex-col gap-2">
            {data.lines.map((l, i) => (
              <div key={i} className="flex">
                <div className="flex-1">
                  <p>{l.label}</p>
                  {l.discountLabel && <p className="text-[10px] text-gray-400">{l.discountLabel}</p>}
                </div>
                <span className="w-14 text-right shrink-0">{l.qty} ({l.unit})</span>
                <span className="w-16 text-right shrink-0">{l.price.toLocaleString()}</span>
                <span className="w-20 text-right shrink-0">{l.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="py-3 flex flex-col gap-1">
          <div className="flex justify-between">
            <span>Total</span>
            <span>{data.grossTotal.toLocaleString()}</span>
          </div>
          {data.pointsDiscountAmount > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Points Discount</span>
              <span>−{data.pointsDiscountAmount.toLocaleString()}</span>
            </div>
          )}
          {data.voucherDiscountAmount > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Voucher {data.voucherCode ? `(${data.voucherCode})` : ''}</span>
              <span>−{data.voucherDiscountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm pt-1 border-t border-dashed border-gray-300 mt-1">
            <span>Grand Total</span>
            <span>{data.grandTotal.toLocaleString()}</span>
          </div>
          {!!data.refundTotal && (
            <div className="flex justify-between text-red-500">
              <span>Refunded</span>
              <span>−{data.refundTotal.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-dashed border-gray-300 flex flex-col gap-0.5">
          <div className="flex justify-between">
            <span>Paid by</span>
            <span className="uppercase">{data.paymentMethod ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount</span>
            <span>{data.grandTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Change</span>
            <span>0</span>
          </div>
        </div>

        {data.cancelReason && (
          <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2 mt-3">Cancelled: {data.cancelReason}</p>
        )}

        <p className="text-center text-[11px] text-gray-400 mt-4 pt-3 border-t border-dashed border-gray-300">
          Thank you for choosing MediHug
        </p>
      </div>
    </div>
  );
}
