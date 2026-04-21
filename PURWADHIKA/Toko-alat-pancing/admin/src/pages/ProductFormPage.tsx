import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { X, Upload, ArrowLeft } from 'lucide-react';
import api from '../lib/axios';
import Header from '../components/layout/Header';
import { Category, ApiResponse, Product } from '../types';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().min(1, 'Pilih kategori'),
  discount: z.coerce.number().min(0).max(100).optional().nullable(),
  isActive: z.boolean().optional(),
});
type Form = z.infer<typeof schema>;

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id && id !== 'new';
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<ApiResponse<Category[]>>('/products/categories').then((r) => r.data),
  });

  const { data: productData } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => api.get<ApiResponse<Product>>(`/admin/products/${id}`).then((r) => r.data),
    enabled: isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, discount: null },
  });

  useEffect(() => {
    if (productData?.data) {
      const p = productData.data;
      reset({ name: p.name, description: p.description, price: p.price, stock: p.stock, categoryId: p.categoryId, discount: p.discount, isActive: p.isActive });
      setExistingImages(p.images);
    }
  }, [productData, reset]);

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== null && v !== undefined) formData.append(k, String(v));
      });
      images.forEach((f) => formData.append('images', f));

      if (isEdit) {
        await api.put(`/admin/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Produk diperbarui');
      } else {
        await api.post('/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Produk ditambahkan');
      }
      navigate('/products');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeExistingImage = async (url: string) => {
    if (!isEdit) return;
    await api.post(`/admin/products/${id}/delete-image`, { imageUrl: url });
    setExistingImages((prev) => prev.filter((i) => i !== url));
    toast.success('Gambar dihapus');
  };

  return (
    <div>
      <Header
        title={isEdit ? 'Edit Produk' : 'Tambah Produk'}
        actions={
          <button onClick={() => navigate('/products')} className="btn-secondary flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-gray-800">Informasi Produk</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Produk *</label>
                <input {...register('name')} className="input-field" placeholder="Nama produk" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi *</label>
                <textarea {...register('description')} rows={4} className="input-field resize-none" placeholder="Deskripsi produk..." />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga (Rp) *</label>
                  <input {...register('price')} type="number" min={0} className="input-field" placeholder="0" />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stok *</label>
                  <input {...register('stock')} type="number" min={0} className="input-field" placeholder="0" />
                  {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Gambar Produk</h3>
              {existingImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {existingImages.map((url) => (
                    <div key={url} className="relative">
                      <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {images.map((f, i) => (
                    <div key={i} className="relative">
                      <img src={URL.createObjectURL(f)} alt="" className="w-20 h-20 object-cover rounded-lg border border-dashed border-primary-300" />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl p-5 hover:border-primary-400 transition-colors">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">Upload gambar (maks. 5, 5MB/gambar)</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-gray-800">Kategori & Harga</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori *</label>
                <select {...register('categoryId')} className="input-field">
                  <option value="">Pilih Kategori</option>
                  {categoriesData?.data?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Diskon (%)</label>
                <input {...register('discount')} type="number" min={0} max={100} className="input-field" placeholder="0" />
              </div>
              <div className="flex items-center gap-2">
                <input {...register('isActive')} type="checkbox" id="isActive" className="rounded" defaultChecked />
                <label htmlFor="isActive" className="text-sm text-gray-700">Produk Aktif</label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
