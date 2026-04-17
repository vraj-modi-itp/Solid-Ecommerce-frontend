# Architecture & Data Flow

The SOLID application utilizes a strict, unidirectional data flow architecture. UI components are purely presentational, decoupling business logic into dedicated state managers (Zustand) and finite state machines (XState).

## System Data Flow Logic
Instead of relying on unpredictable boolean flags (e.g., `isProcessing`, `isError`), the checkout lifecycle is strictly governed by XState. 

**The Checkout Sequence:**
1. **User Action:** React UI Component dispatches a `SUBMIT` event.
2. **State Transition:** XState engine moves from the `CART` node to the `PAYMENT_PENDING` node.
3. **Validation:** The mock API service reads the Zustand payload from Local Storage.
4. **Resolution:** - If Hash Validation Fails -> Routes to `ORDER_INCONSISTENT`
   - If Simulated Timeout (>5000ms) -> Routes to `CART` + Recovery Toast
   - If Simulated Success -> Routes to `CONFIRMED`
5. **UI Update:** React UI updates automatically based on the new, immutable XState node.

## Core Architectural Layers
1. **The Presentation Layer (React):** Handles rendering, animations, and user inputs. It listens to the current XState node to determine what UI to show.
2. **The Global State Layer (Zustand):** Manages the transient shopping cart state. It persists data to the browser's `localStorage` and handles cross-tab synchronization.
3. **The Control Layer (XState):** The definitive source of truth for the transaction. It evaluates the Zustand payload, simulates network requests, and mathematically ensures illegal state transitions cannot occur.