import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart } from 'lucide-react';
import { fetchProductById } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { toast } from 'sonner';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (error) {
        toast.error("Product not found.");
        navigate('/'); 
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex h-[75vh] w-full flex-col items-center justify-center space-y-6 animate-in fade-in duration-700">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-14 w-14 animate-ping rounded-full bg-zinc-200 opacity-60"></div>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 relative z-10"></div>
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 animate-pulse">
          Loading Details
        </div>
      </div>
    );
  }

  if (!product) return null;

  const handleAdd = () => {
    addItem(product);
    toast.success("Added to your bag.");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-32 md:pb-12">
      
      <button 
        onClick={() => navigate(-1)} 
        className="group mb-8 flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 hover:text-zinc-900 transition-colors duration-300 w-fit"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 group-hover:bg-zinc-200 transition-colors">
          <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-0.5" /> 
        </div>
        Back to Catalog
      </button>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-20 items-center">
        <div className="relative flex aspect-square w-full items-center justify-center rounded-[2.5rem] bg-zinc-50 p-12 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-left-8 duration-700 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-zinc-100/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
          <img 
            src={product.image} 
            alt={product.title} 
            className="relative z-10 max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-110 drop-shadow-xl" 
          />
        </div>

        <div className="flex flex-col justify-center animate-in fade-in slide-in-from-right-8 duration-700 delay-150 fill-mode-both">
          <div className="mb-5 inline-flex w-fit items-center rounded-full border border-zinc-200 bg-white px-4 py-1.5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
              {product.category}
            </span>
          </div>
          
          <h1 className="mb-6 text-4xl font-black tracking-tighter text-zinc-900 sm:text-5xl lg:text-6xl leading-[1.1]">
            {product.title}
          </h1>
          
          <div className="mb-8 flex items-center gap-5">
            <div className="flex items-center gap-2 rounded-xl bg-zinc-900 px-3 py-1.5 text-white shadow-md">
              <Star className="h-4 w-4 fill-current text-yellow-400" />
              <span className="text-sm font-black">{product.rating.rate}</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-400">
              Based on {product.rating.count} Reviews
            </span>
          </div>

          <p className="mb-10 text-base leading-relaxed text-zinc-500 font-medium max-w-xl">
            {product.description}
          </p>

          <div className="mb-8 flex items-end gap-2 border-t border-zinc-100 pt-8">
            <span className="text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">USD</span>
            <span className="text-5xl font-black tracking-tighter text-zinc-900">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/80 p-4 backdrop-blur-xl sm:p-6 md:relative md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
            <button 
              onClick={handleAdd}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 px-8 py-5 text-sm font-black uppercase tracking-widest text-white transition-all duration-300 hover:bg-black hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1 active:scale-95 md:w-auto md:px-12"
            >
              <ShoppingCart size={18} className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" /> 
              Add to Bag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}