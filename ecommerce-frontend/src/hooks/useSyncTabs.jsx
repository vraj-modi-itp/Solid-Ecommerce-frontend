import { useEffect } from 'react';
import { useCartStore } from '../store/cartStore';
import { useCheckoutMachine } from '../features/checkout/CheckoutProvider';
import { toast } from 'sonner';

export function useSyncTabs() {
  const { send } = useCheckoutMachine();

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'solid-cart-storage') {
        // Force the cart store to reload from storage
        useCartStore.persist.rehydrate();
        
        // Notify the state machine to reset if mid-checkout (SEC-02 protection)
        send({ type: 'CART_MODIFIED' });
        
        toast.info("Sync: Cart updated in another tab.", { id: 'sync-tab' });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [send]);
}