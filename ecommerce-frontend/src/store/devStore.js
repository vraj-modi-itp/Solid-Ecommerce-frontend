import { create } from 'zustand';

export const useDevStore = create((set) => ({
  testMode: 'SUCCESS',
  setTestMode: (mode) => set({ testMode: mode }),
  // Track cart version to detect multi-tab changes
  cartVersion: Date.now(),
  incrementVersion: () => set({ cartVersion: Date.now() }),
}));