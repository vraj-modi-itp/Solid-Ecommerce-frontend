# Notification Design & Rules

Application notifications are powered by the `sonner` library. They adhere to strict UX, anti-spam, and Accessibility (A11y) rules to ensure users are informed without being overwhelmed.

## Core Implementation Rules

1. **Deduplication:** State-based toasts (like order updates) share a static ID (`id: 'status-toast'`). This prevents UI spam; rapid state updates replace the existing toast's content rather than stacking infinitely up the screen.

2. **Queueing & Visibility:** Toasts are configured to pause their exit timers automatically when the browser tab loses focus. This ensures users do not miss critical transaction alerts while browsing other tabs.

3. **ARIA Compliance for Screen Readers:** Critical state transitions (like Fraud Blocks or Payment Declines) render with `aria-live="assertive"`. This ensures screen readers immediately announce system changes that interrupt the standard flow, providing equal access to security alerts.