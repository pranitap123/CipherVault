# 🔐 CipherVault

CipherVault is a production-grade encrypted file storage platform with role-based access control, envelope encryption, and a modern 3D-animated UI. Built with TypeScript, Node.js, PostgreSQL, React, and Docker.

**Live Demo:** https://cipher-vault-ipz3224bk-pranita-panchal.vercel.app

---

## ✨ Features

### Security & Encryption
- **Envelope Encryption (AES-256-GCM):** Every file gets its own random Data Encryption Key (DEK). The file is encrypted with the DEK using AES-256-GCM with authentication tags (tamper detection). The DEK is wrapped under a master key and stored on the file row, enabling zero-downtime key rotation.
- **Tamper Detection:** Corrupted or modified files throw on decrypt instead of silently returning garbage (GCM's authenticated encryption).
- **Master Key Rotation:** `npm run rotate-key` script rotates the master key without re-encrypting any file content (O(files), not O(bytes)).
- **Password Hashing:** bcrypt with 10 rounds

### Access Control (RBAC)
- **Role-Based Access Control:** USER and ADMIN roles, enforced server-side on every `/admin` route
- **Admin Routes:** 
  - `GET /admin/files` — list all files across all users
  - `DELETE /admin/files/:id` — delete any user's file
  - `GET /admin/users` — list all users with roles
  - `PATCH /admin/users/:id/role` — change user roles (blocks self-demotion)
- **Audit Logging:** Every upload, download, delete, and admin action logged with user attribution

### Frontend
- **Landing Page:** Public homepage with 3D vault hero (orbiting file chips), feature grid, and one-click RBAC demo section
- **3D UI:** Mouse-tracked 3D components (VaultCore on dashboard, VaultDoor on auth, Tilt on cards)
- **Admin Console:** 3D admin panel with user/file management and role toggles
- **Design System:** Vault theme palette (obsidian/brass/copper), smooth animations, responsive layout

### Authentication
- JWT tokens (32+ char secret)
- Secure session cookies
- Protected routes
- Register / Login / Forgot Password

### Backend
- Express.js with TypeScript
- Prisma ORM with PostgreSQL
- Global error handling
- Request logging
- Swagger/OpenAPI docs
- Rate limiting (global + auth-specific)
- Health checks for Docker

### DevOps
- **Docker:** Multi-stage production builds, non-root user, health checks
- **Docker Compose:** Postgres (health-gated) → Migrate (one-shot) → Backend → Frontend orchestration
- **CI/CD Ready:** Render + Vercel auto-deployment

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind v4, Recharts |
| **Backend** | Node.js, Express, TypeScript, Prisma, PostgreSQL |
| **Encryption** | AES-256-GCM (per-file DEKs + master key wrapping) |
| **Authentication** | JWT, bcrypt |
| **Infrastructure** | Docker, Docker Compose, Render, Vercel |
| **Monitoring** | Health checks, Audit logs, Swagger |

---

## 📁 Project Structure

```text
CipherVault/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── scripts/
│   │   └── rotateMasterKey.ts
│   ├── src/
│   │   ├── admin/
│   │   ├── audit/
│   │   ├── auth/
│   │   ├── config/
│   │   ├── files/
│   │   ├── middlewares/
│   │   ├── services/
│   │   ├── types/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── features/
│   │   ├── pages/
│   │   └── types/
│   ├── App.tsx
│   ├── Dockerfile
│   ├── index.css
│   ├── tailwind.config.js
│   └── nginx.conf
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Local Development

**Prerequisites:** Node.js 18+, Docker Desktop, PostgreSQL (or use Docker Compose)

```bash
git clone https://github.com/pranitap123/CipherVault.git
cd CipherVault

# Copy and fill environment variables
cp .env.example .env
# Fill JWT_SECRET (32+ chars) and MASTER_KEY (64 hex chars)
```

**Option A: Docker Compose (recommended)**
```bash
docker compose up --build
# Postgres → Migrate → Backend (http://localhost:3000) → Frontend (http://localhost:5173)
docker compose exec backend npm run prisma:seed
```

**Option B: Local Development**
```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## 🔐 Security Details

### Envelope Encryption
1. On upload: Generate random 32-byte DEK → Encrypt file with DEK using AES-256-GCM → Wrap DEK under master key
2. On download: Unwrap DEK under master key → Decrypt file with DEK → GCM verifies authentication tag (throws if tampered)
3. Master key rotation: Unwrap DEK under old key → Re-wrap under new key (files untouched)

### RBAC Enforcement
- Middleware `authenticate()` loads user role from DB on every request (fresh state)
- Middleware `authorize("ADMIN")` gates `/admin/*` routes — returns 403 if role doesn't match
- A regular user can't reach `/app/admin` even with a forged link; the API itself rejects them

### Audit Trail
Every action logged to `AuditLog` table with user ID, action type, resource, and timestamp:
- `FILE_UPLOAD`, `FILE_DOWNLOAD`, `FILE_DELETE`
- `ADMIN_VIEW_ALL_FILES`, `ADMIN_FILE_DELETE`, `ADMIN_VIEW_ALL_USERS`, `ADMIN_ROLE_UPDATE`

---

## 📊 Testing

17 unit + integration tests with Vitest:

```bash
cd backend
npm run test:run
```

Tests cover:
- Envelope encryption round-trip
- Tamper detection (GCM auth tag)
- Master key rotation
- RBAC authorization (correct role passes, wrong role 403s)
- Admin actions (cross-user file delete, role changes)
- Legacy CBC decrypt path (backward compatibility)

---

## 🎨 UI/UX

- **Landing Page:** Public homepage with 3D vault hero and one-click RBAC demo (prefilled login links)
- **Dashboard:** VaultCore hero showing live storage % as a 3D ring fill
- **File Grid:** Tilted file cards with mouse-tracked depth
- **Auth Pages:** VaultDoor 3D hero with rotating bolts and animated keyhole
- **Admin Console:** 3D AccessCore with user/file management and role flip-switches
- **Color Palette:** Obsidian (dark) / Brass (gold accent) / Copper (warm) — consistent app-wide

---

## 🚀 Deployment

### Backend (Render)
```bash
# Connect GitHub repo → Render
# Settings: Dockerfile, Root Directory: backend
# Environment Variables:
DATABASE_URL=postgresql://...
JWT_SECRET=your_32_char_secret
MASTER_KEY=your_64_hex_key
NODE_ENV=production
```

Run migrations after first deploy:
```bash
# Locally (migrations can't run inside Render free tier)
DATABASE_URL="postgres://..." npx prisma migrate deploy
DATABASE_URL="postgres://..." npm run prisma:seed
```

### Frontend (Vercel)
```bash
# Connect GitHub repo → Vercel auto-deploys
# Environment Variable:
VITE_API_URL=https://your-render-backend-url
```

**Live URLs:**
- Frontend: https://cipher-vault-ipz3224bk-pranita-panchal.vercel.app
- Backend: https://ciphervault-1.onrender.com
- API Docs: https://ciphervault-1.onrender.com/api-docs

---

## 🔧 Demo Accounts

After seeding:
- **Admin:** `admin@ciphervault.dev` / `ChangeMe123!` (can see all files, manage users, delete any file)
- **Member:** `demo@ciphervault.dev` / `DemoPass123!` (can only manage their own files)

Both accessible via one-click buttons on the landing page's RBAC demo section.

---

## 📖 API Documentation

Swagger/OpenAPI:
https://ciphervault-1.onrender.com/api-docs


Key endpoints:
- `POST /auth/register` — Create account
- `POST /auth/login` — Sign in
- `POST /files` — Upload encrypted file
- `GET /files` — List user's files
- `GET /files/:id` — Download file
- `DELETE /files/:id` — Delete file
- `GET /admin/files` — (ADMIN) List all files
- `DELETE /admin/files/:id` — (ADMIN) Delete any file
- `GET /admin/users` — (ADMIN) List all users
- `PATCH /admin/users/:id/role` — (ADMIN) Change user role

---

## 🛣 Roadmap

### ✅ Completed
- Envelope encryption (AES-256-GCM, per-file DEKs, master-key wrapping)
- Tamper detection (GCM authentication tags)
- Master key rotation script
- Role-based access control (USER/ADMIN, server-enforced)
- Audit logging (all actions tracked)
- Rate limiting (global + auth-specific)
- 3D animated UI (VaultCore, VaultDoor, Tilt, AccessCore)
- Landing page with RBAC demo
- Admin console (user/file management)
- Docker & Docker Compose
- Vitest suite (17 tests, all passing)
- Render + Vercel deployment
- Swagger/OpenAPI documentation

### 🔄 Next Steps (V2)
- OpenTelemetry observability (traces, metrics, logs)
- BullMQ for background jobs (async processing)
- Provider failover (multiple LLM providers if scaling to gateway)
- Agent tracing (request flow visualization)
- Refresh token rotation
- Email verification
- Advanced audit queries (filter by date, action, user)

---

## 🧪 Running Tests Locally

```bash
cd backend
npm run test:run          # Run all tests
npm run test:coverage     # Coverage report
```

---

## 📄 License

MIT License — See LICENSE file

---

## 👩‍💻 Author

**Pranita Panchal**
- GitHub: https://github.com/pranitap123
- Portfolio: [Your portfolio URL]

---

## 🙏 Acknowledgments

Built with:
- Anthropic Claude (architecture, code review, guidance)
- Render (backend hosting)
- Vercel (frontend hosting)
- PostgreSQL (data persistence)
- Docker (containerization)