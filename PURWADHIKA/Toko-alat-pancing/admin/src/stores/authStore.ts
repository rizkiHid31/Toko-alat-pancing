import { create } from 'zustand';

interface AdminUser { id: string; name: string; email: string; role: string; }
interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AdminUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => { try { const u = localStorage.getItem('admin_user'); return u ? JSON.parse(u) : null; } catch { return null; } })(),
  token: localStorage.getItem('admin_token'),
  isAuthenticated: !!localStorage.getItem('admin_token'),
  setAuth: (user, token) => {
    localStorage.setItem('admin_user', JSON.stringify(user));
    localStorage.setItem('admin_token', token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
