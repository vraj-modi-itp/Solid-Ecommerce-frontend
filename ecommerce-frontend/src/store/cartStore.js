import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// SECURITY: Generates a lightweight digital signature of the cart data.
// If a user manually changes a price in localStorage, this hash will mismatch.
const generateSignature = (items) => {
  const payload = JSON.stringify(items.map(i => ({ id: i.id, price: i.price, quantity: i.quantity })));
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = ((hash << 5) - hash) + payload.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(16);
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      cartVersion: Date.now(), 
      signature: generateSignature([]), // Store baseline hash
      
      addItem: (product) => set((state) => {
        const existing = state.items.find(i => i.id === product.id);
        const newItems = existing 
          ? state.items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
          : [...state.items, { ...product, quantity: 1 }];
        return { items: newItems, cartVersion: Date.now(), signature: generateSignature(newItems) };
      }),
      
      updateQuantity: (id, quantity) => set((state) => {
        const newItems = state.items.map(i => i.id === id ? { ...i, quantity } : i);
        return { items: newItems, cartVersion: Date.now(), signature: generateSignature(newItems) };
      }),
      
      removeItem: (id) => set((state) => {
        const newItems = state.items.filter(i => i.id !== id);
        return { items: newItems, cartVersion: Date.now(), signature: generateSignature(newItems) };
      }),
      
      clearCart: () => set({ items: [], cartVersion: Date.now(), signature: generateSignature([]) }),

      // SECURITY: Public method to verify if localStorage was tampered with
      verifyIntegrity: () => {
        const { items, signature } = get();
        return generateSignature(items) === signature;
      }
    }),
    { 
      name: 'solid-cart-storage',
      storage: createJSONStorage(() => localStorage), 
    } 
  )
);