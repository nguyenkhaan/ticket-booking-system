# Concert Ticket Booking Platform - Backend Project Blueprint

## 1. Solution Overview

This backend should prioritize **correct inventory control** and **safe high-concurrency booking** before adding complex features.

Primary goals:
- Prevent overselling ticket inventory
- Prevent duplicate booking from client retry/network timeout
- Limit voucher abuse (re-use, brute force, multi-account abuse)
- Stay stable under peak 300-500 req/min

Recommended approach:
- Modular NestJS monolith (fast to launch, clear domain boundaries)
- PostgreSQL as source of truth (transactions + row-level locking)
- Redis for cache, distributed lock, rate limit, and idempotency key store
- Async job queue (BullMQ/Redis) for timeout release and post-booking tasks

## 2. Backend Architecture Suggestion

### 2.1 High-level components

- API Layer (NestJS REST)
  - Customer APIs
  - Internal Operation APIs
- Domain Modules
  - Auth
  - Users
  - Concerts
  - Ticket Inventory
  - Bookings
  - Vouchers
  - Payments (integration-ready)
  - Operations Dashboard
  - Audit Log
- Data Layer
  - PostgreSQL
  - Redis
- Async Layer
  - Job queue workers (reservation expiration, notification, fraud checks)
- Observability
  - Structured logs
  - Metrics endpoint (Prometheus)
  - Health checks (DB, Redis)

### 2.2 Concurrency / anti-oversell strategy

Use DB transaction for reservation:
1. `BEGIN`
2. Lock ticket category row with `SELECT ... FOR UPDATE`
3. Verify available quantity
4. Insert booking + booking_items (status `PENDING_PAYMENT`)
5. Decrease available quantity atomically
6. Commit

If payment not completed within TTL (e.g., 10 minutes), worker auto-cancels and returns stock.

### 2.3 Idempotency strategy

For booking create endpoint, require `Idempotency-Key` header:
- Store key in Redis with user+payload hash
- If same key/payload retried, return previous result
- If same key with different payload, reject `409`

### 2.4 Voucher abuse prevention

- Global usage limit per voucher
- Per-user usage limit
- Validity window checks
- Optional minimum order amount
- Optional allowlist constraints (email domain, user segment)
- Rate limit voucher apply endpoint
- Audit all voucher validations and redemptions

## 3. Suggested Tech Stack

- Runtime: Node.js 22+
- Framework: NestJS
- DB: PostgreSQL 16
- Cache/Queue/Lock: Redis 7
- ORM: Prisma (or TypeORM; Prisma recommended for productivity)
- Queue: BullMQ
- Auth: JWT + role-based access control (`customer`, `operator`, `admin`)
- API Docs: Swagger
- Validation: class-validator / zod
- Testing: Jest + e2e tests

## 4. Project Folder Structure Suggestion

```txt
booking-system/
  src/
    main.ts
    app.module.ts
    common/
      guards/
      interceptors/
      filters/
      decorators/
      constants/
      utils/
    config/
      configuration.ts
      validation.ts
    modules/
      auth/
      users/
      concerts/
      ticket-categories/
      bookings/
      vouchers/
      payments/
      operations/
      audit-log/
      health/
    infra/
      prisma/
      redis/
      queue/
      logger/
  prisma/
    schema.prisma
    migrations/
    seed.ts
  test/
    e2e/
  docs/
    project_scope.md
    project.md
  Dockerfile
  docker-compose.yml
  .env.example
```

## 5. Database Schema Suggestion

### 5.1 Core tables

1. `users`
- `id` (uuid, pk)
- `email` (unique)
- `password_hash`
- `full_name`
- `role` (`CUSTOMER|OPERATOR|ADMIN`)
- `status` (`ACTIVE|LOCKED`)
- `created_at`, `updated_at`

2. `concerts`
- `id` (uuid, pk)
- `title`
- `description`
- `venue`
- `start_time`
- `end_time`
- `status` (`DRAFT|PUBLISHED|CLOSED|CANCELLED`)
- `created_by` (fk users)
- `created_at`, `updated_at`

3. `ticket_categories`
- `id` (uuid, pk)
- `concert_id` (fk concerts)
- `name` (VIP, Standard, ...)
- `price`
- `currency` (default `USD`)
- `total_quantity`
- `reserved_quantity` (default 0)
- `sold_quantity` (default 0)
- `max_per_order`
- `created_at`, `updated_at`

Available quantity = `total_quantity - reserved_quantity - sold_quantity`

4. `bookings`
- `id` (uuid, pk)
- `booking_code` (unique, human-readable)
- `user_id` (fk users)
- `status` (`PENDING_PAYMENT|CONFIRMED|CANCELLED|EXPIRED|FAILED`)
- `subtotal_amount`
- `discount_amount`
- `total_amount`
- `currency`
- `voucher_id` (nullable fk vouchers)
- `payment_due_at`
- `idempotency_key` (unique with user scope)
- `created_at`, `updated_at`

5. `booking_items`
- `id` (uuid, pk)
- `booking_id` (fk bookings)
- `ticket_category_id` (fk ticket_categories)
- `unit_price`
- `quantity`
- `line_total`

6. `vouchers`
- `id` (uuid, pk)
- `code` (unique)
- `type` (`PERCENT|FIXED`)
- `value`
- `max_discount_amount` (nullable)
- `min_order_amount` (nullable)
- `usage_limit_total`
- `usage_limit_per_user`
- `used_count`
- `valid_from`
- `valid_to`
- `status` (`ACTIVE|INACTIVE|EXPIRED`)
- `created_at`, `updated_at`

7. `voucher_redemptions`
- `id` (uuid, pk)
- `voucher_id` (fk vouchers)
- `booking_id` (fk bookings)
- `user_id` (fk users)
- `discount_amount`
- `created_at`

8. `payments`
- `id` (uuid, pk)
- `booking_id` (fk bookings, unique)
- `provider` (stripe/mock/...)
- `provider_ref`
- `status` (`PENDING|SUCCESS|FAILED|REFUNDED`)
- `amount`
- `paid_at` (nullable)
- `created_at`, `updated_at`

9. `audit_logs`
- `id` (bigserial, pk)
- `actor_user_id` (nullable)
- `action`
- `resource_type`
- `resource_id`
- `before_data` (jsonb)
- `after_data` (jsonb)
- `ip_address`
- `created_at`

### 5.2 Important indexes/constraints

- Unique: `users.email`, `vouchers.code`, `bookings.booking_code`
- Partial index for active concerts and active vouchers
- Index: `bookings(user_id, created_at desc)`
- Index: `bookings(status, created_at)`
- Index: `ticket_categories(concert_id)`
- Check constraints for positive price/quantity

## 6. API Endpoints Suggestion

Base prefix: `/api/v1`

### 6.1 Public/customer APIs

- `POST /auth/register`
- `POST /auth/login`
- `GET /concerts` (filter by date/status)
- `GET /concerts/:concertId`
- `GET /concerts/:concertId/ticket-categories`
- `POST /bookings`
  - Headers: `Authorization`, `Idempotency-Key`
  - Body: items + optional voucher code
- `GET /bookings/:bookingId`
- `GET /me/bookings`
- `POST /bookings/:bookingId/cancel`
- `POST /bookings/:bookingId/pay` (or create payment intent)
- `POST /vouchers/validate` (optional pre-check)

### 6.2 Internal operation APIs

- `POST /ops/concerts`
- `PATCH /ops/concerts/:concertId`
- `POST /ops/concerts/:concertId/publish`
- `POST /ops/ticket-categories`
- `PATCH /ops/ticket-categories/:id`
- `GET /ops/bookings` (search/filter)
- `PATCH /ops/bookings/:bookingId/status`
- `POST /ops/vouchers`
- `PATCH /ops/vouchers/:voucherId`
- `GET /ops/vouchers/:voucherId/usage`
- `GET /ops/dashboard/metrics`

### 6.3 System endpoints

- `GET /health/liveness`
- `GET /health/readiness`
- `GET /metrics`

## 7. Booking Flow (Recommended)

1. User selects concert + ticket categories
2. Client sends `POST /bookings` with `Idempotency-Key`
3. Server validates:
- Ticket quantity
- Purchase limits
- Voucher rules
4. Transaction creates pending booking + reserves inventory
5. Return booking with `payment_due_at`
6. Payment success webhook updates booking to `CONFIRMED` and converts reserve -> sold
7. Expiry worker marks unpaid booking as `EXPIRED` and releases reserved quantity

## 8. Dockerfile (Deploy-ready)

- Multi-stage build
- Install production dependencies only in runtime layer
- Run as non-root user
- Expose `3000`

## 9. Docker Compose Suggestion

Services:
- `api` (NestJS)
- `postgres` (persistent volume)
- `redis` (persistent volume)

Includes:
- healthchecks
- dependency ordering
- environment variables
- isolated docker network

## 10. Additional Recommendations (to complete job better)

- Add OpenAPI/Swagger contract and share with frontend early
- Add migration + seed for demo concerts and vouchers
- Add rate limiting (global + sensitive endpoints)
- Add anti-fraud heuristics (same IP/email/device burst)
- Add outbox/event table for reliable async integration
- Add CI pipeline: lint + test + build + image scan
- Add backup policy for PostgreSQL
- Add observability stack (Grafana + Prometheus + Loki)

## 11. Suggested Implementation Milestones

1. Foundation
- Config module, DB, Redis, health check, lint/test setup

2. Core domain
- Concerts, ticket categories, bookings with transaction lock

3. Voucher and idempotency
- Voucher validation and redemption guardrails
- Idempotent booking create

4. Operations dashboard APIs
- Manage concerts, vouchers, booking status

5. Production hardening
- Metrics, tracing, audit logs, rate limits, load tests
