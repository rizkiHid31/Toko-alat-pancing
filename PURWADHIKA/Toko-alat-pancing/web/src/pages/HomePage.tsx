import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Fish, Shield, Truck, Star, Waves, Zap, Wrench, FlaskConical } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/product/ProductCard';
import HeroSlider from '../components/ui/HeroSlider';
import { Product, Category } from '../types';

export default function HomePage() {
  const { data: productsData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.get<{ success: boolean; data: Product[] }>('/products/featured').then((r) => r.data),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<{ success: boolean; data: Category[] }>('/products/categories').then((r) => r.data),
  });

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];

  return (
    <div>
      <HeroSlider />

      {/* Features — sedikit lebih terang */}
      <section className="bg-dark-800 border-b border-dark-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-dark-700">
            {[
              { icon: Truck, title: 'Pengiriman Ke Seluruh Indonesia', desc: 'Kirim ke semua wilayah dengan kurir terpercaya' },
              { icon: Shield, title: 'Produk Original & Terjamin', desc: 'Semua produk 100% asli bergaransi resmi' },
              { icon: Star, title: 'Layanan Pelanggan 7/7', desc: 'Tim kami siap membantu kebutuhan Anda' },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-4 px-6 py-5">
                <f.icon className="w-6 h-6 text-primary-400 shrink-0" />
                <div>
                  <p className="font-semibold text-white text-sm">{f.title}</p>
                  <p className="text-dark-400 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories — kembali gelap */}
      {categories.length > 0 && (
        <section className="bg-dark-950 py-16 border-b border-dark-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <p className="text-primary-500 text-xs font-semibold uppercase tracking-widest mb-2">Koleksi</p>
              <h2 className="text-2xl font-bold text-white tracking-tight">KATEGORI PRODUK</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const iconMap: Record<string, { icon: React.ElementType; desc: string }> = {
                  'pakan-ikan':    { icon: Fish,         desc: 'Pelet, cacing, dan pakan alami' },
                  'umpan-lure':    { icon: Zap,          desc: 'Soft lure, hard lure, spinner' },
                  'alat-pancing':  { icon: Wrench,       desc: 'Joran, reel, senar, kail' },
                  'campuran-umpan':{ icon: FlaskConical, desc: 'Essen, perekat, aroma umpan' },
                };
                const meta = iconMap[cat.slug] || { icon: Waves, desc: '' };
                const Icon = meta.icon;
                return (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.slug}`}
                    className="group bg-dark-800 border border-dark-700 hover:border-primary-500 rounded-xl p-5 flex items-center gap-4 transition-all hover:bg-dark-700"
                  >
                    <div className="p-3 bg-dark-900 group-hover:bg-primary-600/20 rounded-xl transition-colors shrink-0">
                      <Icon className="w-6 h-6 text-primary-500 group-hover:text-primary-400 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-dark-100 group-hover:text-white transition-colors text-sm">{cat.name}</p>
                      <p className="text-xs text-dark-500 mt-0.5 truncate">{meta.desc}</p>
                      {cat._count && <p className="text-xs text-primary-600 mt-1">{cat._count.products} produk</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products — section lebih terang untuk kontras */}
      <section className="bg-dark-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-primary-500 text-xs font-semibold uppercase tracking-widest mb-2">Terbaru</p>
              <h2 className="text-2xl font-bold text-white tracking-tight">PRODUK PILIHAN</h2>
            </div>
            <Link to="/products" className="text-primary-400 text-sm font-medium hover:text-primary-300 flex items-center gap-1 transition-colors">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-dark-500">
              <Fish className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Belum ada produk tersedia</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary-800 border-t border-primary-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3">
            SIAP UNTUK PETUALANGAN MEMANCING?
          </h2>
          <p className="text-primary-200 mb-7 max-w-xl mx-auto">
            Temukan semua peralatan yang Anda butuhkan dalam satu tempat.
          </p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-white text-primary-800 font-semibold px-8 py-3.5 rounded-lg hover:bg-primary-50 transition-colors uppercase tracking-wide text-sm">
            Lihat Semua Produk <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
