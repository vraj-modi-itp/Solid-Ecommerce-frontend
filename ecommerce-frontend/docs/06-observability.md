# Observability, Debugging & Metrics

To ensure the application remains maintainable and predictable, robust observability strategies were integrated into the architecture. This actively moves the codebase away from a reliance on unstructured `console.log` statements and towards enterprise-grade monitoring.

## 1. The Debugging Toolkit

| Methodology | Tool Used | Purpose & Impact |
| :--- | :--- | :--- |
| **Breakpoint Debugging** | Chrome DevTools | Because business logic is isolated in XState machines outside of React components, breakpoints can be placed predictably in the `Sources` tab without fighting virtual DOM render cycles. |
| **Structured Logging** | Custom `StateDebugger` UI | Exposes internal XState nodes directly to the screen. This provides visual, real-time structural logging of the exact machine state and attempt counters. |
| **Data Transmission Observation** | `useDevStore` Simulation | Intercepts mock API calls to deterministically force network failures. This allows QA to observe how the UI handles dropped packets or 500 errors gracefully. |

## 2. Structured Logging (Event Payloads)

Instead of relying on console outputs, the XState machine is designed to broadcast structured JSON payloads when critical security or system events occur. Below is a simulated payload of a client-side tampering event.

**Example Payload: Cart Tampering Event (`STORAGE_TAMPERED`)**
```json
{
  "timestamp": "2026-04-17T14:04:36Z",
  "level": "CRITICAL",
  "event": "CHECKOUT_VALIDATION_FAILED",
  "service": "solid-frontend-client",
  "machine_state": "ORDER_INCONSISTENT",
  "user_session": "sess_9x8b7c6d",
  "metrics": {
    "cart_value_attempted": 1.00,
    "cart_value_expected": 249.99,
    "cart_version": 1713362000
  },
  "error_details": {
    "code": "STORAGE_TAMPERED",
    "message": "Client-side integrity hash mismatch detected during mockOrderWorkflow validation."
  }
}