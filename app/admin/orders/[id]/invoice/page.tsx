'use client';

import { use, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import OrderReceiptView, { type OrderReceiptData } from '@/components/OrderReceiptView';

interface OrderItem {
  quantity: number; price: number;
  product: { name: string; nameEn: string | null };
}
interface Order {
  id: string; status: string; totalAmount: number; paymentMethod: string | null;
  pointsDiscountAmount: number; voucherCode: string | null; voucherDiscountAmount: number;
  cancelReason: string | null; createdAt: string;
  user: { name: string; phone: string };
  items: OrderItem[];
}

export default function AdminOrderInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<OrderReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/orders/${id}`).then(r => r.json()),
      fetch(`/api/admin/refunds?orderId=${id}`).then(r => r.json()),
    ]).then(([orderData, refundData]) => {
      const order: Order | null = orderData.order ?? null;
      if (!order) { setLoading(false); return; }
      const refundTotal = (refundData.refunds ?? []).reduce((s: number, r: { amount: number }) => s + r.amount, 0);
      const grossTotal = order.totalAmount + order.pointsDiscountAmount + order.voucherDiscountAmount;
      setData({
        saleNo: order.id.slice(-8).toUpperCase(),
        date: order.createdAt,
        status: order.status,
        customerName: order.user.name,
        customerPhone: order.user.phone,
        paymentMethod: order.paymentMethod,
        lines: order.items.map(i => ({
          label: i.product.nameEn ?? i.product.name,
          qty: i.quantity, unit: 'PCS',
          price: i.price, total: i.price * i.quantity,
        })),
        pointsDiscountAmount: order.pointsDiscountAmount,
        voucherCode: order.voucherCode,
        voucherDiscountAmount: order.voucherDiscountAmount,
        grossTotal,
        grandTotal: order.totalAmount,
        refundTotal,
        cancelReason: order.cancelReason,
      });
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>;
  if (!data) return <div className="p-6 text-sm text-gray-500">Order not found.</div>;

  return <OrderReceiptView data={data} />;
}
