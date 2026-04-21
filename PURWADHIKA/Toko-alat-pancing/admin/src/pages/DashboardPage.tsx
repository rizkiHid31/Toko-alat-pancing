import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Package, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import Header from '../components/layout/Header';
import { formatRupiah, formatDate, getOrderStatusLabel, getOrderStatusColor } from '../lib/utils';

interface DashboardData {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  recentOrders: {
    id: string; orderNumber: string; shippingName: string;
    status: string; paymentStatus: string; total: number; createdAt: string;
  }[];
}

export default function DashboardPage() {
  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<{ success: boolean; data: DashboardData }>('/admin/dashboard').then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const stats = [
    { label: 'Total Pesanan', value: data?.totalOrders || 0, icon: ShoppingBag, color: 'bg-blue-50 text-blue-700', format: 'number' },
    { label: 'Pesanan Pending', value: data?.pendingOrders || 0, icon: Clock, color: 'bg-yellow-50 text-yellow-700', format: 'number' },
    { label: 'Total Pendapatan', value: data?.totalRevenue || 0, icon: TrendingUp, color: 'bg-green-50 text-green-700', format: 'currency' },
    { label: 'Pendapatan Bulan Ini', value: data?.monthRevenue || 0, icon: TrendingUp, color: 'bg-primary-50 text-primary-700', format: 'currency' },
    { label: 'Total Produk', value: data?.totalProducts || 0, icon: Package, color: 'bg-purple-50 text-purple-700', format: 'number' },
    { label: 'Stok Hampir Habis', value: data?.lowStockProducts || 0, icon: AlertTriangle, color: 'bg-red-50 text-red-700', format: 'number' },
  ];

  return (
    <div>
      <Header title="Dashboard" subtitle="Selamat datang di admin panel Toko Pancing" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-medium">{s.label}</span>
              <div className={`p-2 rounded-lg ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {s.format === 'currency' ? formatRupiah(s.value) : s.value.toLocaleString('id-ID')}
            </p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Pesanan Terbaru</h3>
          <Link to="/orders" className="text-sm text-primary-700 hover:underline">Lihat Semua</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['No. Pesanan', 'Pelanggan', 'Total', 'Status', 'Pembayaran', 'Tanggal'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data?.recentOrders || []).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/orders/${order.id}`} className="font-medium text-primary-700 hover:underline">
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{order.shippingName}</td>
                  <td className="px-4 py-3 font-medium">{formatRupiah(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.paymentStatus === 'PAID' ? 'Lunas' : 'Belum'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
              {(!data?.recentOrders || data.recentOrders.length === 0) && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada pesanan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
