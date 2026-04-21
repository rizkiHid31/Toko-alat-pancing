import { Link } from 'react-router-dom';
import { ShoppingCart, Tag } from 'lucide-react';
import { Product } from '../../types';
import { formatRupiah, calcFinalPrice } from '../../lib/utils';
import { useCartStore } from '../../stores/cartStore';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const finalPrice = calcFinalPrice(product.price, product.discount);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return;
    addItem(product);
    toast.success('Ditambahkan ke keranjang');
  };

  return (
    <Link to={`/products/${product.slug}`} className="group bg-dark-800 border border-dark-700 hover:border-dark-500 rounded-xl overflow-hidden transition-all hover:bg-dark-700">
      <div className="relative overflow-hidden bg-dark-800 aspect-square">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-dark-500 bg-dark-700">
            <ShoppingCart className="w-12 h-12" />
          </div>
        )}
        {product.discount && (
          <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
            <Tag className="w-3 h-3" />
            -{product.discount}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-dark-950/70 flex items-center justify-center">
            <span className="bg-dark-800 text-dark-300 text-sm font-medium px-3 py-1 rounded-full border border-dark-700">Habis</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-primary-500 font-medium mb-1">{product.category.name}</p>
        <h3 className="text-sm font-semibold text-dark-100 line-clamp-2 mb-2 group-hover:text-white transition-colors">
          {product.name}
        </h3>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-base font-bold text-white">{formatRupiah(finalPrice)}</p>
            {product.discount && (
              <p className="text-xs text-dark-500 line-through">{formatRupiah(product.price)}</p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-dark-500 mt-1.5">Stok: {product.stock}</p>
      </div>
    </Link>
  );
}
