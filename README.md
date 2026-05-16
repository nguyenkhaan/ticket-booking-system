# Concert Ticket Booking Backend

--- 
## Techstack: 
![NestJS](https://img.shields.io/badge/NestJS-framework-E0234E?style=for-the-badge\&logo=nestjs\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-language-007ACC?style=for-the-badge\&logo=typescript\&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-3982CE?style=for-the-badge\&logo=prisma\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-316192?style=for-the-badge\&logo=postgresql\&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-runtime-F9F1E1?style=for-the-badge\&logo=bun\&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-container-2496ED?style=for-the-badge\&logo=docker\&logoColor=white)

---

## 1. Project Overview

This project is a NestJS backend for a concert ticket booking platform. It supports customer workflows for browsing concerts, booking tickets, applying vouchers, and checking payment or booking status. It also supports internal operation workflows for managing concerts, ticket categories, vouchers, users, bookings, and audit logs.

The service is implemented as a modular monolith. This design keeps the project simple to run and review while preserving clear module boundaries. PostgreSQL is the source of truth. Prisma is used for database access and migrations. JWT and role-based guards protect internal APIs.

Main modules:

- `auth`: registration, login, JWT generation
- `users`: user management
- `concert`: concert management and public concert browsing
- `ticket`: ticket category and inventory management
- `bookings`: booking creation, lookup, cancellation, confirmation
- `voucher`: voucher creation, validation, usage reporting
- `payments`: payment record creation and mock webhook updates
- `audit-log`: audit log lookup
- `health`: liveness and readiness checks

Swagger API documentation is available at `http://localhost:4000/api/docs` when the server is not running in production mode.

## 2. Local Setup

### Requirements

- Bun: https://bun.com/get
- Node.js compatible with NestJS 11
- Docker and Docker Compose
- PostgreSQL, if not using Docker Compose

### Environment

Copy `.env.example` to `.env` and adjust values if needed.

Required variables:

```env
PORT=4000
DATABASE_URL="postgresql://booking_user:booking_password@localhost:5432/booking_db?schema=public"
JWT_SECRET=super-secret-key
JWT_EXPIRES_IN=1d
```

### Install Dependencies

```bash
bun install
```

The repository also contains `package-lock.json`, but Bun is the intended runtime for local development.

### Start Database
- Database running on Docker. Firstly, install Docker and running Docker service on your machine. 
- Provide `docker-compose.yaml` to initial services: 

```bash
docker compose up -d postgres redis
```

### Run Migration and Seed

```bash
bun prisma db push # Migrate database schema
bun prisma generate # Generating prisma client for source code 
bun prisma db seed # Seeding data, including admin account, operator account and customer account 
```

Users's seeding account: 

- `admin@booking-system.com`
- `operator@booking-system.com`
- `customer@booking-system.com`

Default password: `password123`

### Start Application

```bash
bun run dev
```

Default URLs:

- API base URL: `http://localhost:4000/api`
- Swagger: `http://localhost:4000/api/docs`
- Health: `http://localhost:4000/api/health/liveness`

## 3. API Testing

Use Swagger for interactive API documentation. A Postman collection is also provided at `docs/postman_collection.json`.

Suggested test flow:

1. Login with a seed user.
2. Copy the returned access token.
3. Authorize Swagger or Postman with `Bearer <token>`.
4. Browse concerts and ticket categories.
5. Create a booking.
6. Create a payment for the booking.
7. Confirm payment through the mock payment webhook.

## 4. Coding Guidelines and Conventions

### Guide for Developing a New API

- Keep each domain inside its module under `src/modules/<module-name>`.
- Put request DTOs in `dto` folders and validate them with `class-validator`.
- Use `@ApiProperty` and `@ApiOperation` so Swagger stays useful.
- Access the database through `PrismaService`; do not create new Prisma clients inside modules.
- Use service classes for business logic. Controllers should only parse request data and call services.
- Protect customer APIs with JWT unless explicitly public.
- Protect operation APIs with `@Roles(UserRole.OPERATOR, UserRole.ADMIN)` or `@Roles(UserRole.ADMIN)`.
- Use database transactions for multi-step writes that must remain consistent.
- Return clear NestJS exceptions such as `BadRequestException`, `ConflictException`, and `NotFoundException`.
- Keep naming consistent with existing modules: controller, service, module, and DTO files.

**Detail**: 

1. Create or select a module under `src/modules`.
2. Add request DTOs in `dto/<name>.dto.ts`.
3. Add controller routes with Swagger decorators.
4. Put business rules in the service.
5. Use `PrismaService` for persistence.
6. Add role decorators for operation-only endpoints.
7. Add or update Prisma models if the API needs new tables.
8. Generate and apply a migration.
9. Add focused unit tests for the service.
10. Verify endpoint behavior in Swagger or Postman.

### Run unit tests

This project uses Jest through NestJS testing utilities.

Run all unit tests:

```bash
bun run test
```

Run tests in watch mode:

```bash
bun run test:watch
```

Run coverage:

```bash
bun run test:cov
```

Test conventions:

- Place unit tests beside source files with the suffix `.spec.ts`.
- Mock `PrismaService` for service unit tests.
- Test business behavior, not Prisma internals.
- Cover success paths and important failure paths.
- Use e2e tests only when request pipeline behavior matters.


Example structure:

```txt
src/modules/example/
  dto/example.dto.ts
  example.controller.ts
  example.service.ts
  example.module.ts
  example.service.spec.ts
```

## 5. Useful Commands

```bash
bun run dev
bun run build
bun run test
bun prisma migrate dev
bun prisma studio
```

