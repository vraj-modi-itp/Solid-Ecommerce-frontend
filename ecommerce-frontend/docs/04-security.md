# Security & Tampering Strategy (Frontend-Only)

Because frontend-only applications rely heavily on browser storage, they are highly susceptible to client-side manipulation. A dual-layer security approach was engineered to protect payload integrity before it ever reaches a hypothetical backend.

## Threat Model & Defense Sequence: Local Storage Tampering
1. User adds an item to the cart via the UI ($100).
2. Zustand Store saves `{ price: 100 }` to Local Storage, alongside a generated `Hash(593284)`.
3. User opens Chrome DevTools and manually edits the JSON to `{ price: 1 }`.
4. User clicks "Secure Checkout".
5. XState Engine triggers `verifyIntegrity()` before processing the payment.
6. Zustand Store returns `FALSE` because the hash of the new $1 price does not match the original hash.
7. XState Engine intercepts the mismatch, triggers `clearCart()`, and displays the Security Violation UI.

## Core Security Layers

### Layer 1: Client-Side Integrity Hash
Every time an item is added, removed, or updated via the official UI, the Zustand store generates a 32-bit integer signature based on the current item IDs, quantities, and prices. If a malicious user alters `localStorage` directly, the signature mismatch traps the payload during the XState validation phase, permanently rejecting the checkout.

### Layer 2: Cross-Tab Versioning
The application assigns a timestamp-based `cartVersion` on every legal mutation. A window `storage` listener synchronizes this across tabs in real-time. If a checkout is initiated in Tab A, and the version changes mid-flight because of an action in Tab B, the session is instantly invalidated to prevent transaction race conditions.