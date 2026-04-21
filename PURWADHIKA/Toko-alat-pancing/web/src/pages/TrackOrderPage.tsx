import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import api from '../lib/api';
import { formatDate, getOrderStatusLabel, getOrderStatusColor } from '../lib/utils';

interface TrackData {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  courier?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  shippingName: string;
  shippingCity: string;
  shippingProvince: string;
}

export default function TrackOrderPage() {
  const { orderNumber: paramOrderNumber } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(paramOrderNumber || '');
  const [query, setQuery] = useState(paramOrderNumber || '');

  const { data, isLoading, error } = useQuery({
    queryKey: ['track', query],
    queryFn: () => api.get<{ success: boolean; data: TrackData }>(`/orders/track/${query}`).then((r) => r.data),
    enabled: !!query,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setQuery(input.trim().toUpperCase());
      navigate(`/track/${input.trim().toUpperCase()}`);
    }
  };

  const order = data?.data;

  const steps = [
    { key: 'PENDING', label: 'Pesanan Dibuat', icon: Package },
    { key: 'CONFIRMED', label: 'Dikonfirmasi', icon: CheckCircle },
    { key: 'PROCESSING', label: 'Diproses', icon: Clock },
    { key: 'SHIPPED', label: 'Dikirim', icon: Truck },
    { key: 'DELIVERED', label: 'Diterima', icon: CheckCircle },
  ];

  const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStep = order ? statusOrder.indexOf(order.status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Lacak Pesanan</h1>
      <p className="text-gray-500 text-sm mb-6">Masukkan nomor pesanan Anda untuk melihat status pengiriman</p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Contoh: TP240101-1234"
          className="input-field flex-1 uppercase"
        />
        <button type="submit" className="btn-primary px-5 flex items-center gap-2">
          <Search className="w-4 h-4" /> Lacak
        </button>
      </form>

      {isLoading && <div className="text-center py-10 text-gray-400">Mencari pesanan...</div>}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center text-red-600">
          Pesanan tidak ditemukan. Periksa kembali nomor pesanan Anda.
        </div>
      )}

      {order && (
        <div className="card p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="font-bold text-gray-900 text-lg">#{order.orderNumber}</p>
              <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
              <p className="text-sm text-gray-600 mt-1">{order.shippingName} • {order.shippingCity}, {order.shippingProvince}</p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getOrderStatusColor(order.status)}`}>
              {getOrderStatusLabel(order.status)}
            </span>
          </div>

          {order.status !== 'CANCELLED' && (
            <div className="mb-5">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0">
                  <div
                    className="h-full bg-primary-600 transition-all"
                    style={{ width: `${currentStep > 0 ? (currentStep / (steps.length - 1)) * 100 : 0}%` }}
                  />
                </div>
                {steps.map((step, i) => {
                  const done = i <= currentStep;
                  return (
                    <div key={step.key} className="flex flex-col items-center z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${done ? 'bg-primary-600' : 'bg-gray-200'}`}>
                        <step.icon className={`w-4 h-4 ${done ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <p className={`text-xs mt-1 text-center max-w-[60px] ${done ? 'text-primary-700 font-medium' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {order.trackingNumber && (
            <div className="bg-primary-50 rounded-xl p-4 text-sm">
              <p className="font-medium text-primary-800 mb-1">Info Pengiriman</p>
              <p className="text-primary-700">Kurir: <strong>{order.courier}</strong></p>
              <p className="text-primary-700">No. Resi: <strong>{order.trackingNumber}</strong></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
