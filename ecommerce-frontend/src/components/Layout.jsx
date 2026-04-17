import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShoppingCart, Settings2, Zap } from 'lucide-react';
import { Toaster } from 'sonner';
import { useCartStore } from '../store/cartStore';
import { CartDrawer } from '../features/cart/CartDrawer';
import { useCheckoutMachine } from '../features/checkout/CheckoutProvider';
import { useDevStore } from '../store/devStore';
import { useSyncTabs } from '../hooks/useSyncTabs';

function StateDebugger() {
  const { state, send } = useCheckoutMachine();
  const testMode = useDevStore((state) => state.testMode);
  const setTestMode = useDevStore((state) => state.setTestMode);

  // Sequential order enforcements
  const isConfirmed = state.matches('CONFIRMED');
  const isFulfillment = state.matches('FULFILLMENT');
  const isShipped = state.matches('SHIPPED');

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80 rounded-2xl border border-gray-800 bg-black/95 p-5 text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
        <Settings2 size={14} /> System Controller
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-[9px] uppercase font-bold text-gray-400 mb-2 block tracking-widest">Simulation Preset</label>
          <select 
            value={testMode}
            onChange={(e) => setTestMode(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 text-xs text-blue-400 rounded-lg p-2.5 outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="SUCCESS">✅ Success Flow</option>
            <option value="BANK_DECLINE">❌ Payment Declined</option>
            <option value="FRAUD_BLOCK">🚨 Fraud Block</option>
            <option value="NETWORK_TIMEOUT">⏳ API Timeout</option>
            <option value="INCONSISTENT">🛡️ State Mismatch</option>
          </select>
        </div>

        <div>
          <label className="text-[9px] uppercase font-bold text-gray-400 mb-2 block tracking-widest">Manual Node Jumps</label>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => send({ type: 'FULFILL' })} 
              disabled={!isConfirmed}
              className="flex items-center justify-center gap-1 text-[9px] bg-gray-800 hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-800 p-2 rounded-md font-bold transition-all active:scale-95"
            >
              <Zap size={10} /> OMS-04 (Process)
            </button>
            <button 
              onClick={() => send({ type: 'SHIP' })} 
              disabled={!isFulfillment}
              className="flex items-center justify-center gap-1 text-[9px] bg-gray-800 hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-800 p-2 rounded-md font-bold transition-all active:scale-95"
            >
              <Zap size={10} /> OMS-Shipped
            </button>
            <button 
              onClick={() => send({ type: 'DELIVER' })} 
              disabled={!isShipped}
              className="flex items-center justify-center gap-1 text-[9px] bg-gray-800 hover:bg-green-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-800 p-2 rounded-md font-bold transition-all active:scale-95"
            >
              <Zap size={10} /> OMS-Complete
            </button>
            <button 
              onClick={() => send({ type: 'FAIL' })} 
              disabled={!isShipped}
              className="flex items-center justify-center gap-1 text-[9px] bg-gray-800 hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-800 p-2 rounded-md font-bold transition-all active:scale-95"
            >
              <Zap size={10} /> OMS-03 (Failed)
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800 text-[9px] font-mono flex justify-between uppercase tracking-tighter">
        <span className="text-gray-500">Active Node:</span>
        <span className="text-green-400 font-bold">
          {typeof state.value === 'string' ? state.value : Object.keys(state.value)[0]}
        </span>
      </div>
    </div>
  );
}

export function Layout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useSyncTabs(); 

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors expand={true} pauseWhenPageIsHidden />
      
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-md px-4 py-4 shadow-sm sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="text-xl font-black tracking-tighter text-gray-900 hover:opacity-80 transition-opacity italic">
            SOLID<span className="text-gray-400">.</span>
          </Link>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative rounded-full p-2.5 bg-gray-100 text-gray-900 transition-all hover:bg-gray-200 active:scale-90 focus:outline-none"
            aria-label="Open Shopping Cart"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[9px] font-black text-white ring-2 ring-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="relative min-h-[calc(100-73px)]">
        <Outlet />
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      {/* <StateDebugger /> */}
    </div>
  );
}   