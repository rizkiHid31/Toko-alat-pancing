import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import { ApiResponse, Order } from '../types';
import { formatRupiah, formatDate, getOrderStatusLabel, getOrderStatusColor } from '../lib/utils';

export default function OrderSuccessPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => api.get<ApiResponse<Order>>(`/orders/${orderNumber}`).then((r) => r.data),
    enabled: !!orderNumber,
  });

  if (isLoading) {
    return <div className="text-center py-20 text-dark-400">Memuat...</div>;
  }

  const order = data?.data;
  if (!order) return <div className="text-center py-20 text-dark-300">Pesanan tidak ditemukan</div>;

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Pesanan Berhasil!</h1>
          <p className="text-dark-300 mt-2">
            Pesanan Anda dengan nomor <strong className="text-primary-400">#{order.orderNumber}</strong> telah diterima.
          </p>
        </div>

        <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-primary-400" /> Detail Pesanan
            </h3>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getOrderStatusColor(order.status)}`}>
              {getOrderStatusLabel(order.status)}
            </span>
          </div>
          <div className="space-y-2 text-sm text-dark-300 mb-4">
            <div className="flex justify-between">
              <span>Tanggal</span>
              <span className="text-dark-200">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pembayaran</span>
              <span className={order.paymentStatus === 'PAID' ? 'text-green-400 font-medium' : 'text-yellow-400 font-medium'}>
                {order.paymentStatus === 'PAID' ? 'Lunas' : 'Menunggu Pembayaran'}
              </span>
            </div>
          </div>
          <div className="border-t border-dark-700 pt-4 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-dark-300">{item.productName} x{item.quantity}</span>
                <span className="text-dark-200">{formatRupiah(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-dark-700 pt-2 mt-2 space-y-1 text-sm">
              <div className="flex justify-between text-dark-300">
                <span>Ongkos Kirim</span>
                <span className="text-dark-200">{formatRupiah(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-white">
                <span>Total</span>
                <span className="text-primary-400">{formatRupiah(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-dark-900 border border-dark-700 rounded-xl p-5 mb-6 text-sm">
          <p className="font-medium text-white mb-2">Alamat Pengiriman</p>
          <p className="text-dark-300">{order.shippingName} • {order.shippingPhone}</p>
          <p className="text-dark-300">{order.shippingAddress}, {order.shippingCity}, {order.shippingProvince} {order.shippingPostal}</p>
        </div>

        <div className="flex gap-3">
          <Link to={`/track/${order.orderNumber}`} className="flex-1 btn-secondary text-center py-3">
            Lacak Pesanan
          </Link>
          <Link to="/" className="flex-1 btn-primary text-center py-3 flex items-center justify-center gap-2">
            Lanjut Belanja <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
