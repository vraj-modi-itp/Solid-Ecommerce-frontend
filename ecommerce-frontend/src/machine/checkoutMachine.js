import { createMachine, assign, fromPromise } from 'xstate';
import { useDevStore } from '../store/devStore';
import { useCartStore } from '../store/cartStore';

// MOCK API WORKFLOW
const mockOrderWorkflow = fromPromise(async ({ input }) => {
  const { testMode } = useDevStore.getState();
  const cartStore = useCartStore.getState();

  // SEC-04: Handling the refresh recovery timer
  const delay = testMode === 'NETWORK_TIMEOUT' ? 10000 : 3000;
  
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      if (testMode === 'NETWORK_TIMEOUT') reject(new Error("API_TIMEOUT"));
      else resolve();
    }, delay);
  });

  // SEC-02a: Integrity Check (Tab Mismatch)
  if (input.initialVersion !== cartStore.cartVersion) {
    throw new Error("TAMPER_DETECTED");
  }

  // SEC-02b: Integrity Check (Local Storage Manual Edit)
  if (!cartStore.verifyIntegrity()) {
    throw new Error("STORAGE_TAMPERED");
  }
  
  // OMS Edge Case Triggers
  if (testMode === 'FRAUD_BLOCK') throw new Error("FRAUD_HOLD");
  if (testMode === 'BANK_DECLINE') throw new Error("PAYMENT_DECLINED");
  if (testMode === 'INCONSISTENT') throw new Error("INTERNAL_MISMATCH");

  return { orderId: `ORD-${Math.random().toString(36).substr(2, 9)}` };
});

export const checkoutMachine = createMachine({
  id: 'orderLifecycle',
  initial: 'CART',
  context: { initialVersion: null, errorMessage: null, attempt: 1 },
  
  // Global Transitions for Manual Dev Tool Jumps
  on: {
    FULFILL: { target: '.FULFILLMENT' },
    SHIP: { target: '.SHIPPED' },
    DELIVER: { target: '.DELIVERED' },
    FAIL: { target: '.DELIVERY_FAILED' },
    BACK_TO_CART: { target: '.CART' }
  },

  states: {
    CART: { 
      on: { 
        SUBMIT: {
          target: 'PAYMENT_PENDING',
          actions: assign({ 
            initialVersion: () => useCartStore.getState().cartVersion 
          })
        }
      } 
    },

    PAYMENT_PENDING: {
      invoke: {
        src: 'mockOrderWorkflow',
        input: ({ context }) => ({ initialVersion: context.initialVersion }),
        onDone: { target: 'CONFIRMED' },
        onError: [
          { target: 'PAYMENT_DECLINED', guard: ({ event }) => event.error.message === 'PAYMENT_DECLINED' },
          { target: 'FRAUD_HOLD', guard: ({ event }) => event.error.message === 'FRAUD_HOLD' },
          // Catches both Tab Mismatch AND Storage Tampering
          { target: 'ORDER_INCONSISTENT', guard: ({ event }) => ['TAMPER_DETECTED', 'INTERNAL_MISMATCH', 'STORAGE_TAMPERED'].includes(event.error.message) },
          { target: 'ORDER_FAILED', actions: assign({ errorMessage: ({ event }) => event.error.message }) }
        ]
      },
      after: { 5000: 'CART' },
      on: { 
        CART_MODIFIED: 'ORDER_INCONSISTENT',
        FORCE_RECOVERY: 'CART'
      }
    },

    PAYMENT_DECLINED: { on: { BACK_TO_CART: 'CART' } },
    FRAUD_HOLD: { on: { RESOLVE: 'CART', BACK_TO_CART: 'CART' } },
    ORDER_FAILED: { on: { BACK_TO_CART: 'CART' } },

    CONFIRMED: { 
      on: { 
        PROCEED_TO_FULFILLMENT: 'FULFILLMENT',
        START_NEW: 'CART' 
      } 
    },

    FULFILLMENT: { 
      on: { 
        SHIP_ORDER: 'SHIPPED',
        CANCEL_ORDER: 'CANCELLED' 
      } 
    },

    SHIPPED: { 
      on: { 
        OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
        DELIVER_SUCCESS: 'DELIVERED',
        DELIVER_FAIL: 'DELIVERY_FAILED'
      } 
    },

    OUT_FOR_DELIVERY: { 
      on: { 
        DELIVER_SUCCESS: 'DELIVERED',
        DELIVER_FAIL: {
          target: 'DELIVERY_FAILED',
          actions: assign({ attempt: ({ context }) => context.attempt + 1 })
        }
      } 
    },

    DELIVERY_FAILED: { 
      on: { 
        RESCHEDULE: 'SHIPPED',
        RETRY: 'SHIPPED',
        RETURN_TO_ORIGIN: 'CANCELLED',
        BACK_TO_CART: 'CART'
      } 
    },

    DELIVERED: { 
      on: { 
        INITIATE_RETURN: 'RETURN_INITIATED',
        CLOSE_ORDER: 'CLOSED' 
      } 
    },

    RETURN_INITIATED: { on: { COMPLETE_REFUND: 'CLOSED', BACK_TO_CART: 'CART' } },
    CANCELLED: { on: { RESET: 'CART', BACK_TO_CART: 'CART' } },
    ORDER_INCONSISTENT: { on: { ROLLBACK: 'ROLLED_BACK', BACK_TO_CART: 'CART' } },
    ROLLED_BACK: { on: { RESET: 'CART', BACK_TO_CART: 'CART' } },
    CLOSED: { type: 'final' }
  }
}, { actors: { mockOrderWorkflow } });