# Edge Case Matrix

The application is specifically engineered to gracefully handle system failures, network drops, and malicious user intent without crashing, leaking sensitive states, or locking the user in infinite loading loops.

| Edge Case Scenario | Trigger Mechanism | System Validation & Routing | User UI Feedback |
| :--- | :--- | :--- | :--- |
| **Local Storage Tampering** | User modifies item prices directly via Chrome DevTools. | `verifyIntegrity()` hash mismatch. XState routes to `ORDER_INCONSISTENT` and executes `clearCart()`. | Renders a "Security Violation" screen, blocks checkout, and resets the cart. |
| **Multi-Tab Sync Conflict** | User initiates checkout in Tab A while simultaneously altering the cart in Tab B. | `storage` event listener detects `cartVersion` mismatch mid-flight. Throws `TAMPER_DETECTED`. | "State Mismatch" toast triggered. Payment is safely aborted to protect payload integrity. |
| **Network Timeout** | API latency simulation exceeds the strict 5000ms threshold. | XState `after` timer triggers `FORCE_RECOVERY` transition. | "Session stalled" notification appears. UI gracefully reverts to the active Cart view. |
| **Simulated Fraud Block** | Dev Tool simulation preset flags the transaction. | `mockOrderWorkflow` throws `FRAUD_HOLD` error. | UI displays a red security shield with "Transaction Blocked" messaging. |
| **Delivery Failure Loop** | System transitions to `DELIVERY_FAILED` during the simulated fulfillment stage. | Attempt counter increments. Machine exposes a `RESCHEDULE` event returning state to `SHIPPED`. | UI displays a warning with interactive "Reschedule" or "Return to Cart" options. |