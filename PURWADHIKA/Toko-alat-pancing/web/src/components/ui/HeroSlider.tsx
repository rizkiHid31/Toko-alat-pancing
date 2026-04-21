import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  image: string;
  label: string;
  title: string;
  subtitle: string;
  cta: { text: string; to: string };
}

const slides: Slide[] = [
  {
    image: '/slides/slide-1.jpg',
    label: 'Lengkapi Perlengkapan Anda',
    title: 'ALAT PANCING\nTERLENGKAP',
    subtitle: 'Joran, reel, senar, dan semua perlengkapan memancing berkualitas tinggi dalam satu toko.',
    cta: { text: 'Lihat Alat Pancing', to: '/products?category=alat-pancing' },
  },
  {
    image: '/slides/slide-2.jpg',
    label: 'Promo Terbaru',
    title: 'UMPAN & LURE\nUNTUK SEMUA IKAN',
    subtitle: 'Temukan berbagai pilihan umpan dan lure terbaik untuk semua jenis perairan.',
    cta: { text: 'Lihat Koleksi', to: '/products?category=umpan-lure' },
  },
  {
    image: '/slides/slide-3.jpg',
    label: 'Pakan Berkualitas',
    title: 'PAKAN IKAN\nPILIHAN PEMANCING',
    subtitle: 'Pakan ikan pilihan yang efektif menarik ikan ke area pancingan Anda.',
    cta: { text: 'Lihat Pakan', to: '/products?category=pakan-ikan' },
  },
  {
    image: '/slides/slide-4.jpg',
    label: 'Racikan Terbaik',
    title: 'CAMPURAN UMPAN\nRAHASIA PEMANCING',
    subtitle: 'Essen, perekat, dan bahan campuran umpan untuk hasil pancingan maksimal.',
    cta: { text: 'Lihat Campuran', to: '/products?category=campuran-umpan' },
  },
  {
    image: '/slides/slide-5.jpg',
    label: 'Semua Kebutuhan',
    title: 'TOKO PANCING\nTERPERCAYA',
    subtitle: 'Semua kebutuhan memancing tersedia — dari pemula hingga pemancing profesional.',
    cta: { text: 'Belanja Sekarang', to: '/products' },
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative h-[85vh] min-h-[500px] max-h-[800px] overflow-hidden bg-dark-950">

      {/* Semua gambar di-render, crossfade via opacity */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={s.image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
          />
        </div>
      ))}

      {/* Overlay gradien — selalu di atas gambar */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark-950/90 via-dark-950/55 to-dark-950/10 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950/50 via-transparent to-transparent z-10" />

      {/* Fallback jika belum ada gambar */}
      <div className="absolute inset-0 bg-dark-950 -z-10">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-900/10 rounded-full blur-3xl" />
      </div>

      {/* Konten teks — z-20 supaya di atas overlay */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl transition-opacity duration-500">
            <p className="text-primary-400 text-xs font-semibold uppercase tracking-widest mb-4">
              {slide.label}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-5 tracking-tight whitespace-pre-line">
              {slide.title}
            </h1>
            <p className="text-dark-300 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
              {slide.subtitle}
            </p>
            <Link
              to={slide.cta.to}
              className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold uppercase tracking-wide"
            >
              {slide.cta.text} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Tombol Prev / Next */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-dark-950/60 hover:bg-dark-800/80 border border-dark-700 rounded-full text-white transition-all hover:scale-105"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-dark-950/60 hover:bg-dark-800/80 border border-dark-700 rounded-full text-white transition-all hover:scale-105"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2 bg-primary-500' : 'w-2 h-2 bg-dark-500 hover:bg-dark-400'}`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute bottom-6 right-6 z-30 text-xs text-dark-400 font-medium tabular-nums">
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>
    </section>
  );
}
