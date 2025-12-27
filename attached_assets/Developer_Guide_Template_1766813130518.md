# Developer Guide & Technical Specification

## Document Control
- **Product Name:** [Product Name]
- **Version:** [Version Number]
- **Date:** [Date]
- **Lead Architect:** [Name]
- **Status:** [Draft | In Review | Approved | Active]
- **Last Updated:** [Date]

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Development Environment Setup](#4-development-environment-setup)
5. [Database Schema](#5-database-schema)
6. [API Specifications](#6-api-specifications)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Backend Architecture](#8-backend-architecture)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Third-Party Integrations](#10-third-party-integrations)
11. [Security](#11-security)
12. [Performance & Optimization](#12-performance--optimization)
13. [Testing Strategy](#13-testing-strategy)
14. [Deployment & DevOps](#14-deployment--devops)
15. [Monitoring & Logging](#15-monitoring--logging)
16. [Error Handling](#16-error-handling)
17. [Code Standards & Best Practices](#17-code-standards--best-practices)
18. [Development Workflow](#18-development-workflow)
19. [Troubleshooting](#19-troubleshooting)
20. [Appendices](#20-appendices)

---

## 1. System Overview

### 1.1 Product Description
[Brief description of what the system does and its main purpose]

### 1.2 System Architecture Diagram
```
[Insert high-level architecture diagram]
Example:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Load Bal.  │────▶│  API Server │
│  (Browser)  │     │   (NGINX)   │     │  (Node.js)  │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Database   │
                                        │ (PostgreSQL)│
                                        └─────────────┘
```

### 1.3 Key Components
- **Frontend:** [e.g., React SPA]
- **Backend API:** [e.g., Node.js/Express REST API]
- **Database:** [e.g., PostgreSQL]
- **Cache:** [e.g., Redis]
- **File Storage:** [e.g., AWS S3]
- **Queue:** [e.g., RabbitMQ/SQS]

### 1.4 Technical Requirements
- **Scalability:** Support [X] concurrent users
- **Performance:** API response time < [X]ms
- **Availability:** 99.9% uptime SLA
- **Security:** SOC 2, GDPR compliant

---

## 2. Architecture

### 2.1 Overall Architecture Pattern
**Pattern:** [e.g., Microservices, Monolith, Serverless]

**Rationale:** [Why this pattern was chosen]

### 2.2 System Components

#### 2.2.1 Frontend Layer
- **Technology:** [React, Vue, Angular]
- **Hosting:** [Vercel, Netlify, CloudFront + S3]
- **Responsibilities:**
  - User interface rendering
  - Client-side routing
  - State management
  - API communication

#### 2.2.2 API Gateway Layer
- **Technology:** [NGINX, AWS API Gateway]
- **Responsibilities:**
  - Request routing
  - Rate limiting
  - Authentication
  - Load balancing

#### 2.2.3 Application Layer
- **Technology:** [Node.js, Python, Java]
- **Responsibilities:**
  - Business logic
  - Data validation
  - Authentication/Authorization
  - Integration with external services

#### 2.2.4 Data Layer
- **Primary Database:** [PostgreSQL, MongoDB]
- **Cache:** [Redis, Memcached]
- **Search Engine:** [Elasticsearch] (if applicable)
- **Responsibilities:**
  - Data persistence
  - Query optimization
  - Data integrity

#### 2.2.5 Background Jobs Layer
- **Technology:** [Bull, Celery, Sidekiq]
- **Responsibilities:**
  - Async task processing
  - Scheduled jobs
  - Email sending
  - Report generation

### 2.3 Data Flow Diagram
```
User Request → API Gateway → Auth Middleware → Controller → Service → Repository → Database
                                                   │
                                                   ├─→ Cache Check
                                                   ├─→ External API
                                                   └─→ Queue Job
```

### 2.4 Scalability Strategy
- **Horizontal Scaling:** [How services scale out]
- **Vertical Scaling:** [When to scale up]
- **Database Sharding:** [Strategy if applicable]
- **Caching Strategy:** [What to cache, invalidation strategy]
- **CDN Usage:** [Static assets, edge caching]

---

## 3. Technology Stack

### 3.1 Frontend

#### Core Framework
- **Framework:** [React 18.x / Vue 3.x / Angular 15.x]
- **Language:** TypeScript 5.x
- **Build Tool:** [Vite / Webpack / Next.js]
- **Package Manager:** npm / yarn / pnpm

#### UI Libraries
- **Component Library:** [Material-UI / Ant Design / Chakra UI / Custom]
- **Styling:** [Tailwind CSS / Styled Components / CSS Modules]
- **Icons:** [React Icons / Font Awesome / Custom]
- **Forms:** [React Hook Form / Formik]
- **Validation:** [Yup / Zod / Joi]

#### State Management
- **Global State:** [Redux Toolkit / Zustand / Jotai / Context API]
- **Server State:** [React Query / SWR / Apollo Client]
- **Form State:** [React Hook Form]

#### Routing
- **Router:** [React Router / Next.js routing / Vue Router]

#### Testing
- **Unit Tests:** [Jest / Vitest]
- **Component Tests:** [React Testing Library / Vue Testing Library]
- **E2E Tests:** [Playwright / Cypress]

#### Other Tools
- **API Client:** [Axios / Fetch API]
- **Date Handling:** [date-fns / Day.js]
- **Charts:** [Recharts / Chart.js / D3.js]
- **File Upload:** [react-dropzone]

### 3.2 Backend

#### Core Framework
- **Runtime:** [Node.js 18.x / Python 3.11 / Java 17]
- **Framework:** [Express.js / NestJS / FastAPI / Spring Boot]
- **Language:** [TypeScript / Python / Java]

#### Database
- **Primary DB:** [PostgreSQL 15.x / MongoDB 6.x / MySQL 8.x]
- **ORM/ODM:** [Prisma / TypeORM / Mongoose / SQLAlchemy / Hibernate]
- **Migrations:** [Built into ORM / Flyway / Liquibase]

#### Cache
- **Technology:** Redis 7.x
- **Client:** [ioredis / redis-py]

#### Authentication
- **Strategy:** [JWT / Session-based / OAuth 2.0]
- **Libraries:** [Passport.js / NextAuth / Auth0 SDK]

#### API Documentation
- **Tool:** [Swagger/OpenAPI / Postman]
- **Auto-generation:** [From code annotations]

#### Background Jobs
- **Queue:** [Bull / BullMQ / Celery / RabbitMQ]
- **Scheduler:** [node-cron / APScheduler]

#### File Storage
- **Provider:** [AWS S3 / Google Cloud Storage / Azure Blob]
- **SDK:** [AWS SDK / @google-cloud/storage]

#### Email
- **Service:** [SendGrid / AWS SES / Mailgun]
- **Templates:** [Handlebars / Pug / React Email]

#### Testing
- **Unit Tests:** [Jest / pytest / JUnit]
- **Integration Tests:** [Supertest / pytest / REST Assured]
- **Mocking:** [jest.mock / unittest.mock]

### 3.3 DevOps & Infrastructure

#### Cloud Provider
- **Provider:** [AWS / Google Cloud / Azure / DigitalOcean]

#### Containerization
- **Container:** Docker
- **Orchestration:** [Kubernetes / ECS / Docker Compose]

#### CI/CD
- **Platform:** [GitHub Actions / GitLab CI / Jenkins / CircleCI]
- **Deployment:** [AWS CodeDeploy / Vercel / Netlify]

#### Infrastructure as Code
- **Tool:** [Terraform / CloudFormation / Pulumi]

#### Monitoring
- **APM:** [New Relic / Datadog / Application Insights]
- **Logging:** [ELK Stack / CloudWatch / Papertrail]
- **Error Tracking:** [Sentry / Rollbar / Bugsnag]

### 3.4 Development Tools

#### Version Control
- **System:** Git
- **Platform:** [GitHub / GitLab / Bitbucket]

#### Code Quality
- **Linting:** [ESLint / Pylint / Checkstyle]
- **Formatting:** [Prettier / Black / google-java-format]
- **Static Analysis:** [SonarQube / CodeQL]

#### IDEs
- **Recommended:** [VS Code / IntelliJ IDEA / PyCharm]
- **Extensions:** [List recommended extensions]

#### Collaboration
- **Documentation:** [Notion / Confluence]
- **Design:** [Figma / Sketch]
- **Project Management:** [Jira / Linear / GitHub Projects]

---

## 4. Development Environment Setup

### 4.1 Prerequisites

#### Required Software
- **Node.js:** v18.x or higher
- **npm/yarn:** Latest stable version
- **Git:** v2.x or higher
- **Docker:** v20.x or higher (optional but recommended)
- **PostgreSQL:** v15.x (if running locally)
- **Redis:** v7.x (if running locally)

#### Optional Tools
- **Postman:** For API testing
- **VS Code:** Recommended IDE
- **TablePlus/pgAdmin:** Database GUI tools

### 4.2 Initial Setup

#### 1. Clone Repository
```bash
git clone https://github.com/[organization]/[repo-name].git
cd [repo-name]
```

#### 2. Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

#### 3. Environment Variables

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:3000/api
VITE_ENVIRONMENT=development
VITE_SENTRY_DSN=
VITE_GOOGLE_CLIENT_ID=
```

**Backend (.env):**
```env
# Server
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dbname
DB_USER=user
DB_PASSWORD=password

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
SESSION_SECRET=your-session-secret

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=

# Email
SENDGRID_API_KEY=
FROM_EMAIL=noreply@example.com

# External APIs
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Monitoring
SENTRY_DSN=
```

#### 4. Database Setup
```bash
# Create database
createdb [dbname]

# Run migrations
npm run migrate

# Seed database (optional)
npm run seed
```

#### 5. Start Development Servers

**Using Docker Compose (Recommended):**
```bash
docker-compose up
```

**Manual Start:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Redis (if not using Docker)
redis-server

# Terminal 4 - Background Workers (if applicable)
cd backend
npm run worker
```

### 4.3 Verification

After setup, verify everything is working:

1. **Frontend:** Navigate to `http://localhost:5173` (or configured port)
2. **Backend API:** `http://localhost:3000/api/health`
3. **API Docs:** `http://localhost:3000/api/docs`

### 4.4 Common Setup Issues

#### Issue: Database connection error
**Solution:** Check DATABASE_URL is correct and PostgreSQL is running

#### Issue: Redis connection error
**Solution:** Ensure Redis server is running: `redis-cli ping`

#### Issue: Port already in use
**Solution:** Change PORT in .env or kill process using port

---

## 5. Database Schema

### 5.1 Database Design Philosophy
- **Normalization Level:** [3NF / Denormalized for performance]
- **Naming Convention:** [snake_case / camelCase]
- **Soft Deletes:** [Yes/No - using deleted_at column]
- **Timestamps:** All tables include created_at and updated_at

### 5.2 Entity Relationship Diagram (ERD)
```
[Insert ERD diagram here - can use tools like dbdiagram.io, draw.io]
```

### 5.3 Table Schemas

#### Table: users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_picture_url TEXT,
    role VARCHAR(50) DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Relationships:**
- One-to-Many with `sessions`
- One-to-Many with `user_profiles`
- One-to-Many with `subscriptions`

**Constraints:**
- Email must be unique
- Email must be valid format
- Password hash required unless OAuth user

**Notes:**
- Passwords hashed using bcrypt (12 rounds)
- Soft deletes using deleted_at column
- UUID for better security than auto-increment

---

#### Table: user_profiles
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    phone VARCHAR(20),
    date_of_birth DATE,
    timezone VARCHAR(50),
    language VARCHAR(10) DEFAULT 'en',
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

**Relationships:**
- Belongs to `users`

---

#### Table: sessions
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    refresh_token VARCHAR(500),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

**Relationships:**
- Belongs to `users`

**Notes:**
- Tokens are JWT
- Clean up expired sessions daily
- Store IP and user agent for security

---

#### Table: oauth_accounts
```sql
CREATE TABLE oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    token_type VARCHAR(50),
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, provider_account_id)
);

CREATE INDEX idx_oauth_user_id ON oauth_accounts(user_id);
CREATE INDEX idx_oauth_provider ON oauth_accounts(provider);
```

**Relationships:**
- Belongs to `users`

**Notes:**
- Supports multiple OAuth providers (Google, GitHub, etc.)
- Tokens encrypted at rest

---

#### [Additional Tables]
[Repeat the same detailed structure for all tables in your database]

Example additional tables:
- `subscriptions`
- `payments`
- `products`
- `orders`
- `notifications`
- `audit_logs`
- `api_keys`
- etc.

---

### 5.4 Indexes Strategy

#### Performance Indexes
- All foreign keys have indexes
- Frequently queried columns have indexes
- Composite indexes for common query patterns

#### Example Composite Index:
```sql
CREATE INDEX idx_users_email_active ON users(email, is_active) 
WHERE deleted_at IS NULL;
```

### 5.5 Migrations

#### Migration Naming Convention
```
YYYYMMDDHHMMSS_descriptive_name.sql
Example: 20240115120000_create_users_table.sql
```

#### Migration Commands
```bash
# Create new migration
npm run migration:create -- --name=create_users_table

# Run migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Reset database (DANGER!)
npm run migrate:reset
```

### 5.6 Seeding

#### Seed Data Types
- Development: Realistic test data
- Staging: Subset of production data
- Production: Essential data only (roles, settings)

#### Seed Commands
```bash
# Run all seeders
npm run seed

# Run specific seeder
npm run seed -- --name=users

# Clear and re-seed
npm run seed:refresh
```

---

## 6. API Specifications

### 6.1 API Overview

#### Base URL
- **Development:** `http://localhost:3000/api/v1`
- **Staging:** `https://staging-api.example.com/api/v1`
- **Production:** `https://api.example.com/api/v1`

#### API Version
- Current Version: `v1`
- Versioning Strategy: URL path versioning
- Deprecation Policy: 6 months notice before removal

#### API Documentation
- **Interactive Docs:** [Swagger UI URL]
- **API Reference:** [Link to docs]

### 6.2 Authentication

#### Authentication Flow
```
1. User sends credentials to /auth/login
2. Server validates and returns JWT
3. Client stores JWT in localStorage/cookie
4. Client sends JWT in Authorization header
5. Server validates JWT on each request
```

#### Authentication Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### 6.3 API Endpoints

#### Authentication & User Management

##### POST /auth/register
**Description:** Register a new user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Validation Rules:**
- Email: Valid email format, unique
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- First/Last Name: 2-50 characters

**Error Responses:**
```json
// 400 Bad Request - Invalid input
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email already exists"
      }
    ]
  }
}

// 500 Internal Server Error
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

##### POST /auth/login
**Description:** Authenticate user and receive tokens

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

**Error Responses:**
```json
// 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}

// 429 Too Many Requests
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many login attempts. Please try again in 15 minutes"
  }
}
```

---

##### POST /auth/refresh
**Description:** Refresh access token using refresh token

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

---

##### POST /auth/logout
**Description:** Invalidate current session

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

##### GET /auth/me
**Description:** Get current authenticated user

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "profilePicture": "https://cdn.example.com/avatars/user123.jpg",
    "emailVerified": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

##### POST /auth/forgot-password
**Description:** Request password reset email

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent if account exists"
}
```

**Note:** Always return success to prevent email enumeration

---

##### POST /auth/reset-password
**Description:** Reset password with token

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecureP@ss123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

#### [Additional API Sections]

Create similar detailed documentation for:
- User Profile Management (GET, PATCH /users/:id)
- Resource Management (CRUD operations)
- File Uploads
- Search & Filtering
- Payments
- Notifications
- Admin endpoints
- etc.

---

### 6.4 Request/Response Standards

#### Standard Request Format
```json
{
  "data": {
    // Request payload
  },
  "meta": {
    "requestId": "req_123456",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### Standard Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "requestId": "req_123456",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": [
      {
        "field": "fieldName",
        "message": "Field-specific error"
      }
    ]
  },
  "meta": {
    "requestId": "req_123456",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "requestId": "req_123456",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 6.5 Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 400 | BAD_REQUEST | Malformed request |
| 401 | UNAUTHORIZED | Authentication required |
| 401 | INVALID_TOKEN | Invalid or expired token |
| 401 | INVALID_CREDENTIALS | Wrong email/password |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 409 | DUPLICATE_ENTRY | Duplicate unique field |
| 422 | UNPROCESSABLE_ENTITY | Semantic errors |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily down |

### 6.6 Rate Limiting

**Limits:**
- **Anonymous:** 100 requests/hour
- **Authenticated:** 1000 requests/hour
- **Premium:** 5000 requests/hour

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642252800
```

**Rate Limit Exceeded Response:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 3600 seconds"
  },
  "retryAfter": 3600
}
```

### 6.7 Pagination

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (default: createdAt)
- `order`: Sort order (asc/desc, default: desc)

**Example Request:**
```
GET /api/v1/users?page=2&limit=20&sort=createdAt&order=desc
```

### 6.8 Filtering & Search

**Query Parameters:**
- `search`: Full-text search query
- `filter[field]`: Filter by field value
- `dateFrom`: Start date for date range
- `dateTo`: End date for date range

**Example Request:**
```
GET /api/v1/products?search=laptop&filter[category]=electronics&filter[inStock]=true&priceMin=500&priceMax=2000
```

---

## 7. Frontend Architecture

### 7.1 Folder Structure
```
frontend/
├── public/
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── api/              # API client and endpoints
│   │   ├── client.ts     # Axios instance
│   │   ├── auth.api.ts
│   │   ├── users.api.ts
│   │   └── index.ts
│   ├── assets/           # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── components/       # Reusable components
│   │   ├── common/       # Generic components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   └── index.ts
│   │   ├── layout/       # Layout components
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Sidebar/
│   │   │   └── index.ts
│   │   └── features/     # Feature-specific components
│   │       ├── auth/
│   │       └── dashboard/
│   ├── config/           # Configuration files
│   │   ├── constants.ts
│   │   ├── env.ts
│   │   └── routes.ts
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/            # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── useDebounce.ts
│   ├── layouts/          # Page layouts
│   │   ├── MainLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── DashboardLayout.tsx
│   ├── pages/            # Page components
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   └── NotFound/
│   ├── routes/           # Routing configuration
│   │   ├── AppRoutes.tsx
│   │   ├── PrivateRoute.tsx
│   │   └── PublicRoute.tsx
│   ├── services/         # Business logic services
│   │   ├── auth.service.ts
│   │   └── storage.service.ts
│   ├── store/            # State management
│   │   ├── slices/       # Redux slices
│   │   │   ├── authSlice.ts
│   │   │   └── uiSlice.ts
│   │   └── store.ts
│   ├── styles/           # Global styles
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── theme.ts
│   ├── types/            # TypeScript types
│   │   ├── api.types.ts
│   │   ├── user.types.ts
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── .env.local
├── .eslintrc.js
├── .prettierrc
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 7.2 Component Structure

#### Component Template
```typescript
// ComponentName.tsx
import React from 'react';
import styles from './ComponentName.module.css';

interface ComponentNameProps {
  prop1: string;
  prop2?: number;
  onAction?: () => void;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  prop1,
  prop2 = 0,
  onAction
}) => {
  // Hooks
  const [state, setState] = React.useState<string>('');
  
  // Effects
  React.useEffect(() => {
    // Effect logic
  }, []);
  
  // Handlers
  const handleClick = () => {
    onAction?.();
  };
  
  // Render
  return (
    <div className={styles.container}>
      <h1>{prop1}</h1>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
};
```

### 7.3 State Management

#### Redux Store Structure
```typescript
// store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### Slice Example
```typescript
// store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
```

### 7.4 API Integration

#### API Client Setup
```typescript
// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', response.data.accessToken);
        
        // Retry original request
        error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return axios(error.config);
      } catch (refreshError) {
        // Logout user
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

#### API Endpoint Example
```typescript
// api/auth.api.ts
import apiClient from './client';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types';

export const authApi = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    apiClient.post('/auth/login', data),
  
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    apiClient.post('/auth/register', data),
  
  logout: (): Promise<void> =>
    apiClient.post('/auth/logout'),
  
  getCurrentUser: (): Promise<User> =>
    apiClient.get('/auth/me'),
  
  refreshToken: (refreshToken: string): Promise<{ accessToken: string }> =>
    apiClient.post('/auth/refresh', { refreshToken }),
};
```

### 7.5 Routing

#### Route Configuration
```typescript
// routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Private routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};
```

---

## 8. Backend Architecture

### 8.1 Folder Structure
```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── email.ts
│   │   └── index.ts
│   ├── controllers/         # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   └── index.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   └── index.ts
│   ├── models/              # Database models
│   │   ├── User.model.ts
│   │   ├── Session.model.ts
│   │   └── index.ts
│   ├── routes/              # API routes
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── index.ts
│   │   └── v1/
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   ├── email.service.ts
│   │   ├── storage.service.ts
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── logger.ts
│   │   ├── validators.ts
│   │   ├── helpers.ts
│   │   └── index.ts
│   ├── types/               # TypeScript types
│   │   ├── express.d.ts
│   │   ├── api.types.ts
│   │   └── index.ts
│   ├── jobs/                # Background jobs
│   │   ├── email.job.ts
│   │   └── cleanup.job.ts
│   ├── database/            # Database related
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── index.ts
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .env
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
├── tsconfig.json
├── package.json
└── README.md
```

### 8.2 Application Setup

#### Server Entry Point
```typescript
// src/server.ts
import app from './app';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Connect to Redis
    await connectRedis();
    logger.info('Redis connected successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});
```

#### Express App Configuration
```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
```

### 8.3 Controller Pattern

#### Controller Example
```typescript
// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
      });
      
      return ApiResponse.success(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      
      const result = await authService.login(email, password);
      
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const token = req.token;
      
      await authService.logout(userId, token);
      
      return ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      
      const user = await authService.getUserById(userId);
      
      return ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
```

### 8.4 Service Layer

#### Service Example
```typescript
// src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { Session } from '../models/Session.model';
import { AppError } from '../utils/appError';
import { emailService } from './email.service';

class AuthService {
  async register(data: RegisterData) {
    // Check if user exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError('Email already exists', 409, 'DUPLICATE_ENTRY');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await User.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user);

    // Create session
    await Session.create({
      userId: user.id,
      token: accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.firstName);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user);

    // Create session
    await Session.create({
      userId: user.id,
      token: accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Update last login
    await User.update({ id: user.id }, { lastLoginAt: new Date() });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string, token: string) {
    await Session.delete({ userId, token });
  }

  private generateTokens(user: User) {
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  async getUserById(id: string) {
    const user = await User.findOne({ id });
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    return this.sanitizeUser(user);
  }
}

export const authService = new AuthService();
```

### 8.5 Middleware

#### Authentication Middleware
```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError';
import { Session } from '../models/Session.model';

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Extract token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Check if session exists
    const session = await Session.findOne({ token, userId: decoded.userId });
    if (!session) {
      throw new AppError('Invalid session', 401, 'INVALID_TOKEN');
    }

    // Check if session expired
    if (session.expiresAt < new Date()) {
      await Session.delete({ id: session.id });
      throw new AppError('Session expired', 401, 'INVALID_TOKEN');
    }

    // Attach user to request
    req.user = { id: decoded.userId, email: decoded.email, role: decoded.role };
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
    } else {
      next(error);
    }
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
    }

    next();
  };
}
```

---

## 9. Authentication & Authorization

### 9.1 Authentication Flow

```
1. User submits credentials → POST /auth/login
2. Server validates credentials
3. Server generates JWT access token (1h expiry)
4. Server generates refresh token (7d expiry)
5. Server stores session in database
6. Server returns tokens to client
7. Client stores tokens (access in memory, refresh in httpOnly cookie)
8. Client includes access token in Authorization header
9. Server validates token on each request
10. When access token expires, client uses refresh token
```

### 9.2 JWT Structure

```typescript
// Access Token Payload
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "role": "user",
  "iat": 1642252800,
  "exp": 1642256400
}

// Refresh Token Payload
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "iat": 1642252800,
  "exp": 1642857600
}
```

### 9.3 Role-Based Access Control (RBAC)

#### Roles
- `admin`: Full system access
- `manager`: Access to team and content management
- `user`: Basic authenticated user access
- `guest`: Limited read-only access

#### Permissions Matrix

| Resource | Admin | Manager | User | Guest |
|----------|-------|---------|------|-------|
| Users - Read All | ✓ | ✓ | ✗ | ✗ |
| Users - Read Own | ✓ | ✓ | ✓ | ✗ |
| Users - Create | ✓ | ✗ | ✗ | ✗ |
| Users - Update | ✓ | Own Team | Own | ✗ |
| Users - Delete | ✓ | ✗ | ✗ | ✗ |
| Content - Read | ✓ | ✓ | ✓ | ✓ |
| Content - Create | ✓ | ✓ | ✓ | ✗ |
| Content - Update | ✓ | ✓ | Own | ✗ |
| Content - Delete | ✓ | ✓ | Own | ✗ |

---

## 10. Third-Party Integrations

### 10.1 Payment Processing (Stripe)

#### Setup
```bash
npm install stripe
```

#### Configuration
```typescript
// src/config/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});
```

#### Create Payment Intent
```typescript
// src/services/payment.service.ts
import { stripe } from '../config/stripe';

export async function createPaymentIntent(amount: number, currency: string = 'usd') {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
}
```

#### Webhook Handler
```typescript
// src/controllers/webhook.controller.ts
import { Request, Response } from 'express';
import { stripe } from '../config/stripe';

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature']!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
}
```

### 10.2 Email Service (SendGrid)

#### Setup & Configuration
```typescript
// src/services/email.service.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

class EmailService {
  async sendEmail({ to, subject, html }: EmailData) {
    const msg = {
      to,
      from: process.env.FROM_EMAIL!,
      subject,
      html,
    };

    try {
      await sgMail.send(msg);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    const html = `
      <h1>Welcome ${firstName}!</h1>
      <p>Thank you for joining our platform.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to Our Platform',
      html,
    });
  }
}

export const emailService = new EmailService();
```

### 10.3 File Storage (AWS S3)

#### Setup
```typescript
// src/config/s3.ts
import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
```

#### Upload File
```typescript
// src/services/storage.service.ts
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/s3';
import { v4 as uuidv4 } from 'uuid';

export async function uploadFile(file: Express.Multer.File) {
  const key = `uploads/${uuidv4()}-${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  
  return { key, url };
}
```

---

## 11. Security

### 11.1 Security Checklist

- [ ] HTTPS/TLS encryption in production
- [ ] JWT tokens with short expiration
- [ ] Password hashing with bcrypt (12+ rounds)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (content sanitization)
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Helmet.js security headers
- [ ] CORS configuration
- [ ] Environment variables for secrets
- [ ] Regular dependency updates
- [ ] Security audits (npm audit)

### 11.2 Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)

### 11.3 Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

---

## 12. Performance & Optimization

### 12.1 Database Optimization

- Use indexes on frequently queried columns
- Implement query caching with Redis
- Use database connection pooling
- Optimize N+1 queries
- Use pagination for large datasets
- Implement database read replicas

### 12.2 API Optimization

- Implement response caching
- Use compression (gzip)
- Optimize payload sizes
- Implement field selection
- Use CDN for static assets

### 12.3 Frontend Optimization

- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- Service workers for offline support
- Memoization of expensive computations

---

## 13. Testing Strategy

### 13.1 Test Types

**Unit Tests:**
- Individual functions and methods
- Coverage target: 80%
- Tool: Jest/Vitest

**Integration Tests:**
- API endpoints
- Database operations
- Tool: Supertest

**E2E Tests:**
- User flows
- Critical paths
- Tool: Playwright/Cypress

### 13.2 Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

---

## 14. Deployment & DevOps

### 14.1 Deployment Environments

- **Development:** Local development
- **Staging:** Pre-production testing
- **Production:** Live environment

### 14.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: ./deploy.sh
```

---

## 15. Monitoring & Logging

### 15.1 Logging Strategy

```typescript
// src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

### 15.2 Monitoring Metrics

- Request rate
- Error rate
- Response time
- Database query time
- Memory usage
- CPU usage

---

## 16. Error Handling

### 16.1 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": []
  }
}
```

### 16.2 Custom Error Class

```typescript
// src/utils/appError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: any[]
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}
```

---

## 17. Code Standards & Best Practices

### 17.1 Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful variable names
- Add JSDoc comments for functions
- Keep functions small and focused

### 17.2 Git Workflow

**Branch Naming:**
- `feature/description`
- `bugfix/description`
- `hotfix/description`

**Commit Messages:**
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
```

---

## 18. Development Workflow

### 18.1 Creating a New Feature

1. Create feature branch
2. Implement feature
3. Write tests
4. Update documentation
5. Create pull request
6. Code review
7. Merge to main

---

## 19. Troubleshooting

### 19.1 Common Issues

**Database Connection Error:**
- Check DATABASE_URL
- Verify database is running
- Check firewall rules

**Authentication Failures:**
- Verify JWT_SECRET is set
- Check token expiration
- Verify session exists in database

---

## 20. Appendices

### 20.1 Glossary

- **API:** Application Programming Interface
- **JWT:** JSON Web Token
- **ORM:** Object-Relational Mapping
- **CRUD:** Create, Read, Update, Delete

### 20.2 Resources

- [API Documentation](#)
- [Figma Designs](#)
- [Database Schema](#)

### 20.3 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial version |

---

**Document Maintained By:** [Tech Lead Name]
**Last Updated:** [Date]
**Questions:** [Email/Slack Channel]
