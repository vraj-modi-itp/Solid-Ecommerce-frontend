# SOLID. | Premium E-Commerce Architecture

> A production-ready e-commerce flagship built with React and XState, featuring deterministic checkout flows, advanced client-side security, and high-performance DOM virtualization.

---

## 📖 Project Overview
SOLID is an enterprise-grade, frontend-only e-commerce application designed to simulate a complete, highly secure shopping and checkout experience. By decoupling UI components from complex business logic using finite state machines, the application delivers a resilient, glitch-free user journey even under adverse network conditions or malicious tampering attempts.

## 🛠️ Core Tech Stack
* **Framework:** React 18 (via Vite)
* **State Management:** Zustand (Global store with `localStorage` persistence)
* **Business Logic:** XState (Deterministic finite state machines)
* **Performance:** `react-virtuoso` (DOM windowing/virtualization)
* **Styling & UI:** Tailwind CSS, `lucide-react` (Icons), `sonner` (Toast notifications)

---

## 📚 Technical Documentation Directory
Please explore the project's documentation files (located in `docs/`) to understand the architecture, failure handling, and observability tooling used in this project:

1. **[Architecture & Data Flow](./docs/01-architecture-data-flow.md)** — Unidirectional data flow, Zustand + XState control.
2. **[Edge Case Matrix](./docs/02-edge-cases.md)** — Failure scenarios and deterministic routing (timeouts, tampering, multi-tab conflicts).
3. **[Performance Techniques & Evidence](./docs/03-performance.md)** — DOM virtualization, debouncing, memoization, and profiling notes.
4. **[Security & Tampering Strategy](./docs/04-security.md)** — Client-side integrity hashing and cross-tab versioning.
5. **[Notification Design & Rules](./docs/05-notifications.md)** — Toast behavior, deduplication, and A11y considerations.
6. **[Observability, Debugging & Metrics](./docs/06-observability.md)** — Structured logging, StateDebugger UI, and dev simulation tools.
7. **[Originality Declaration](./docs/07-declaration.md)** — Authorship, licensing notes and acknowledgements.
8. **[Application Screenshots & Visual Walkthrough](./docs/08-screenshots.md)** — Chronological screenshot gallery embedded from the `data/` folder.
9. **[Video Demonstration](./docs/09-video-demonstration.md)**-Video Demonstration for understanding purpose
**How to preview these docs locally**

- In VS Code: open the file and press `Ctrl+Shift+V` (or `Markdown: Open Preview to Side`).
- For a GitHub-style preview install `grip` (`pip install grip`) and run `grip docs/08-screenshots.md` to view a rendered page in the browser.

If you'd like, I can generate a compact index page (`docs/index.md`) or copy chosen screenshots into `public/screenshots/` for GitHub rendering.

---
*Developed by Vraj Modi.(#).*