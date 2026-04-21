import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
import { Order, ApiResponse } from '../types';
import { formatRupiah, formatDate, getOrderStatusLabel, getOrderStatusColor } from '../lib/utils';

export default function AccountPage() {
  const [tab, setTab] = useState<'profile' | 'orders'>('orders');
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: ordersData } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get<ApiResponse<Order[]>>('/orders/my').then((r) => r.data),
    enabled: tab === 'orders',
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const orders = ordersData?.data || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Akun Saya</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside>
          <div className="card p-4">
            <div className="text-center mb-4 pb-4 border-b border-gray-100">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="w-7 h-7 text-primary-700" />
              </div>
              <p className="font-semibold text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => setTab('orders')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${tab === 'orders' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Package className="w-4 h-4" /> Pesanan Saya
              </button>
              <button
                onClick={() => setTab('profile')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${tab === 'profile' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <User className="w-4 h-4" /> Profil
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </nav>
          </div>
        </aside>

        <div className="md:col-span-3">
          {tab === 'orders' && (
            <div>
              <h2 className="font-bold text-gray-900 mb-4">Pesanan Saya</h2>
              {orders.length === 0 ? (
                <div className="card p-12 text-center text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Belum ada pesanan</p>
                  <Link to="/products" className="btn-primary inline-flex mt-4">Mulai Belanja</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <Link
                      key={order.id}
                      to={`/order-success/${order.orderNumber}`}
                      className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">#{order.orderNumber}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)} • {order.items.length} produk</p>
                        <p className="font-bold text-primary-700 mt-1">{formatRupiah(order.total)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getOrderStatusColor(order.status)}`}>
                          {getOrderStatusLabel(order.status)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'profile' && (
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-4">Informasi Profil</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-gray-500">Nama</label>
                  <p className="font-medium text-gray-800">{user?.name}</p>
                </div>
                <div>
                  <label className="text-gray-500">Email</label>
                  <p className="font-medium text-gray-800">{user?.email}</p>
                </div>
                <div>
                  <label className="text-gray-500">Telepon</label>
                  <p className="font-medium text-gray-800">{user?.phone || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
