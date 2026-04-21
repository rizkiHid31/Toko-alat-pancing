export const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

export const getOrderStatusLabel = (s: string) =>
  ({ PENDING: 'Pending', CONFIRMED: 'Dikonfirmasi', PROCESSING: 'Diproses', SHIPPED: 'Dikirim', DELIVERED: 'Diterima', CANCELLED: 'Dibatalkan' }[s] || s);

export const getOrderStatusColor = (s: string) =>
  ({ PENDING: 'bg-yellow-100 text-yellow-800', CONFIRMED: 'bg-blue-100 text-blue-800', PROCESSING: 'bg-purple-100 text-purple-800', SHIPPED: 'bg-indigo-100 text-indigo-800', DELIVERED: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800' }[s] || 'bg-gray-100 text-gray-800');
