import { createContext, useContext, useEffect } from 'react';
import { useMachine } from '@xstate/react';
import { checkoutMachine } from '../../machine/checkoutMachine';

const CheckoutContext = createContext(null);
// We change the key to 'secure-order-v3' to force-clear old 'CART_READY' data for all users
const STORAGE_KEY = 'secure-order-v3'; 

export function CheckoutProvider({ children }) {
  const getPersistedState = () => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (!saved) return undefined;
      
      const parsed = JSON.parse(saved);

      /**
       * SAFETY CHECK: 
       * If the saved state is 'CART_READY' (the old name), 
       * we ignore it and return undefined to start fresh at 'CART'.
       */
      if (parsed.value === 'CART_READY') {
        sessionStorage.removeItem(STORAGE_KEY);
        return undefined;
      }

      return parsed;
    } catch (error) {
      console.error("Persistence recovery failed:", error);
      return undefined;
    }
  };

  const [state, send] = useMachine(checkoutMachine, {
    state: getPersistedState()
  });

  useEffect(() => {
    if (state) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  return (
    <CheckoutContext.Provider value={{ state, send }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckoutMachine() {
  const context = useContext(CheckoutContext);
  if (!context) throw new Error('useCheckoutMachine must be within CheckoutProvider');
  return context;
}