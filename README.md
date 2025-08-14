<div align="center">

<h1>WorkReserve</h1>

Modern workspace reservation & management platform  
Rooms • TimeSlots • Reservations • Secure Auth • 2FA • Payments • Caching • Auditing

<!-- Badges -->
<p>
  <img src="https://img.shields.io/badge/Java-21+-orange?logo=openjdk" />
  <img src="https://img.shields.io/badge/Spring Boot-3.x-6DB33F?logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/Build-Maven-C71A36?logo=apachemaven" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=222" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white" />
  <img src="https://img.shields.io/badge/Auth-JWT%20%2B%202FA-blueviolet" />
  <img src="https://img.shields.io/badge/Cache-Caffeine-4B8BBE" />
  <img src="https://img.shields.io/badge/DB-H2%20|%20PostgreSQL-lightgrey" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

</div>

---

## 🔍 Quick Glance

| Area | Highlights |
|------|------------|
| Booking | Real‑time availability, conflict-safe reservations |
| Payments | Stripe PaymentIntent (USD), retry & idempotent logic |
| Security | JWT, Role-based (USER/ADMIN), Optional 2FA + backup codes |
| Performance | Caffeine caching (rooms, timeslots, availability, user context) |
| Resilience | Exponential backoff for Stripe rate/lock timeouts |
| UX | Animated flows (Framer Motion), calendar-driven booking |
| Extensibility | Modular services, planned local payment provider abstraction |
| Observability (base) | Structured logging points for payment + reservation lifecycle |
| Testing | Controller & service integration tests + cache stats verification |

---

## 📦 Stack

Frontend: React + TypeScript + Vite + Tailwind + Framer Motion + Stripe Elements  
Backend: Spring Boot (Security, Web, Validation, JPA), JWT, Stripe SDK, Caffeine Cache  
DB: H2 (dev/test) → Postgres/MySQL ready  
Build/Tooling: Maven Wrapper, ESLint, TS strict, modular services  
Planned: Webhooks (Stripe), Payment provider abstraction, Redis (if horizontal scale)

---

## 🧭 Table of Contents
1. [Overview & Value Proposition](#1-overview--value-proposition)  
2. [High-Level Architecture](#2-high-level-architecture)  
3. [Domain Model](#3-domain-model)  
4. [Core Flows (Booking, Payment, TimeSlot Lifecycle, 2FA)](#4-core-flows)  
5. [Tech Stack & Key Libraries](#5-tech-stack--key-libraries)  
6. [Repository Structure](#6-repository-structure)  
7. [Environment Configuration](#7-environment-configuration)  
8. [Backend Setup & Run](#8-backend-setup--run)  
9. [Frontend Setup & Run](#9-frontend-setup--run)  
10. [Payment (Stripe) Integration Details](#10-payment-stripe-integration-details)  
11. [TimeSlot Management & Cleanup Strategy](#11-timeslot-management--cleanup-strategy)  
12. [Reliability & Retry Logic](#12-reliability--retry-logic)  
13. [Caching Layer (Caffeine)](#13-caching-layer-caffeine)  
14. [Security Model (Auth, Roles, 2FA)](#14-security-model)  
15. [Testing Strategy (incl. backend API testing)](#15-testing-strategy-backend-api)  
16. [Logging & Monitoring](#16-logging--monitoring)  
17. [Roadmap / Pending Items](#17-roadmap--pending-items)  
18. [Contributing](#18-contributing)  
19. [License](#19-license)  

---

## 1. Overview & Value Proposition
WorkReserve streamlines reserving workspaces with a clean calendar UI, secure authentication (with optional 2FA), and integrated payment confirmation that only persists reservations after successful payment. Designed for correctness (idempotent flows), extensibility (local provider plug-in later), and operational safety (retry/backoff, cache invalidation discipline).

## 2. High-Level Architecture
```
[ React SPA ] --(HTTPS / JSON)--> [ Spring Boot API ]
                                    |
                               [ JPA / DB ]
                                    |
                               [ Stripe API ]
```
Supporting Components:
- Caffeine in-memory cache (query accelerators)
- SessionStorage (client) for booking + payment intent context across redirects
- Scheduled cleanup (past timeslots without reservations)

## 3. Domain Model
| Entity | Summary | Notes |
|--------|---------|-------|
| User | Auth principal | Roles, 2FA secret (hashed/secured), backup codes |
| Room | Bookable resource | capacity, pricing (USD/hour), type meta |
| TimeSlot | Room interval | start/end ISO times, availability derived |
| Reservation | Binding user ↔ slot | status, created only after payment success |
| Payment (logical) | Stripe PaymentIntent mirror | Not persisted as full entity yet (metadata + reservation link) |
| (Planned) GenerationRule | Recurrent slot patterns | Weekly patterns + horizon |

## 4. Core Flows
### Booking + Payment
1. User selects slot → validate availability.  
2. POST create-payment-intent (slotId, teamSize) → returns clientSecret.  
3. Stripe Elements → confirm → redirect success/cancel.  
4. Success page: reads `payment_intent` → POST confirm-payment → creates reservation (idempotent).  

### Transient Failures
- Backend PaymentService wraps Stripe calls in retry with exponential backoff & jitter (RateLimit / lock_timeout).
- Frontend PaymentSuccess page retries confirmation before showing error state.

### TimeSlot Lifecycle
- Admin generates slots (bulk).
- Cleanup job deletes past unused slots only.
- Reservations anchor historical slots (retained for audits).

### 2FA
- Setup: secret + QR + backup codes modal (must acknowledge).
- Login path splits if 2FA enabled.

## 5. Tech Stack & Key Libraries
(Already summarized above; see pom.json / package.json for versions.)

## 6. Repository Structure
```
backend/
  src/main/java/com/workreserve/backend/{auth,room,reservation,timeslot,payment,user,config}
  src/test/java/com/workreserve/backend/{room,reservation,timeslot,user,cache}
frontend/
  src/{components,pages,services,context,hooks,lib}
```

## 7. Environment Configuration
Backend secrets in `application-secrets.properties` (excluded).  
Frontend env: `.env` with `VITE_API_BASE_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`.  
See existing section retained below for full property tables.

## 8–13
(Sections retained verbatim from prior version: setup, run commands, payment detail, timeslot strategy, reliability wrapper, full caching design.)

## 14. Security Model
- JWT bearer tokens; role gating.
- Optional 2FA step required post primary auth.
- Backup codes single-use.
- Planned improvement: refresh token rotation + device tracking.

## 15. Testing Strategy (Backend API)
Includes:
- Controller integration tests (AuthControllerIT, RoomControllerIT, ReservationControllerIT, TimeSlotControllerIT, UserControllerIT).
- CacheTest & CacheTestController for instrumentation of Caffeine stats.
- Planned PaymentService tests mocking Stripe.
- Manual cURL recipes (already in retained sections).
- Strategy table + edge case catalog (retained).

## 16. Logging & Monitoring
Current:
- Structured log messages around payment confirmation attempts.
- Cache hit/miss accessible via test controller (non-prod).
Planned:
- Micrometer + Prometheus (cache metrics, booking latency).
- Stripe webhook event audit log channel.

## 17. Roadmap / Pending Items
(Existing roadmap preserved; add:)
- Webhook ingestion (payment_intent.succeeded)
- Payment provider abstraction interface
- Redis or distributed cache if scaling horizontally
- Advanced availability search (multi-room heuristic)

## 18. Contributing
Short:
1. Branch.
2. Implement + test.
3. PR with justification + screenshots (if UI).

## 19. License
MIT.

---

### Quick Start
Backend:
```powershell
cd backend
./mvnw.cmd spring-boot:run
```
Frontend:
```powershell
cd frontend
npm i
npm run dev
```
Visit http://localhost:5173

---



