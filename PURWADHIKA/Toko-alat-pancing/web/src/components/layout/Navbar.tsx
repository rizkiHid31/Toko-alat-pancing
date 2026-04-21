import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Fish, Search } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-dark-800 border-b border-dark-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
            <Fish className="w-6 h-6 text-primary-500" />
            <span>TOKO PANCING</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari peralatan pancing..."
                className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-gray-100 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </form>

          <div className="hidden md:flex items-center gap-5">
            <Link to="/products" className="text-dark-300 hover:text-white text-sm font-medium transition-colors uppercase tracking-wide">
              Produk
            </Link>
            <Link to="/track" className="text-dark-300 hover:text-white text-sm font-medium transition-colors uppercase tracking-wide">
              Lacak
            </Link>
            <Link to="/cart" className="relative p-2 text-dark-300 hover:text-white transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-sm font-medium text-dark-300 hover:text-white transition-colors">
                  <User className="w-5 h-5" />
                  <span>{user?.name.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 mt-2 w-44 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link to="/account" className="block px-4 py-2.5 text-sm text-dark-200 hover:text-white hover:bg-dark-800 rounded-t-xl">
                    Akun Saya
                  </Link>
                  <Link to="/account/orders" className="block px-4 py-2.5 text-sm text-dark-200 hover:text-white hover:bg-dark-800">
                    Pesanan Saya
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-dark-800 rounded-b-xl"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-dark-300 hover:text-white transition-colors">
                  Masuk
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                  Daftar
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden p-2 text-dark-300 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-dark-800 pt-3 space-y-2">
            <form onSubmit={handleSearch} className="flex items-center mb-3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk..."
                  className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-gray-100 placeholder-dark-400 focus:outline-none"
                />
              </div>
            </form>
            <Link to="/products" className="block py-2 text-sm text-dark-300 hover:text-white uppercase tracking-wide" onClick={() => setMenuOpen(false)}>Produk</Link>
            <Link to="/track" className="block py-2 text-sm text-dark-300 hover:text-white uppercase tracking-wide" onClick={() => setMenuOpen(false)}>Lacak Pesanan</Link>
            <Link to="/cart" className="flex items-center gap-2 py-2 text-sm text-dark-300 hover:text-white" onClick={() => setMenuOpen(false)}>
              Keranjang {totalItems > 0 && <span className="bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full">{totalItems}</span>}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/account" className="block py-2 text-sm text-dark-300 hover:text-white" onClick={() => setMenuOpen(false)}>Akun Saya</Link>
                <Link to="/account/orders" className="block py-2 text-sm text-dark-300 hover:text-white" onClick={() => setMenuOpen(false)}>Pesanan Saya</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="block py-2 text-sm text-red-400">Keluar</button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="btn-secondary text-sm flex-1 text-center py-2" onClick={() => setMenuOpen(false)}>Masuk</Link>
                <Link to="/register" className="btn-primary text-sm flex-1 text-center py-2" onClick={() => setMenuOpen(false)}>Daftar</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
