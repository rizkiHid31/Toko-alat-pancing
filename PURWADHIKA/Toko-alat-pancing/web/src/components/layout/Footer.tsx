import { Link } from 'react-router-dom';
import { Fish, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-dark-800 text-dark-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight mb-3">
              <Fish className="w-6 h-6 text-primary-500" />
              TOKO PANCING
            </Link>
            <p className="text-sm text-dark-400 leading-relaxed max-w-xs">
              Destinasi lengkap peralatan memancing dengan kualitas terbaik untuk para pemancing Indonesia.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wide text-xs">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Beranda</Link></li>
              <li><Link to="/products" className="hover:text-primary-400 transition-colors">Semua Produk</Link></li>
              <li><Link to="/track" className="hover:text-primary-400 transition-colors">Lacak Pesanan</Link></li>
              <li><Link to="/account" className="hover:text-primary-400 transition-colors">Akun Saya</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wide text-xs">Kontak</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                <span>Jl. Contoh No. 123, Jakarta</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-500" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-500" />
                <span>info@tokopancing.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-800 mt-10 pt-6 text-center text-xs text-dark-500">
          © {new Date().getFullYear()} Toko Pancing. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
