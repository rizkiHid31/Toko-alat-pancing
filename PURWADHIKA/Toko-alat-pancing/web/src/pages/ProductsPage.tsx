import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/product/ProductCard';
import { Product, Category, PaginatedResponse, ApiResponse } from '../types';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', category, search, sort, page],
    queryFn: () =>
      api.get<PaginatedResponse<Product>>('/products', {
        params: { category, search, sort, page, limit: 12 },
      }).then((r) => r.data),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<ApiResponse<Category[]>>('/products/categories').then((r) => r.data),
  });

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];
  const meta = productsData?.meta;

  const updateFilter = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    setSearchParams(p);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Page header — kontras dengan body */}
      <div className="bg-dark-900 border-b border-dark-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-primary-400 text-xs font-semibold uppercase tracking-widest mb-2">Toko</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {search ? `Hasil: "${search}"` : category ? categories.find((c) => c.slug === category)?.name?.toUpperCase() || 'PRODUK' : 'SEMUA PRODUK'}
          </h1>
          {meta && <p className="text-dark-300 text-sm mt-1">{meta.total} produk ditemukan</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar — sedikit lebih terang */}
          <aside className="md:w-52 shrink-0">
            <div className="bg-dark-900 border border-dark-700 rounded-xl p-4 sticky top-20">
              <div className="flex items-center gap-2 font-semibold text-white mb-4 text-sm">
                <SlidersHorizontal className="w-4 h-4 text-primary-400" /> Filter
              </div>
              <div className="mb-5">
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-2">Kategori</p>
                <button
                  onClick={() => updateFilter('category', '')}
                  className={`block w-full text-left text-sm py-1.5 px-2 rounded-lg mb-1 transition-colors ${!category ? 'bg-primary-600/20 text-primary-400 font-medium' : 'text-dark-200 hover:bg-dark-800 hover:text-white'}`}
                >
                  Semua Kategori
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilter('category', cat.slug)}
                    className={`block w-full text-left text-sm py-1.5 px-2 rounded-lg mb-1 transition-colors ${category === cat.slug ? 'bg-primary-600/20 text-primary-400 font-medium' : 'text-dark-200 hover:bg-dark-800 hover:text-white'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-2">Urutkan</p>
                {[
                  { value: '', label: 'Terbaru' },
                  { value: 'price_asc', label: 'Harga Terendah' },
                  { value: 'price_desc', label: 'Harga Tertinggi' },
                  { value: 'name', label: 'Nama A-Z' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateFilter('sort', opt.value)}
                    className={`block w-full text-left text-sm py-1.5 px-2 rounded-lg mb-1 transition-colors ${sort === opt.value ? 'bg-primary-600/20 text-primary-400 font-medium' : 'text-dark-200 hover:bg-dark-800 hover:text-white'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-dark-800" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-dark-800 rounded w-1/3" />
                      <div className="h-4 bg-dark-800 rounded" />
                      <div className="h-5 bg-dark-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                {meta && meta.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-8">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                      className="p-2 border border-dark-700 rounded-lg disabled:opacity-30 hover:bg-dark-800 transition-colors text-dark-300">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-dark-400">Halaman {page} dari {meta.totalPages}</span>
                    <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}
                      className="p-2 border border-dark-700 rounded-lg disabled:opacity-30 hover:bg-dark-800 transition-colors text-dark-300">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-dark-400">
                <p className="text-lg">Tidak ada produk ditemukan</p>
                <p className="text-sm mt-1">Coba ubah filter pencarian</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
