export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const calcFinalPrice = (price: number, discount?: number | null): number => {
  if (!discount) return price;
  return price - (price * discount) / 100;
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

export const getOrderStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: 'Menunggu Pembayaran',
    CONFIRMED: 'Dikonfirmasi',
    PROCESSING: 'Diproses',
    SHIPPED: 'Dikirim',
    DELIVERED: 'Diterima',
    CANCELLED: 'Dibatalkan',
  };
  return labels[status] || status;
};

export const getOrderStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getPaymentStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: 'Belum Bayar',
    PAID: 'Lunas',
    FAILED: 'Gagal',
    REFUNDED: 'Dikembalikan',
  };
  return labels[status] || status;
};
