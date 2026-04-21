import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, ChevronRight, Minus, Plus, Tag } from 'lucide-react';
import api from '../lib/api';
import { Product, ApiResponse } from '../types';
import { formatRupiah, calcFinalPrice } from '../lib/utils';
import { useCartStore } from '../stores/cartStore';
import ProductCard from '../components/product/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const addItem = useCartStore((s) => s.addItem);

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get<ApiResponse<Product>>(`/products/${slug}`).then((r) => r.data),
  });

  const { data: relatedData } = useQuery({
    queryKey: ['related', data?.data?.id],
    queryFn: () => api.get<ApiResponse<Product[]>>(`/products/${data!.data.id}/related`).then((r) => r.data),
    enabled: !!data?.data?.id,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-dark-800 rounded-xl" />
          <div className="space-y-4">
            <div className="h-6 bg-dark-800 rounded w-3/4" />
            <div className="h-8 bg-dark-800 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return <div className="text-center py-20 text-dark-400">Produk tidak ditemukan</div>;
  }

  const product = data.data;
  const finalPrice = calcFinalPrice(product.price, product.discount);
  const related = relatedData?.data || [];

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addItem(product, qty);
    toast.success(`${qty} item ditambahkan ke keranjang`);
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-dark-400 mb-6">
          <Link to="/" className="hover:text-primary-400 transition-colors">Beranda</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-primary-400 transition-colors">Produk</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/products?category=${product.category.slug}`} className="hover:text-primary-400 transition-colors">{product.category.name}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-dark-200 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-dark-800 rounded-xl overflow-hidden mb-3 border border-dark-700">
              {product.images[activeImg] ? (
                <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-dark-500">
                  <ShoppingCart className="w-16 h-16" />
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-primary-500' : 'border-dark-700 hover:border-dark-500'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-primary-400 text-sm font-medium mb-1">{product.category.name}</p>
            <h1 className="text-2xl font-bold text-white mb-4 leading-snug">{product.name}</h1>

            <div className="flex items-end gap-3 mb-4">
              <span className="text-3xl font-bold text-primary-400">{formatRupiah(finalPrice)}</span>
              {product.discount && (
                <>
                  <span className="text-lg text-dark-400 line-through">{formatRupiah(product.price)}</span>
                  <span className="bg-primary-900/50 text-primary-300 text-sm font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-primary-700/50">
                    <Tag className="w-3 h-3" />-{product.discount}%
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 mb-5">
              <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${product.stock > 0 ? 'bg-green-900/40 text-green-400 border border-green-700/50' : 'bg-red-900/40 text-red-400 border border-red-700/50'}`}>
                {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
              </span>
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <p className="text-sm text-dark-300 font-medium">Jumlah:</p>
                <div className="flex items-center border border-dark-600 rounded-lg bg-dark-800">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-dark-700 rounded-l-lg transition-colors text-dark-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-white">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="p-2 hover:bg-dark-700 rounded-r-lg transition-colors text-dark-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-3"
              >
                <ShoppingCart className="w-4 h-4" />
                {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
              </button>
              <Link
                to="/cart"
                onClick={product.stock > 0 ? handleAddToCart : undefined}
                className="flex-1 btn-secondary text-center py-3 font-medium"
              >
                Beli Sekarang
              </Link>
            </div>

            <div className="border-t border-dark-700 pt-5">
              <h3 className="font-semibold text-white mb-3">Deskripsi Produk</h3>
              <p className="text-dark-300 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl font-bold text-white mb-5">Produk Serupa</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
