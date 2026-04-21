import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Truck, CheckCircle, XCircle } from 'lucide-react';
import api from '../lib/axios';
import Header from '../components/layout/Header';
import { Order, ApiResponse } from '../types';
import { formatRupiah, formatDate, getOrderStatusLabel, getOrderStatusColor } from '../lib/utils';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCostInput, setShippingCostInput] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => api.get<ApiResponse<Order>>(`/admin/orders/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-order', id] });

  const statusMutation = useMutation({
    mutationFn: (status: string) => api.put(`/admin/orders/${id}/status`, { status }),
    onSuccess: () => { invalidate(); toast.success('Status diperbarui'); },
    onError: () => toast.error('Gagal memperbarui status'),
  });

  const shippingMutation = useMutation({
    mutationFn: () =>
      api.put(`/admin/orders/${id}/shipping`, {
        courier,
        trackingNumber,
        ...(shippingCostInput ? { shippingCost: Number(shippingCostInput) } : {}),
      }),
    onSuccess: () => {
      invalidate();
      toast.success('Info pengiriman disimpan, email dikirim ke pelanggan');
      setCourier(''); setTrackingNumber(''); setShippingCostInput('');
    },
    onError: () => toast.error('Gagal menyimpan info pengiriman'),
  });

  const paymentMutation = useMutation({
    mutationFn: () => api.put(`/admin/orders/${id}/confirm-payment`),
    onSuccess: () => { invalidate(); toast.success('Pembayaran dikonfirmasi'); },
  });

  if (isLoading) return <div className="text-center py-20 text-gray-400">Memuat...</div>;

  const order = data?.data;
  if (!order) return <div className="text-center py-20 text-gray-400">Pesanan tidak ditemukan</div>;

  const STATUS_ACTIONS = [
    { value: 'CONFIRMED', label: 'Konfirmasi Pesanan', show: order.status === 'PENDING' },
    { value: 'PROCESSING', label: 'Tandai Diproses', show: order.status === 'CONFIRMED' },
    { value: 'DELIVERED', label: 'Tandai Diterima', show: order.status === 'SHIPPED' },
    { value: 'CANCELLED', label: 'Batalkan Pesanan', show: ['PENDING', 'CONFIRMED'].includes(order.status), danger: true },
  ];

  return (
    <div>
      <Header
        title={`Pesanan #${order.orderNumber}`}
        subtitle={formatDate(order.createdAt)}
        actions={
          <button onClick={() => navigate('/orders')} className="btn-secondary flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 font-semibold text-gray-800 text-sm">Item Pesanan</div>
            <div className="divide-y divide-gray-50">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {item.product?.images?.[0] && <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-500">{formatRupiah(item.price)} × {item.quantity}</p>
                  </div>
                  <p className="font-bold text-gray-900">{formatRupiah(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatRupiah(order.subtotal)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Ongkos Kirim</span><span>{formatRupiah(order.shippingCost)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total</span><span className="text-primary-700">{formatRupiah(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Alamat Pengiriman</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-800">{order.shippingName} · {order.shippingPhone}</p>
              <p>{order.shippingAddress}</p>
              <p>{order.shippingCity}, {order.shippingProvince} {order.shippingPostal}</p>
              {order.notes && <p className="mt-2 text-gray-500 italic">Catatan: {order.notes}</p>}
            </div>
            {order.trackingNumber && (
              <div className="mt-3 bg-primary-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-primary-800">Info Pengiriman</p>
                <p className="text-primary-700">Kurir: <strong>{order.courier}</strong> · Resi: <strong>{order.trackingNumber}</strong></p>
              </div>
            )}
          </div>

          {/* Update Shipping */}
          {['CONFIRMED', 'PROCESSING'].includes(order.status) && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-primary-600" /> Input Data Pengiriman
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Kurir *</label>
                  <input value={courier} onChange={(e) => setCourier(e.target.value)} className="input-field" placeholder="JNE / J&T / SiCepat" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">No. Resi *</label>
                  <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="input-field" placeholder="Nomor resi" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Update Ongkir (Rp)</label>
                  <input type="number" value={shippingCostInput} onChange={(e) => setShippingCostInput(e.target.value)} className="input-field" placeholder="Kosongkan jika sama" />
                </div>
              </div>
              <button
                onClick={() => shippingMutation.mutate()}
                disabled={!courier || !trackingNumber || shippingMutation.isPending}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                {shippingMutation.isPending ? 'Menyimpan...' : 'Simpan & Kirim Email'}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Status */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Status Pesanan</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getOrderStatusColor(order.status)}`}>
                  {getOrderStatusLabel(order.status)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pembayaran</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {order.paymentStatus === 'PAID' ? 'Lunas' : 'Belum Bayar'}
                </span>
              </div>
              {order.paymentMethod && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Metode</span>
                  <span className="text-gray-700">{order.paymentMethod}</span>
                </div>
              )}
              {order.paidAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Dibayar</span>
                  <span className="text-gray-700">{formatDate(order.paidAt)}</span>
                </div>
              )}
            </div>

            {order.paymentStatus === 'PENDING' && (
              <button
                onClick={() => paymentMutation.mutate()}
                disabled={paymentMutation.isPending}
                className="btn-primary w-full text-sm flex items-center justify-center gap-2 mb-2"
              >
                <CheckCircle className="w-4 h-4" />
                Konfirmasi Pembayaran
              </button>
            )}

            <div className="space-y-2">
              {STATUS_ACTIONS.filter((a) => a.show).map((action) => (
                <button
                  key={action.value}
                  onClick={() => statusMutation.mutate(action.value)}
                  disabled={statusMutation.isPending}
                  className={`w-full text-sm flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${
                    action.danger
                      ? 'border border-red-200 text-red-600 hover:bg-red-50'
                      : 'border border-primary-200 text-primary-700 hover:bg-primary-50'
                  }`}
                >
                  {action.danger ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Info Pelanggan</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-800">{order.user?.name || order.guestName || 'Guest'}</p>
              <p>{order.user?.email || order.guestEmail || '-'}</p>
              <p>{order.guestPhone || '-'}</p>
              {!order.userId && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Guest</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
