import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Fish, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Password tidak cocok', path: ['confirmPassword'],
});
type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await api.post('/auth/register', {
        name: data.name, email: data.email, password: data.password, phone: data.phone,
      });
      setAuth(res.data.data.user, res.data.data.token);
      toast.success('Akun berhasil dibuat!');
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Pendaftaran gagal');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-dark-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Fish className="w-10 h-10 text-primary-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white tracking-tight">BUAT AKUN BARU</h1>
          <p className="text-dark-400 text-sm mt-2">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary-400 font-medium hover:text-primary-300">Masuk di sini</Link>
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Nama Lengkap *</label>
              <input {...register('name')} className="input-field" placeholder="Nama Anda" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Email *</label>
              <input {...register('email')} type="email" className="input-field" placeholder="email@contoh.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">No. Telepon</label>
              <input {...register('phone')} className="input-field" placeholder="08xxxxxxxxxx" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Password *</label>
              <div className="relative">
                <input {...register('password')} type={showPw ? 'text' : 'password'} className="input-field pr-10" placeholder="Min. 6 karakter" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Konfirmasi Password *</label>
              <input {...register('confirmPassword')} type={showPw ? 'text' : 'password'} className="input-field" placeholder="Ulangi password" />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 uppercase tracking-wide font-semibold">
              {isSubmitting ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
