import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, CreditCard, ChevronRight } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { formatRupiah, calcFinalPrice } from '../lib/utils';
import api from '../lib/api';
import toast from 'react-hot-toast';

const checkoutSchema = z.object({
  shippingName: z.string().min(2, 'Nama minimal 2 karakter'),
  shippingPhone: z.string().min(8, 'Nomor telepon tidak valid'),
  shippingAddress: z.string().min(5, 'Alamat terlalu pendek'),
  shippingCity: z.string().min(2, 'Kota diperlukan'),
  shippingProvince: z.string().min(2, 'Provinsi diperlukan'),
  shippingPostal: z.string().length(5, 'Kode pos harus 5 digit'),
  shippingCost: z.coerce.number().min(0),
  notes: z.string().optional(),
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional().or(z.literal('')),
  guestPhone: z.string().optional(),
  courier: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

declare global {
  interface Window {
    snap: { pay: (token: string, options: Record<string, unknown>) => void };
  }
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingName: user?.name || '',
      shippingPhone: user?.phone || '',
      shippingCost: 0,
      guestName: '',
      guestEmail: '',
    },
  });

  const shippingCost = watch('shippingCost') || 0;
  const subtotal = totalPrice();
  const total = subtotal + Number(shippingCost);

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-dark-300 mb-4">Keranjang kosong</p>
        <Link to="/products" className="btn-primary">Belanja Dulu</Link>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    try {
      const orderPayload = {
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        ...data,
        shippingCost: Number(data.shippingCost),
        guestEmail: data.guestEmail || undefined,
        guestName: data.guestName || undefined,
        guestPhone: data.guestPhone || undefined,
        courier: data.courier || undefined,
      };

      const orderRes = await api.post('/orders', orderPayload);
      const order = orderRes.data.data;

      const paymentRes = await api.post('/payments/create', { orderNumber: order.orderNumber });
      const { token, clientKey } = paymentRes.data.data;

      if (!document.getElementById('midtrans-snap')) {
        const script = document.createElement('script');
        script.id = 'midtrans-snap';
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', clientKey);
        document.head.appendChild(script);
        await new Promise((resolve) => { script.onload = resolve; });
      }

      window.snap.pay(token, {
        onSuccess: () => {
          clearCart();
          navigate(`/order-success/${order.orderNumber}`);
        },
        onPending: () => {
          clearCart();
          navigate(`/order-success/${order.orderNumber}`);
        },
        onError: () => toast.error('Pembayaran gagal, coba lagi'),
        onClose: () => toast('Pembayaran dibatalkan'),
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-1.5 text-sm text-dark-400 mb-6">
          <Link to="/cart" className="hover:text-primary-400 transition-colors">Keranjang</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white font-medium">Checkout</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-6">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">

              {/* Guest Info */}
              {!isAuthenticated && (
                <div className="bg-dark-900 border border-dark-700 rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary-400" /> Info Pembeli (Guest)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-dark-300 mb-1">Nama Lengkap</label>
                      <input {...register('guestName')} className="input-field" placeholder="Nama Anda" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-dark-300 mb-1">Email</label>
                      <input {...register('guestEmail')} type="email" className="input-field" placeholder="email@contoh.com" />
                      {errors.guestEmail && <p className="text-red-400 text-xs mt-1">{errors.guestEmail.message}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-dark-400 mt-2">
                    Sudah punya akun? <Link to="/login" className="text-primary-400 hover:underline">Masuk di sini</Link>
                  </p>
                </div>
              )}

              {/* Shipping Address */}
              <div className="bg-dark-900 border border-dark-700 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary-400" /> Alamat Pengiriman
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-dark-300 mb-1">Nama Penerima *</label>
                    <input {...register('shippingName')} className="input-field" placeholder="Nama penerima" />
                    {errors.shippingName && <p className="text-red-400 text-xs mt-1">{errors.shippingName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark-300 mb-1">No. Telepon *</label>
                    <input {...register('shippingPhone')} className="input-field" placeholder="08xxxxxxxxxx" />
                    {errors.shippingPhone && <p className="text-red-400 text-xs mt-1">{errors.shippingPhone.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-dark-300 mb-1">Alamat Lengkap *</label>
                    <textarea {...register('shippingAddress')} rows={2} className="input-field resize-none" placeholder="Jl. Contoh No. 123, RT/RW" />
                    {errors.shippingAddress && <p className="text-red-400 text-xs mt-1">{errors.shippingAddress.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark-300 mb-1">Kota *</label>
                    <input {...register('shippingCity')} className="input-field" placeholder="Jakarta" />
                    {errors.shippingCity && <p className="text-red-400 text-xs mt-1">{errors.shippingCity.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark-300 mb-1">Provinsi *</label>
                    <input {...register('shippingProvince')} className="input-field" placeholder="DKI Jakarta" />
                    {errors.shippingProvince && <p className="text-red-400 text-xs mt-1">{errors.shippingProvince.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark-300 mb-1">Kode Pos *</label>
                    <input {...register('shippingPostal')} className="input-field" placeholder="12345" maxLength={5} />
                    {errors.shippingPostal && <p className="text-red-400 text-xs mt-1">{errors.shippingPostal.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark-300 mb-1">Kurir</label>
                    <input {...register('courier')} className="input-field" placeholder="JNE / J&T / SiCepat" />
                  </div>
                </div>
              </div>

              {/* Shipping Cost */}
              <div className="bg-dark-900 border border-dark-700 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-3">Ongkos Kirim</h3>
                <p className="text-xs text-dark-400 mb-3">Ongkos kirim akan dikonfirmasi oleh admin dan dapat disesuaikan.</p>
                <div>
                  <label className="block text-xs font-medium text-dark-300 mb-1">Estimasi Ongkos Kirim (Rp)</label>
                  <input {...register('shippingCost')} type="number" min={0} className="input-field" placeholder="0" />
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-dark-300 mb-1">Catatan Pesanan</label>
                  <textarea {...register('notes')} rows={2} className="input-field resize-none" placeholder="Catatan tambahan untuk pesanan..." />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="bg-dark-900 border border-dark-700 rounded-xl p-5 sticky top-20">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary-400" /> Ringkasan
                </h3>
                <div className="space-y-2 text-sm mb-4">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between text-dark-300">
                      <span className="truncate max-w-[140px]">{product.name} x{quantity}</span>
                      <span className="shrink-0 ml-2 text-dark-200">{formatRupiah(calcFinalPrice(product.price, product.discount) * quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dark-700 pt-3 space-y-1.5 text-sm mb-5">
                  <div className="flex justify-between text-dark-300">
                    <span>Subtotal</span>
                    <span className="text-dark-200">{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-dark-300">
                    <span>Ongkos Kirim</span>
                    <span className="text-dark-200">{formatRupiah(Number(shippingCost))}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-1 border-t border-dark-700">
                    <span>Total</span>
                    <span className="text-primary-400">{formatRupiah(total)}</span>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {loading ? 'Memproses...' : 'Bayar Sekarang'}
                </button>
                <p className="text-xs text-dark-500 text-center mt-2">Pembayaran aman via Midtrans</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
