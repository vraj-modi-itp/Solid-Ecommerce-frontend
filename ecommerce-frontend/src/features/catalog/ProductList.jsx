import { useState, useMemo, forwardRef, useEffect, useCallback } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import { VirtuosoGrid } from 'react-virtuoso';
import { Search, ArrowUpDown } from 'lucide-react';
import { ProductCard } from '../../components/ProductCard';
import { useCartStore } from '../../store/cartStore';
import { fetchPage, getCategories } from '../../services/api';

const ProductSkeleton = () => (
  <div className="flex h-[380px] w-full flex-col justify-between rounded-3xl border border-zinc-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] animate-pulse">
    <div className="h-48 w-full rounded-2xl bg-zinc-100/80 mb-6" />
    <div className="space-y-4 mb-4">
      <div className="h-3 w-3/4 bg-zinc-200 rounded-full" />
      <div className="h-3 w-1/2 bg-zinc-100 rounded-full" />
    </div>
    <div className="mt-auto flex items-center justify-between pt-5 border-t border-zinc-50">
      <div className="h-7 w-20 bg-zinc-200 rounded-md" />
      <div className="h-10 w-10 bg-zinc-100 rounded-full" />
    </div>
  </div>
);

const flexGridComponents = {
  List: forwardRef(({ style, children, ...props }, ref) => (
    <div ref={ref} {...props} style={style} className="flex flex-wrap w-full">
      {children}
    </div>
  )),
  Item: ({ children, ...props }) => (
    <div {...props} className="w-full p-3 sm:w-1/2 md:w-1/3 lg:w-1/4 flex animate-in slide-in-from-bottom-8 fade-in duration-700 ease-out">
      {children}
    </div>
  )
};

export function ProductList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounceValue(searchTerm, 300);
  const addItem = useCartStore((state) => state.addItem);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');

  useEffect(() => {
    const loadFilters = async () => {
      const cats = await getCategories();
      setCategories(['All', ...cats]);
    };
    loadFilters();
    loadMore();
  }, []);

  const loadMore = useCallback(async () => {
    if (isFetchingNextPage || !hasMore) return;
    setIsFetchingNextPage(true);
    try {
      const result = await fetchPage(page);
      setItems(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error("Failed to fetch page", error);
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [page, isFetchingNextPage, hasMore]);

  // Combined Memoized Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let result = [...items];

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (debouncedSearch) {
      const lower = debouncedSearch.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(lower));
    }

    if (sortOrder === 'low') result.sort((a, b) => a.price - b.price);
    if (sortOrder === 'high') result.sort((a, b) => b.price - a.price);

    return result;
  }, [debouncedSearch, items, selectedCategory, sortOrder]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      
      {/* Premium Hero Header */}
      <div className="mb-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between animate-in slide-in-from-top-6 fade-in duration-700">
        <div className="max-w-md">
          <h1 className="text-4xl font-black tracking-tighter text-zinc-900 sm:text-5xl">THE CATALOG.</h1>
          <p className="mt-3 text-sm font-medium text-zinc-500 leading-relaxed">
            Discover our curated collection of premium essentials, designed for everyday excellence.
          </p>
        </div>
        
        {/* Sleek Controls Bar */}
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row md:justify-end">
          <div className="relative w-full group sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
            <input
              type="text"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-3.5 pl-11 pr-4 text-sm font-bold text-zinc-900 placeholder:text-zinc-400 placeholder:font-medium focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none transition-all shadow-sm"
              placeholder="Search essentials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full sm:w-auto appearance-none rounded-2xl border border-zinc-200 bg-zinc-50/50 py-3.5 pl-5 pr-12 text-sm font-bold text-zinc-900 focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none transition-all shadow-sm cursor-pointer"
            >
              <option value="default">Latest Arrivals</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
            <ArrowUpDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Floating Category Navigation */}
      <div className="relative mb-12 animate-in fade-in duration-1000 delay-150">
        <div className="flex overflow-x-auto pb-4 scrollbar-hide gap-2 mask-edges">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`relative whitespace-nowrap rounded-2xl px-7 py-3 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ease-out ${
                selectedCategory === cat 
                  ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 translate-y-[-2px]' 
                  : 'bg-white text-zinc-500 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      {/* Optimized Virtual Grid */}
      <div className="-mx-3 min-h-[500px]">
        <VirtuosoGrid
          useWindowScroll
          data={filteredProducts}
          components={{
            ...flexGridComponents,
            Footer: () => isFetchingNextPage ? (
              <div className="flex flex-wrap w-full mt-8">
                {[1, 2, 3, 4].map(k => <div key={k} className="w-full p-3 sm:w-1/2 md:w-1/3 lg:w-1/4 flex"><ProductSkeleton /></div>)}
              </div>
            ) : null
          }}
          itemContent={(index, product) => <ProductCard product={product} onAdd={addItem} />}
          endReached={loadMore}
        />
      </div>
    </div>
  );
}