# oMazons Take-Home — Invoice Service

A full-stack invoicing service built for the oMazons Full-Stack Developer hiring process. It includes a Node.js API (Prisma + PostgreSQL) and a Vue 3 frontend, structured within a monorepo.

---

## 🚀 How to Run It

### Prerequisites

- Node.js (v18+)
- [pnpm](https://pnpm.io/)
- Docker (for PostgreSQL)

### Setup & Execution

1. **Start the Database**
   ```bash
   docker compose up -d
   ```
2. **Install Dependencies**
   ```bash
   pnpm install
   ```
3. **Apply Database Migrations**
   ```bash
   pnpm --filter api prisma db push
   # or run migrations if applicable
   ```
4. **Start the Development Servers**
   ```bash
   pnpm dev
   ```
   This command spins up both the Node API and the Vue frontend simultaneously.

---

## 🎯 What is Required (The Spec)

- **Backend:** A Node.js service using TypeScript, PostgreSQL, and Prisma. Endpoints must support creating, listing, fetching, and downloading server-rendered PDFs of invoices.
- **Business Rules:** Strict handling of currency using minor units (cents/paise to avoid floating-point math), strict monotonic invoice numbering (format `INV-YYYYMM-####`), half-to-even tax rounding, and strict status transitions (`draft` → `issued` → `paid` or `void`).
- **Frontend:** A minimal Vue 3 Composition API interface to list, create, and view invoice details alongside a PDF download trigger.

---

## 🏗️ What We Have Built

- **Core API Structure:** Functional endpoints handling creation, pagination, state transitions, and single-item fetching.
- **Robust DB Schema:** A Prisma schema strictly enforcing currency minor units and preventing floating-point inaccuracies, alongside required relational links and enums.
- **Core Web UI:** A Vue 3 application built with Tailwind CSS that successfully consumes the API. It allows users to quickly paginate through invoices, view details, and create new drafts with calculated line-item totals.

---

## 🔮 What We Will Implement Next (Future Improvements)

Because this assignment was scoped to a strict time limit, the initial focus was heavily weighted toward API correctness, state logic, and math. In the next iteration, we will address the following:

### Frontend (UI/UX) Improvements

The UI was built functionally but hurriedly. Our next steps include:

- **Component Polish:** Integrate accessible, styled UI components (like Shadcn-Vue or Vuetify) instead of relying purely on standard HTML elements styled with Tailwind.
- **Form Validation:** Introduce robust form validation (e.g., `VeeValidate` or `Zod`) to provide granular, field-level error messages instead of a single computed-property check.
- **User Feedback:** Add global Toast/Snackbar notifications for successful or failed actions (e.g., generating PDFs, changing invoice statuses).
- **Loading States:** Implement skeleton loaders and button-level spinners to visually communicate asynchronous API calls.
- **Advanced Data Tables:** Upgrade the invoice list view to support column sorting, filtering by status, and better mobile responsiveness.

### Backend Improvements

- **Request Validation:** Implement a schema validator (like `Zod` or `TypeBox`) at the HTTP route level to ensure incoming payloads exactly match expected types before hitting the service layer.
- **Logging & Monitoring:** Replace standard `console.log` statements with a structured, high-performance logger like `Pino` or `Winston`.
- **Standardized Error Handling:** Implement global error-handling middleware to ensure all API error responses return a consistent JSON format with correct HTTP status codes.

---

## ⏱️ What I'd Do Differently With Another 3 Hours

1. **PDF Generation Refinement:** I would fully implement, style, and polish the `@react-pdf/renderer` server-side generation to ensure the downloaded PDF perfectly mirrors the frontend detail view.
2. **Comprehensive Test Coverage:** While core math and state transitions are tested, I would add comprehensive integration tests (using Vitest or Supertest) for the Fastify/Node routes, and component tests for the Vue frontend.
3. **Extract Shared Package:** I would create a `packages/shared` directory to house shared Typescript interfaces (e.g., `InvoiceStatus`, `LineItem`) and Zod validation schemas so the API and Web clients consume the exact same source of truth without duplication.

---

## ⚖️ Tradeoffs Made

- **Manual Form Validation vs. External Library:** I used basic Vue computed properties for form validation (`isFormValid`) to save time and reduce bundle dependencies. The tradeoff is a lack of specific, field-level error messages.
- **Offset vs. Cursor Pagination:** I implemented standard offset-based pagination (`skip`/`take`). While cursor-based pagination is more performant for massive, continuously growing datasets, offset pagination was faster to implement and fully satisfies the assignment scope.
- **Minimal UI:** Functionality was prioritized over aesthetics. Native HTML inputs (`<input type="date">`, `<select>`) were used instead of building custom dropdowns or date pickers.

---

## 🛑 Pushback on the Spec

**"Numbers (number field) must be monotonic per month — no gaps under normal operation."**

If this were a real-world production task, I would push back on the strict requirement for _gapless_ monotonic sequence numbers in a distributed, high-throughput system.

Generating strictly sequential IDs requires database locks (e.g., locking a counter table row). This creates a severe performance bottleneck during concurrent invoice creation. If a transaction claims a number but fails/rolls back right after, leaving no gap becomes incredibly complex without stalling other requests.

**Alternative proposal:** Use time-sorted, collision-resistant IDs (like `ULID` or `Snowflake`) for the primary key. Handle the "Legal Invoice Number" asynchronously via a background queue, and accept that gaps might legitimately occur for discarded drafts, or rely on legal frameworks that accept gaps as long as the numbers are monotonically increasing.
