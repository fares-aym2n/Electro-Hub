# E-Commerce RESTful API

A modular, production-ready RESTful API built with **NestJS**, **TypeScript**, **PostgreSQL**, and **TypeORM**. The application powers an e-commerce platform with token-based authentication, email verification, password recovery, role-based authorization (Admin / User), paginated product catalog management with dynamic filters, customer reviews, secure file uploads via Multer, and automated transactional emails.

- **Live API Documentation:** [Swagger UI](https://nest-js-course1.vercel.app/api-docs)
- **Production Base URL:** `https://nest-js-course1.vercel.app`
- **GitHub Repository:** [fares-aym2n/Nest.js-Course](https://github.com/fares-aym2n/Nest.js-Course)

---

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Database & Migrations](#database--migrations)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [Authentication Guide & Examples](#authentication-guide--examples)

---

## Features

### Authentication & Authorization
- **Account Registration & Email Verification:** Cryptographic token-based verification sent via automated email before account activation.
- **JWT Authentication:** Secure stateless session handling via JSON Web Tokens (`@nestjs/jwt`) transmitted via the standard `Bearer` authorization scheme.
- **Role-Based Access Control (RBAC):** Granular access management using custom decorators (`@Roles`) and guards (`AuthRolesGuard`) supporting `admin` and `user` roles.
- **Password Recovery:** Forgot-password workflow generating time-sensitive reset tokens sent via email with dedicated verification and reset endpoints.
- **Password Security:** Salted password hashing with `bcryptjs` (cost factor 10 for registration, 12 for password resets).
- **Profile Management:** Endpoints for authenticated users to view profile details, update credentials, and upload or remove custom profile avatars.

### Products Catalog
- **Pagination & Query Filtering:** Paginated product retrieval (10 items per page) with query parameters for case-insensitive name search (`Like`) and numeric price range filtering (`minPrice`, `maxPrice`).
- **Relational Integrity:** Products are linked to the creating admin and automatically associate with their customer reviews.
- **Admin Management:** Protected routes for creating, updating, and removing products with automatic lowercase name normalization.

### Customer Reviews
- **Ratings & Feedback:** Validated 1 to 5 star ratings and written reviews attached to specific products and authenticated users.
- **Strict Ownership Checks:** Users can only modify or delete their own reviews; administrators have global deletion permissions.
- **Chronological Sorting:** Reviews returned sorted in reverse chronological order (`createdAt DESC`).

### Media Uploads & File Management
- **Multipart Uploads:** Handled using Multer (`@nestjs/platform-express`) with disk storage.
- **Validation:** Strict MIME-type validation (images only) and size constraints (3MB for user avatars, 2MB for general file uploads).
- **Static Asset Serving:** Dedicated streaming endpoints for retrieving user profile avatars and general uploaded media.

### Security & System Resilience
- **HTTP Security Headers:** Protected with `helmet`, configured with custom Content Security Policy (CSP) directives compatible with Swagger UI assets.
- **Rate Limiting:** Guarded by `@nestjs/throttler` (configured for 10 requests per 10-second window) to mitigate brute-force and DoS attacks.
- **DTO Validation:** Global `ValidationPipe` with payload whitelisting (`whitelist: true`, `forbidNonWhitelisted: true`) to reject unauthorized payload fields.
- **Data Serialization:** Automatic exclusion of sensitive fields (e.g., hashed passwords) across API responses via `ClassSerializerInterceptor`.
- **CORS Support:** Configured for cross-origin frontend communication.

---

## Technologies

| Category | Technology |
| --- | --- |
| **Framework** | [NestJS](https://nestjs.com/) v11 |
| **Language** | [TypeScript](https://www.typescriptlang.org/) v6 |
| **Runtime** | [Node.js](https://nodejs.org/) (Express platform) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (Hosted on [Neon](https://neon.tech/)) |
| **ORM** | [TypeORM](https://typeorm.io/) v1.1 |
| **Authentication** | [Passport/JWT](https://jwt.io/) via `@nestjs/jwt`, [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Validation** | `class-validator`, `class-transformer` |
| **File Uploads** | `multer`, `@types/multer` |
| **Mail Service** | `@nestjs-modules/mailer`, `nodemailer`, `ejs` |
| **Security** | `helmet`, `@nestjs/throttler` |
| **API Documentation** | [Swagger / OpenAPI](https://swagger.io/) via `@nestjs/swagger` |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## Project Structure

```
nestjs-course/
├── db/
│   ├── migrations/               # TypeORM schema migrations
│   └── data-source.ts            # TypeORM DataSource configuration
├── images/                       # Uploaded media storage
│   └── users/                    # User profile avatars
├── src/
│   ├── mails/                    # Email notifications module (Nodemailer, EJS)
│   │   ├── templates/            # EJS email templates (verify.ejs, reset-password.ejs)
│   │   ├── mail.module.ts
│   │   └── mail.service.ts
│   ├── products/                 # Product catalog & inventory management
│   │   ├── dto/                  # Create & update product DTOs
│   │   ├── products.controller.ts
│   │   ├── products.entity.ts
│   │   ├── products.module.ts
│   │   └── products.service.ts
│   ├── reviews/                  # Customer reviews & rating system
│   │   ├── dto/                  # Create & update review DTOs
│   │   ├── reviews.controller.ts
│   │   ├── reviews.entity.ts
│   │   ├── reviews.module.ts
│   │   └── reviews.service.ts
│   ├── types/                    # Ambient TypeScript declaration files
│   ├── uploads/                  # File upload controller & media serving
│   │   ├── dto/                  # File upload validation DTOs
│   │   ├── uploads.controller.ts
│   │   └── uploads.module.ts
│   ├── users/                    # Authentication, users & authorization
│   │   ├── decorators/           # Custom decorators (@CurrentUser, @Roles)
│   │   ├── dto/                  # Auth, credentials & profile DTOs
│   │   ├── guards/               # AuthGuard (JWT) & AuthRolesGuard (RBAC)
│   │   ├── auth.service.ts       # Registration, login & password tokens
│   │   ├── users.controller.ts
│   │   ├── users.entity.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── utils/                    # Shared query helpers, constants, interceptors
│   ├── app.controller.ts         # Base application controller (health check)
│   ├── app.module.ts             # Root application module
│   └── main.ts                   # Application bootstrap & middleware configuration
├── test/                         # End-to-end (e2e) test suites
├── vercel.json                   # Vercel serverless deployment config
├── package.json
└── tsconfig.json
```

---

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v18.x or later)
- **npm** (v9.x or later)
- **PostgreSQL** database (Local instance or cloud provider such as [Neon](https://neon.tech/))
- **SMTP Server** credentials (e.g., Gmail App Password, Mailtrap, or SendGrid) for email features

---

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/fares-aym2n/Nest.js-Course.git
   cd Nest.js-Course
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create `.env.development` for local development or `.env` for production:
   ```bash
   cp .env.example .env.development
   ```

---

## Environment Variables

The project utilizes `@nestjs/config` and loads environment files conditionally based on `NODE_ENV`. In non-production environments, it loads `.env.${NODE_ENV}` (e.g., `.env.development`), falling back to `.env` in production.

| Variable | Description | Example / Default |
| --- | --- | --- |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | `development` |
| `PORT` | HTTP server listening port | `3000` |
| `DATA_BASE_URL` | PostgreSQL connection string (Neon or local) | `postgresql://user:password@host/dbname?sslmode=require` |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens | `your_jwt_secret_key` |
| `JWT_EXPIRED` | Expiration time for JWT access tokens | `1d` |
| `BASE_URL` | Base API URL (used for email verification links & Swagger) | `http://localhost:3000` |
| `CLIENT_URL` | Frontend application URL (used for password reset links) | `http://localhost:3001` |
| `SMTP_HOST` | Hostname of the SMTP email server | `smtp.gmail.com` |
| `SMTP_PORT` | Port number of the SMTP server | `587` |
| `SMTP_USERNAME` | SMTP authentication username / email | `your_email@example.com` |
| `SMTP_PASSWORD` | SMTP authentication password or app password | `your_smtp_app_password` |

### Configuration Example (`.env.example`)

```env
NODE_ENV=development
PORT=3000

# Database Connection (Neon / PostgreSQL)
DATA_BASE_URL=postgresql://username:password@ep-example.neon.tech/neondb?sslmode=require

# Authentication
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRED=1d

# URL Configuration
BASE_URL=http://localhost:3000
CLIENT_URL=http://localhost:3001

# SMTP Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@example.com
SMTP_PASSWORD=your_smtp_app_password
```

---

## Database & Migrations

Database entities (`User`, `Product`, `Review`) and schema changes are managed via TypeORM with TypeScript migrations located in `db/migrations/`.

```bash
# Build TypeScript files and run pending database migrations
npm run migration:run

# Generate a new migration based on entity schema changes
npm run migration:generate -- db/migrations/MigrationName

# Revert the most recently executed migration
npm run migration:revert
```

> **Note:** The `TypeORM` CLI script compiles the code into `dist/` before executing the migration runner via `dist/db/data-source.js`.

---

## Running the Application

### Development Mode
Runs the application with Hot Reloading / file watching:
```bash
npm run start:dev
```

### Production Build
Builds the compiled JavaScript into `dist/` and launches the production server:
```bash
# Compile TypeScript to JavaScript
npm run build

# Run production build
npm run start:prod
```

### Code Formatting & Linting
```bash
# Format code with Prettier
npm run format

# Run linter
npx oxlint
```

---

## Testing

The project includes unit tests, DTO validations, controller/service mocks, and end-to-end (E2E) integration tests using Jest and Supertest.

```bash
# Run unit and integration tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:cov

# Run End-to-End (E2E) tests
npm run test:e2e
```

---

## API Documentation

Interactive API documentation is generated via Swagger (OpenAPI 3.0) and served at `/api-docs`. It supports JWT Bearer authentication directly within the browser UI.

- **Local Documentation:** `http://localhost:3000/api-docs`
- **Live Documentation:** [https://nest-js-course1.vercel.app/api-docs](https://nest-js-course1.vercel.app/api-docs)

---

## API Endpoints

### 1. System Health
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Application health check. Returns status message. |

---

### 2. Authentication & User Management (`/api/users`)
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/users/auth/register` | Public | Register new user account and dispatch verification email. |
| `POST` | `/api/users/auth/login` | Public | Authenticate credentials and receive a JWT Bearer token. |
| `GET` | `/api/users/auth/verify-email/:userId/:verificationToken` | Public | Confirm email address via token link. |
| `POST` | `/api/users/forgot-password` | Public | Request a password reset link sent to registered email. |
| `GET` | `/api/users/reset-password/:userId/:resetPasswordToken` | Public | Verify the validity of a password reset token. |
| `POST` | `/api/users/reset-password` | Public | Submit new password using verified reset token. |
| `GET` | `/api/users/me` | Authenticated | Retrieve current user profile (password excluded). |
| `PATCH` | `/api/users/me` | Authenticated | Update current user username or password. |
| `GET` | `/api/users/me/profile-image` | Authenticated | Stream current user's profile avatar image. |
| `POST` | `/api/users/me/upload_image` | Authenticated | Upload or replace user profile image (`multipart/form-data`). |
| `DELETE` | `/api/users/me/profile-image` | Authenticated | Delete current user's avatar image from storage. |
| `GET` | `/api/users` | Admin | Retrieve all registered users. |
| `DELETE` | `/api/users/:id` | Authenticated | Delete user account (allowed for account owner or Admin). |

---

### 3. Product Catalog (`/api/products`)
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/products` | Public | Get paginated products with optional filters (`page`, `name`, `minPrice`, `maxPrice`). |
| `GET` | `/api/products/:id` | Public | Retrieve detailed product information including user and reviews. |
| `POST` | `/api/products` | Admin | Create a new product. |
| `PATCH` | `/api/products/:id` | Admin | Update product fields (`name`, `description`, `price`). |
| `DELETE` | `/api/products/:id` | Admin | Remove product from catalog (HTTP 204). |

---

### 4. Product Reviews (`/api/reviews`)
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/reviews` | Public | Retrieve all reviews sorted descending by creation date. |
| `GET` | `/api/reviews/:id` | Public | Retrieve a specific review by ID with reviewer details. |
| `POST` | `/api/reviews/:id` | Authenticated | Add a review and rating (1–5) for product specified by `:id`. |
| `PATCH` | `/api/reviews/:id` | Authenticated | Update review text or rating (Review owner only). |
| `DELETE` | `/api/reviews/:id` | Authenticated | Delete review (Review owner or Admin, HTTP 204). |

---

### 5. Media Uploads (`/api/uploads`)
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/uploads/single-file` | Public | Upload a single image file (Max 2MB). |
| `POST` | `/api/uploads/multiple-file` | Public | Upload multiple image files (Max 2MB each). |
| `GET` | `/api/uploads/:image` | Public | Stream uploaded image file by filename. |

---

## Authentication Guide & Examples

### 1. User Registration
Send a POST request to register a new account. An email verification link will be dispatched automatically.

```bash
curl -X POST http://localhost:3000/api/users/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

**Response:**
```json
{
  "message": "Verification emali is send .Please verify your email and login."
}
```

---

### 2. User Login
Authenticate with verified credentials to receive a JWT access token:

```bash
curl -X POST http://localhost:3000/api/users/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Accessing Protected Endpoints
Attach the access token in the `Authorization` header as a Bearer token:

```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "isEmailValidation": true,
  "profile_image": null,
  "createdAt": "2026-10-10T12:00:00.000Z",
  "updatedAt": "2026-10-10T12:00:00.000Z"
}
```

---

### 4. Creating a Product (Admin Only)
Only users with the `admin` role can perform product management actions:

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Noise-Canceling Headphones",
    "description": "High-fidelity audio headphones with active noise cancellation.",
    "price": 199.99
  }'
```

---

### 5. Filtering and Paginating Products
Filter products using URL query parameters:

```bash
curl -X GET "http://localhost:3000/api/products?page=1&name=headphones&minPrice=100&maxPrice=300"
```

**Response:**
```json
{
  "results": 1,
  "products": [
    {
      "id": 1,
      "name": "wireless noise-canceling headphones",
      "description": "High-fidelity audio headphones with active noise cancellation.",
      "price": 199.99,
      "createdAt": "2026-10-10T12:00:00.000Z",
      "updatedAt": "2026-10-10T12:00:00.000Z"
    }
  ]
}
```

---

### 6. Uploading a Profile Image
Upload a custom profile image as `multipart/form-data`:

```bash
curl -X POST http://localhost:3000/api/users/me/upload_image \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -F "profile_image=@/path/to/avatar.jpg"
```

---

## License

This project is open-source and available under the terms specified in the project repository.
