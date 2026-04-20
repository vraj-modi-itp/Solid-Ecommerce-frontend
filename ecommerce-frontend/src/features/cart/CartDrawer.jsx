import { useEffect, useState } from 'react';
import { X, Minus, Plus, Trash2, Loader2, CheckCircle, AlertTriangle, ShieldAlert, RotateCcw, Timer, ChevronRight } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useCheckoutMachine } from '../checkout/CheckoutProvider';
import { useSyncTabs } from '../../hooks/useSyncTabs';
import { OrderTimeline } from '../../components/OrderTimeline';
import { toast } from 'sonner';

export function CartDrawer({ isOpen, onClose }) {
  useSyncTabs(); 
  const items = useCartStore((state) => state.items);
  const { updateQuantity, removeItem, clearCart } = useCartStore();
  const { state, send } = useCheckoutMachine();

  const [countdown, setCountdown] = useState(10);
  const [isRecovering, setIsRecovering] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const shipping = (subtotal > 100 || subtotal === 0) ? 0 : 15;
  const grandTotal = subtotal + tax + shipping;

  const isCart = state.matches('CART');
  const isPending = state.matches('PAYMENT_PENDING');
  const isFailed = state.matches('ORDER_FAILED') || state.matches('PAYMENT_DECLINED');
  const isInconsistent = state.matches('ORDER_INCONSISTENT') || state.matches('ROLLED_BACK');
  const isFraud = state.matches('FRAUD_HOLD');
  const isSuccess = state.matches('CONFIRMED') || state.matches('DELIVERED') || state.matches('CLOSED');
  
  const showItems = isCart || isFailed || isInconsistent || isFraud || state.matches('DELIVERY_FAILED');

  // Detect Recovery
  useEffect(() => {
    if (state.matches('PAYMENT_PENDING')) setIsRecovering(true);
    else setIsRecovering(false);
  }, [state.value]);

  // EFFECT 1: Handle Cart Clearing & Status Toasts
  useEffect(() => {
    if (state.matches('CONFIRMED')) clearCart();
    
    if (state.changed) {
      toast.info(`System Status: ${state.value.toString().toUpperCase()}`, { id: 'status-toast' });
    }
  }, [state.value, state.changed, clearCart]);

  // EFFECT 2: The Circuit Breaker Timer (Isolated!)
  useEffect(() => {
    let recoveryTimer;
    if (isPending) {
      recoveryTimer = setTimeout(() => {
        send({ type: 'FORCE_RECOVERY' });
        toast.error("Session stalled. Restored to Cart.", {
          id: 'timeout-toast',
          duration: 5000
        });
      }, 4900); // 4900ms to beat XState's internal 5000ms clock
    }
    return () => clearTimeout(recoveryTimer);
  }, [isPending, send]); 
  // Notice 'countdown' is NOT in this array anymore! It won't reset early.

  // EFFECT 3: The Visual Countdown Clock
  useEffect(() => {
    let pollTimer;
    if (isPending && countdown > 0) {
      pollTimer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (!isPending && countdown !== 10) {
      setCountdown(10); // Reset clock for the next checkout attempt
    }
    return () => clearInterval(pollTimer);
  }, [isPending, countdown]);

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity" onClick={isPending ? undefined : onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl sm:w-[450px] animate-in slide-in-from-right duration-300">
        
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tighter text-gray-900">Order Session</h2>
            <p className="text-[10px] font-mono text-blue-500 uppercase font-bold">Node: {typeof state.value === 'string' ? state.value : 'Processing'}</p>
          </div>
          <button onClick={onClose} disabled={isPending} className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30">
            <X size={20} />
          </button>
        </div>

        <div className="border-b bg-gray-50 px-6">
          <OrderTimeline currentState={state.value} />
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          
          {isInconsistent && (
            <div className="text-center py-10 space-y-4 bg-orange-50 rounded-2xl p-6 border border-orange-200 mb-6 animate-in zoom-in duration-300">
              <ShieldAlert className="mx-auto h-12 w-12 text-orange-600" />
              <h3 className="font-bold text-orange-900 uppercase">Security Violation</h3>
              <p className="text-sm text-orange-700">Data tampering or tab conflict detected. Session must be reset.</p>
              <button 
                onClick={() => { clearCart(); send({ type: 'BACK_TO_CART' }); }} 
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold shadow-lg active:scale-95 transition-all"
              >
                Clear Cart & Reset
              </button>
            </div>
          )}

          {isPending && (
            <div className="text-center py-16 space-y-6">
              <div className="relative mx-auto w-20 h-20">
                <Loader2 className="w-20 h-20 animate-spin text-blue-600" />
                {isRecovering && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{formatTime(countdown)}</span>
                )}
              </div>
              <div className="space-y-2 px-8">
                <h3 className="text-xl font-black tracking-tight text-gray-900 uppercase">
                  {isRecovering ? 'Recovering Session...' : 'Processing Payment...'}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-relaxed">
                  {isRecovering 
                    ? 'Re-verifying transaction integrity. Will auto-reset in 5 seconds if stalled.'
                    : 'Securely authenticating with bank vault. Please do not close or refresh.'}
                </p>
              </div>
            </div>
          )}

          {isFailed && (
            <div className="text-center py-10 space-y-4 bg-red-50 rounded-2xl p-6 border border-red-100 mb-6 animate-in zoom-in duration-300">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="font-black text-red-900 uppercase tracking-widest text-sm">Transaction Denied</h3>
              <p className="text-xs text-red-700 font-medium">Reason: {state.context.errorMessage || 'Unable to authorize payment.'}</p>
              <button onClick={() => send({ type: 'BACK_TO_CART' })} className="w-full bg-black text-white py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-gray-900 transition-all active:scale-95">
                Return to Cart
              </button>
            </div>
          )}

          {isFraud && (
            <div className="text-center py-10 space-y-4 bg-red-50 rounded-2xl p-6 border border-red-200 mb-6 animate-in zoom-in duration-300">
              <ShieldAlert className="mx-auto h-12 w-12 text-red-600" />
              <h3 className="font-bold text-red-900 uppercase">Security: Fraud Block</h3>
              <p className="text-sm text-red-700 font-medium">This transaction pattern has been flagged for review.</p>
              <button onClick={() => send({ type: 'BACK_TO_CART' })} className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 active:scale-95">Return to Cart</button>
            </div>
          )}

          {state.matches('FULFILLMENT') && (
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-3 mb-6">
              <div className="flex items-center gap-2 text-blue-700 font-bold"><Timer size={18} /> Seller SLA Tracking</div>
              <p className="text-xs text-blue-600 font-medium">The warehouse is currently packing your items. Expected dispatch: 4 hours.</p>
              <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-600 h-full w-1/3 animate-pulse" /></div>
            </div>
          )}

          {state.matches('DELIVERY_FAILED') && (
            <div className="text-center py-10 space-y-6 bg-red-50 rounded-2xl p-8 border border-red-100 mb-6 animate-in zoom-in duration-300">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500" strokeWidth={2.5} />
              <div className="space-y-3">
                <h3 className="text-lg font-black text-red-900 uppercase tracking-widest">
                  Delivery Attempt {state.context.attempt}/3 Failed
                </h3>
                <p className="text-sm text-red-700 font-medium">Recipient was not found at the destination.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => send({ type: 'RESCHEDULE' })} className="flex-1 bg-red-600 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform shadow-md">
                  Reschedule
                </button>
                <button onClick={() => send({ type: 'BACK_TO_CART' })} className="flex-1 bg-black text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform shadow-md">
                  Return to Cart
                </button>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="text-center py-10 space-y-6 animate-in fade-in zoom-in duration-300">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 animate-bounce" />
              <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900">
                {state.matches('DELIVERED') || state.matches('CLOSED') ? 'Order Delivered' : 'Order Verified'}
              </h2>
              <p className="text-sm text-gray-500">Your order has been processed successfully.</p>
              <button 
                onClick={() => { send({ type: 'BACK_TO_CART' }); onClose(); }} 
                className="w-full bg-black text-white py-4 rounded-xl font-bold tracking-widest active:scale-95 transition-all shadow-xl"
              >
                BACK TO SHOP
              </button>
            </div>
          )}

          {(showItems && !isInconsistent) && (
            <ul className="space-y-6">
              {items.length === 0 ? (
                <div className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest text-[10px]">No items in basket</div>
              ) : (
                items.map((item) => (
                  <li key={item.id} className="flex gap-4 border-b pb-6 last:border-0 group animate-in slide-in-from-bottom-2 duration-300">
                    <div className="h-20 w-20 flex-shrink-0 bg-white rounded-lg p-2 border border-gray-100 group-hover:border-gray-300 transition-colors">
                      <img src={item.image} alt={item.title} className="h-full w-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                        <span className="text-sm font-black text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
                          <button onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))} className="px-3 py-1 hover:bg-gray-200 transition-colors">-</button>
                          <span className="px-3 text-xs font-black">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-200 transition-colors">+</button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1 transition-colors">
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {(showItems && !isInconsistent && items.length > 0) && (
          <div className="p-6 border-t bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.08)]">
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span>Items Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span>Tax (GST 8%)</span><span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span>Estimated Shipping</span>
                <span className={shipping === 0 ? "text-green-600" : ""}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between pt-3 border-t text-2xl font-black tracking-tighter text-gray-900 uppercase italic">
                <span>Grand Total</span><span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
            
            {isCart && (
              <button 
                onClick={() => { send({ type: 'VALIDATE' }); send({ type: 'SUBMIT', initialVersion: useCartStore.getState().cartVersion }); }}
                className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-900 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Secure Checkout <ChevronRight size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}