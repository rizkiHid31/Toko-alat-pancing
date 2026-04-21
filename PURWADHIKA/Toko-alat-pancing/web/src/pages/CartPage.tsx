import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { formatRupiah, calcFinalPrice } from '../lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="bg-dark-950 min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-dark-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Keranjang Kosong</h2>
          <p className="text-dark-400 mb-6">Belum ada produk di keranjang Anda</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
            Mulai Belanja <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-950 min-h-screen">
      <div className="border-b border-dark-800 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">KERANJANG BELANJA</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity }) => {
              const finalPrice = calcFinalPrice(product.price, product.discount);
              return (
                <div key={product.id} className="card p-4 flex gap-4">
                  <div className="w-20 h-20 bg-dark-800 rounded-lg overflow-hidden shrink-0 border border-dark-700">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-dark-600">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${product.slug}`} className="font-semibold text-dark-100 text-sm hover:text-white line-clamp-2">
                      {product.name}
                    </Link>
                    <p className="text-xs text-primary-500 mt-0.5">{product.category.name}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-dark-700 rounded-lg bg-dark-800">
                        <button onClick={() => updateQuantity(product.id, quantity - 1)} className="p-1.5 hover:bg-dark-700 rounded-l-lg text-dark-300 hover:text-white transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-white">{quantity}</span>
                        <button onClick={() => updateQuantity(product.id, Math.min(product.stock, quantity + 1))} className="p-1.5 hover:bg-dark-700 rounded-r-lg text-dark-300 hover:text-white transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{formatRupiah(finalPrice * quantity)}</p>
                        {product.discount && <p className="text-xs text-dark-500 line-through">{formatRupiah(product.price * quantity)}</p>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeItem(product.id)} className="p-2 text-dark-600 hover:text-red-400 transition-colors self-start">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div>
            <div className="card p-5 sticky top-20">
              <h3 className="font-bold text-white mb-4">Ringkasan Pesanan</h3>
              <div className="space-y-2 text-sm mb-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-dark-400">
                    <span className="truncate max-w-[160px]">{product.name} x{quantity}</span>
                    <span className="shrink-0 ml-2 text-dark-300">{formatRupiah(calcFinalPrice(product.price, product.discount) * quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dark-800 pt-3 mb-5">
                <div className="flex justify-between font-bold text-white">
                  <span>Subtotal</span>
                  <span className="text-primary-400">{formatRupiah(totalPrice())}</span>
                </div>
                <p className="text-xs text-dark-500 mt-1">*Belum termasuk ongkos kirim</p>
              </div>
              <Link to="/checkout" className="btn-primary w-full text-center block py-3 uppercase tracking-wide font-semibold text-sm">
                Lanjut ke Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
