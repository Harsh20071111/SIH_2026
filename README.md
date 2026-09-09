# SecureDocs — Tamper-Proof Evidence & Document Management System

A full-stack, role-based, audit-ready document management platform designed for law enforcement and legal teams. Built with React, Express.js, MongoDB, and Firebase Storage. Features SHA-256 integrity verification, hash-chained audit trails, and real-time security monitoring.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Docker Setup (Full-Stack)](#docker-setup-full-stack)
- [Environment Variables](#environment-variables)
- [Database Schema (MongoDB Models)](#database-schema)
- [API Reference](#api-reference)
- [Authentication & Authorization](#authentication--authorization)
- [Dashboard Features](#dashboard-features)
- [Key Features](#key-features)
- [Demo Credentials](#demo-credentials)
- [Scripts Reference](#scripts-reference)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)

---

## Architecture Overview

```
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│   React Dashboard    │────▶│    Express.js API     │────▶│      MongoDB 7.0     │
│   (Vite + Tailwind)  │     │    (Port 5001)        │     │   (Port 27017)       │
│   (Port 3000)        │◀────│                       │◀────│                      │
└──────────────────────┘     └──────────────────────┘     └──────────────────────┘
         │                            │
         │                            ▼
         │                   ┌──────────────────────┐
         │                   │   Firebase Storage    │
         │                   │  (Document Storage)   │
         └───────────────────│   Falls back to       │
              Nginx proxy    │   local ./uploads/    │
              in Docker      └──────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 7, Tailwind CSS 4 |
| **UI Components** | Radix UI, shadcn/ui, Lucide icons, Recharts, Framer Motion |
| **Routing** | Wouter (lightweight React router) |
| **State / Data** | React Context (auth), React Query (server state) |
| **Forms** | React Hook Form + Zod validation |
| **Backend** | Express.js 5, TypeScript, esbuild (bundler) |
| **Database** | MongoDB 7.0 + Mongoose 9 ODM |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Storage** | Firebase Storage (optional), local `./uploads/` fallback |
| **Logging** | Pino (structured JSON logging) |
| **Package Manager** | pnpm (monorepo with workspaces) |
| **Containerization** | Docker Compose (4 services) |
| **Web Server** | Nginx (reverse proxy for SPA + API in production) |
| **Node** | Node.js 22 (Alpine in Docker) |

---

## Project Structure

```
Hackathon/
├── package.json                    # Root wrapper (delegates to Hackathon-Merged/)
├── AGENTS.md                       # Agent instructions
├── Hackathon-Merged/               # pnpm workspace root
│   ├── package.json                # Workspace scripts
│   ├── pnpm-workspace.yaml         # Workspace definition
│   ├── docker-compose.yml          # Full-stack Docker setup
│   ├── docker/
│   │   ├── api.Dockerfile          # Multi-stage API build
│   │   ├── dashboard.Dockerfile    # Multi-stage dashboard build
│   │   └── nginx.conf              # Nginx reverse proxy config
│   ├── scripts/
│   │   ├── live-audit.mjs          # Real-time audit log streamer
│   │   ├── watch-audit.js          # MongoDB change stream watcher
│   │   └── src/                    # Utility scripts
│   └── artifacts/
│       ├── api-server/             # Express.js backend
│       │   ├── src/
│       │   │   ├── app.ts          # Express app setup
│       │   │   ├── index.ts        # Server entry point
│       │   │   ├── routes/         # API route handlers (9 files)
│       │   │   ├── models/         # Mongoose models (7 files)
│       │   │   ├── middlewares/     # Auth + RBAC middlewares
│       │   │   └── lib/            # Utilities (audit, security, firebase, etc.)
│       │   ├── build.mjs           # esbuild build script
│       │   └── uploads/            # Local file storage fallback
│       ├── securedocs-dashboard/   # React frontend
│       │   ├── src/
│       │   │   ├── App.tsx         # Root router (25+ routes)
│       │   │   ├── pages/          # Page components (27 pages)
│       │   │   ├── components/     # UI components (55+ shadcn/ui)
│       │   │   ├── context/        # Auth context
│       │   │   ├── services/       # API service layer
│       │   │   ├── hooks/          # Custom React hooks
│       │   │   └── lib/            # Utilities, data, types
│       │   ├── vite.config.ts      # Vite configuration
│       │   └── index.html          # SPA entry point
│       └── mockup-sandbox/         # Experimental UI sandbox
└── .gitignore
```

---

## Prerequisites

- **Node.js** 18+ (22 recommended)
- **pnpm** (required — enforced by preinstall script)
- **MongoDB** 7.0+ (local install or Docker)
- **Firebase** project (optional — falls back to local storage)

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/Harsh20071111/SIH_2026.git
cd SIH_2026/Hackathon-Merged
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your MongoDB URI, JWT secret, and optional Firebase config.

### 3. Seed the database

```bash
pnpm --filter @workspace/api-server run seed
```

This creates 8 demo users, 8 cases, 12 documents, 5 reviews, and 8 audit events.

### 4. Start development servers

```bash
pnpm dev:api       # API server on http://localhost:5001
pnpm dev:dashboard  # Dashboard on http://localhost:3000
```

Or start both together:

```bash
pnpm dev            # Dashboard only
```

### 5. Open the app

Navigate to `http://localhost:3000` and log in with any demo credential.

---

## Docker Setup (Full-Stack)

All services run via Docker Compose from `Hackathon-Merged/`:

```bash
docker compose up --build        # Build & start all services
docker compose up -d             # Start in background
docker compose down              # Stop all services
docker compose down -v           # Stop & delete all data (including DB)
```

### Services & Ports

| Service | Container | Port | Description |
|---|---|---|---|
| `mongodb` | `securedocs-mongo` | `27017` | MongoDB 7.0 database |
| `mongo-ui` | `securedocs-mongo-ui` | `8081` | Mongo Express GUI |
| `api` | `securedocs-api` | `5001` | Express.js API server |
| `dashboard` | `securedocs-dashboard` | `3000` | React dashboard (Nginx) |

### Seeding (Docker)

```bash
# Verify API is healthy first:
docker compose exec api node --enable-source-maps ./dist/index.mjs

# Seed from local machine (uses host network):
cd Hackathon-Merged && pnpm --filter @workspace/api-server run seed
```

### View Logs

```bash
docker compose logs -f api
docker compose logs -f dashboard
docker compose logs -f mongodb
```

---

## Environment Variables

### API Server (`.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5001` | API server port |
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/securedocs` | MongoDB connection string |
| `JWT_SECRET` | Yes | `securedocs-dev-secret-change-in-production` | JWT signing secret |
| `FIREBASE_STORAGE_BUCKET` | No | — | Firebase Storage bucket |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | No | — | Path to Firebase service account JSON |

### Dashboard (`vite.config.ts`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Dashboard dev server port |
| `VITE_API_URL` | `/api` | API base URL (proxied in dev, absolute in prod) |
| `BASE_PATH` | `/` | Base path for reverse proxy setups |

---

## Database Schema

### User

```typescript
{
  email: string (unique, lowercase)
  name: string
  role: "Admin" | "Officer" | "Legal Reviewer" | "Clerk" | "Auditor" | ...
  department: string
  passwordHash: string (bcrypt, 12 rounds)
  isActive: boolean
  lastLogin: Date | null
  employeeId: string (unique)
  assignedCases: string[]
}
```

### Case

```typescript
{
  caseId: string (unique)          // e.g., "CASE-2026-00421"
  title: string
  type: string                     // e.g., "Theft", "Fraud", "Cyber Crime"
  description: string
  department: string
  assignedOfficer: string
  priority: "Low" | "Medium" | "High"
  status: "Active" | "Under Investigation" | "Under Review" | "Closed" | "Archived"
  risk: "Low" | "Medium" | "High"
  confidentiality: "Public/Internal" | "Confidential" | "Restricted" | "Highly Restricted"
  startDate: Date
  documentsCount: number
  createdBy: string
}
```

### Document (SecureDocument)

```typescript
{
  documentId: string (unique)      // e.g., "SD-260421"
  documentName: string
  caseId: string
  documentType: string             // "FIR", "Evidence Record", etc.
  firebaseStoragePath: string
  hash: string                     // SHA-256 computed at upload time
  version: number
  status: "Pending Review" | "Approved" | "Rejected" | "Flagged"
  integrity: "Verified" | "Warning" | "Failed"
  confidentiality: "Public" | "Internal" | "Confidential" | "Restricted"
  uploadedBy: string
  totalAccesses: number
  lastAccessedBy: string
}
```

### DocumentVersion

```typescript
{
  documentId: string
  version: number
  hash: string                     // SHA-256 for this version
  firebaseStoragePath: string
  uploadedBy: string
  changeDescription: string
  size: number
}
```

### Review

```typescript
{
  documentId: string
  caseId: string
  documentName: string
  reviewer: string
  submittedBy: string
  status: "Pending" | "Approved" | "Rejected" | "Flagged"
  comment: string
  priority: "Low" | "Medium" | "High"
}
```

### AuditLog (Hash-Chained)

```typescript
{
  action: string                   // "LOGIN_SUCCESS", "DOCUMENT_UPLOADED", etc.
  userId: string
  userName: string
  userRole: string
  caseId: string
  documentId: string
  result: string
  ipAddress: string
  userAgent: string
  metadata: Record<string, unknown>
  previousHash: string | null      // Hash of previous audit event
  eventHash: string                // SHA-256 of this event + previousHash
  timestamp: Date
}
```

### SecurityEvent

```typescript
{
  type: string                     // "LOGIN_FAILED", "UNAUTHORIZED_ACCESS", etc.
  action: string
  userId: string
  userName: string
  ipAddress: string
  userAgent: string
  riskLevel: "Low" | "Medium" | "High" | "Critical"
  status: "Open" | "Monitoring" | "Resolved"
  timestamp: Date
}
```

---

## API Reference

All endpoints are prefixed with `/api`. Authentication requires a `Bearer` token in the `Authorization` header.

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/healthz` | No | Health check |

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | No | Login, returns JWT + user |
| POST | `/api/auth/logout` | Yes | Record logout event |
| GET | `/api/auth/me` | Yes | Get current user from JWT |

### Users (Admin Only)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | List all users |
| POST | `/api/users` | Admin | Create user (defaults password: `SecureDocs@2026`) |
| PATCH | `/api/users/:id` | Admin | Update user (role, dept, status, cases) |

### Cases

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/cases` | Yes | List cases (filtered, paginated) |
| POST | `/api/cases` | Yes | Create case |
| GET | `/api/cases/:id` | Yes | Get case details |
| PATCH | `/api/cases/:id` | Yes | Update case |

### Documents

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/documents` | Yes | List documents (filtered, paginated) |
| POST | `/api/documents` | Yes | Upload document (multipart/form-data, max 50MB) |
| GET | `/api/documents/:id` | Yes | Get document details |
| GET | `/api/documents/:id/download` | Yes | Get signed download URL |
| GET | `/api/documents/:id/versions` | Yes | Get version history |
| POST | `/api/documents/:id/verify-integrity` | Yes | Verify SHA-256 integrity |
| GET | `/api/documents/local-download` | Yes | Download locally-stored file |

**Upload fields:** `file` (required), `caseId` (required), `documentType` (required), `description`, `confidentiality`, `documentName`

### Reviews

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/reviews` | Yes | List reviews (filtered, paginated) |
| POST | `/api/reviews` | Yes | Submit document for review |
| PATCH | `/api/reviews/:id` | Yes | Update review status (Approve/Reject/Flag) |

### Audit Logs (Admin/Auditor Only)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/audit` | Admin, Auditor | List audit logs (filtered, paginated) |
| GET | `/api/audit/verify-chain` | Admin, Auditor | Verify tamper-evident audit chain |

### Security Events (Admin/Auditor Only)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/security/events` | Admin, Auditor | List security events |
| GET | `/api/security/events/:id` | Admin, Auditor | Get event details |
| GET | `/api/security/risk` | Admin, Auditor | Get risk summary statistics |
| PATCH | `/api/security/events/:id` | Admin, Auditor | Update event status |

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard` | Yes | Aggregated metrics (stats, charts, alerts) |

---

## Authentication & Authorization

### JWT Authentication

- Tokens are issued on successful login via `POST /api/auth/login`
- Token payload: `{ userId, email, name, role, department, employeeId }`
- Client stores token in `localStorage` (`securedocs_token`)
- All protected routes use `requireAuth` middleware

### Role-Based Access Control (RBAC)

| Role | Permissions |
|---|---|
| **Admin** | Full access — user management, all data, settings |
| **Officer** | Case management, document upload/download, submit reviews |
| **Legal Reviewer** | Document review (approve/reject/flag), case viewing |
| **Clerk** | Document management, case viewing |
| **Auditor** | Audit logs, security events, compliance, reports |

The `requireRole(...)` middleware is applied to sensitive endpoints. Non-authorized roles receive `403 Forbidden`.

### Access Control Flow

```
Request → requireAuth (verify JWT) → requireRole (check role) → Handler
                    │                        │
                    ▼                        ▼
              401 Unauthorized        403 Forbidden
```

---

## Dashboard Features

### Pages (25+ routes)

| Page | Route | Description |
|---|---|---|
| **Dashboard** | `/dashboard` | Overview with stats, charts, alerts, activity feed |
| **Document Repository** | `/documents` | Search, filter, preview, download documents |
| **Document Review** | `/reviews/:id` | Review queue with approve/reject/flag actions |
| **Case Management** | `/cases` | Create, view, edit, filter cases |
| **Case Detail** | `/cases/:id` | Case overview, documents, audit trail |
| **User Management** | `/users` | Create, edit, disable users (Admin only) |
| **Access Control** | `/security` | Security dashboard with threat monitoring |
| **Security Monitoring** | `/integrity` | Real-time integrity verification |
| **Audit Logs** | `/audit-logs` | Searchable audit trail with chain verification |
| **Compliance Dashboard** | `/compliance` | Compliance readiness metrics |
| **Reports** | `/reports` | Generate integrity and security reports |
| **One-Click Integrity Report** | `/reports/integrity/:id` | Per-case integrity report |
| **Settings** | `/settings` | Application settings |
| **Profile** | `/profile` | User profile |
| **Login** | `/login` | Authentication page |
| **Access Denied** | `/403` | Forbidden page |

### UI Components

- **55+ shadcn/ui components** (buttons, dialogs, tables, badges, forms, etc.)
- **Collapsible sidebar** with role-based navigation
- **Global search** in header
- **Notification system** with severity indicators
- **Mobile responsive** layout with hamburger menu
- **Dark sidebar** with active state indicators
- **Security status badge** (real-time readout)

### Data Features

- **React Query** for server state caching and refetching
- **React Hook Form + Zod** for validated forms
- **Role-aware rendering** — UI adapts based on user role
- **Admin-only navigation items** hidden for non-admins

---

## Key Features

### 1. SHA-256 Document Integrity

Every uploaded document is hashed with SHA-256 at upload time. The hash is stored in MongoDB and can be verified at any time by re-downloading and re-hashing the file from Firebase Storage.

### 2. Tamper-Evident Audit Trail

Audit events are **hash-chained** (like a blockchain). Each event's hash includes the previous event's hash, creating a tamper-evident chain. Any modification to past events breaks the chain and is detectable via `GET /api/audit/verify-chain`.

### 3. Real-Time Audit Log Streamer

```bash
pnpm watch:audit:live     # Stream from local MongoDB
pnpm watch:audit:cloud    # Stream from MongoDB Atlas
```

A terminal-based live viewer that connects to MongoDB change streams and displays audit events in real-time with color-coded output.

### 4. Document Version Control

Each upload creates a version record. Version history is tracked per document with hashes, enabling comparison across versions.

### 5. Security Event Monitoring

Failed logins, unauthorized access attempts, and suspicious patterns are captured as `SecurityEvent` documents with risk levels (Low → Critical) and statuses (Open, Monitoring, Resolved).

### 6. Compliance Dashboard

Tracks readiness metrics across multiple compliance dimensions with visual indicators and percentages.

### 7. Firebase + Local Storage Fallback

Documents are stored in Firebase Storage when configured. Without Firebase, files are stored locally in `./uploads/` with a `local://` prefix.

---

## Demo Credentials

After running the seed script (`pnpm --filter @workspace/api-server run seed`), all accounts use password: **`password123`**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@securedocs.gov` | `password123` |
| Officer | `raj.patel@securedocs.gov` | `password123` |
| Officer | `amit.shah@securedocs.gov` | `password123` |
| Officer | `neha.patel@securedocs.gov` | `password123` |
| Officer | `vikram.rao@securedocs.gov` | `password123` |
| Legal Reviewer | `mehta@securedocs.gov` | `password123` |
| Clerk | `clerk@securedocs.gov` | `password123` |
| Auditor | `auditor@securedocs.gov` | `password123` |

The seed also creates 8 cases, 12 documents, 5 reviews, and 8 audit events for testing.

---

## Scripts Reference

### Root (`package.json`)

| Command | Description |
|---|---|
| `npm run dev` | Start dashboard dev server |
| `npm run dev:api` | Start API server |
| `npm run dev:mockup` | Start mockup sandbox |
| `npm run build` | Build all packages |

### Workspace (`Hackathon-Merged/package.json`)

| Command | Description |
|---|---|
| `pnpm dev` | Dashboard dev server |
| `pnpm dev:dashboard` | Dashboard dev server (alias) |
| `pnpm dev:api` | API server with esbuild watch |
| `pnpm dev:mockup` | Mockup sandbox |
| `pnpm build` | Typecheck all + build all packages |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm watch:audit` | Stream audit logs via mongosh |
| `pnpm watch:audit:live` | Stream audit logs via Node.js |
| `pnpm watch:audit:cloud` | Stream from MongoDB Atlas |

### API Server (`artifacts/api-server/`)

| Command | Description |
|---|---|
| `pnpm dev` | Build + start with esbuild watch |
| `pnpm build` | Bundle with esbuild to `dist/` |
| `pnpm start` | Start production server |
| `pnpm seed` | Seed database with demo data |
| `pnpm typecheck` | TypeScript type check |

### Dashboard (`artifacts/securedocs-dashboard/`)

| Command | Description |
|---|---|
| `pnpm dev` | Vite dev server with HMR |
| `pnpm build` | Vite production build |
| `pnpm serve` | Preview production build |
| `pnpm typecheck` | TypeScript type check |

---

## Development Workflow

### Starting from scratch

```bash
# 1. Start MongoDB (Docker)
docker compose up mongodb -d

# 2. Install dependencies
cd Hackathon-Merged && pnpm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. Seed database
pnpm --filter @workspace/api-server run seed

# 5. Start API server (terminal 1)
pnpm dev:api

# 6. Start dashboard (terminal 2)
pnpm dev:dashboard
```

### Hot Reload

- **API Server**: esbuild rebuilds automatically on file changes, auto-restarts the server
- **Dashboard**: Vite HMR (Hot Module Replacement) for instant UI updates

### Adding a new API endpoint

1. Create route handler in `src/routes/your-route.ts`
2. Import and add to `src/routes/index.ts`
3. Add Mongoose model in `src/models/` if needed
4. Use `requireAuth` and `requireRole()` middleware as needed

### Adding a new dashboard page

1. Create page component in `src/pages/your-page.tsx`
2. Add route in `src/App.tsx` (inside `AuthenticatedApp`)
3. Add navigation item in `src/lib/mock-data.ts` (in `navGroups`)

---

## Deployment

### Vercel (Dashboard)

The project includes a `vercel.json` with SPA rewrite rules:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Docker (Full-Stack)

```bash
# Build and start everything
docker compose up --build -d

# View production URLs
# Dashboard: http://localhost:3000
# API:       http://localhost:5001
# Mongo UI:  http://localhost:8081
```

### Production Checklist

- [ ] Set strong `JWT_SECRET` (not the default)
- [ ] Use MongoDB Atlas or secured MongoDB instance
- [ ] Configure Firebase Storage (or accept local storage)
- [ ] Enable HTTPS via Nginx/reverse proxy
- [ ] Set `NODE_ENV=production`
- [ ] Remove demo seed data
- [ ] Configure CORS for production domain
- [ ] Set up MongoDB authentication

---

## License

MIT

---

Built for [SIH 2026](https://sih.gov.in) — Smart India Hackathon 2026
