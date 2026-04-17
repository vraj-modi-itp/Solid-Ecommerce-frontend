import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProductCard({ product, onAdd }) {
  return (
    <div className="flex h-[340px] w-full flex-col justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-gray-200">
      
      {/* THE FIX: Pre-emptive scroll on the exact moment of the click */}
      <Link 
        to={`/product/${product.id}`} 
        onClick={() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }}
        className="flex flex-col h-full cursor-pointer group"
      >
        <div className="relative mb-3 flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-50">
          <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain p-2 mix-blend-multiply transition-transform duration-300 group-hover:scale-105" />
        </div>
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{product.title}</h3>
        <p className="mt-1 text-xs text-gray-500 capitalize">{product.category}</p>
      </Link>

      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
        <button
          onClick={(e) => { 
            e.preventDefault(); 
            onAdd(product); 
          }}
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        >
          <ShoppingCart size={16} /> Add
        </button>
      </div>
    </div>
  );
}