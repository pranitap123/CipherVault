# SecureVault — Frontend (v1.0)

Encrypted file-storage frontend. React + TypeScript + Vite + Tailwind + React Router.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```
Demo login is pre-filled (`demo@securevault.app` / `password123`) — the mock backend accepts any email + a 6+ char password.

## The one thing that matters for tomorrow: the API seam

The UI never calls `fetch` directly. It depends only on the `SecureVaultApi`
interface in `src/api/client.ts`. Today that interface is satisfied by an
in-memory mock (`src/api/mockClient.ts`). To connect your real Express backend:

1. Create `src/api/httpClient.ts` implementing `SecureVaultApi` with real `fetch` calls.
2. Change one line in `src/api/index.ts`:
   ```ts
   export const api: SecureVaultApi = httpClient; // was: mockClient
   ```
Nothing in the UI changes. That's the point of the interface.

## Structure
```
src/
  api/        client.ts (contract) · mockClient.ts (fake backend) · index.ts (swap point)
  types/      shared domain types — the frontend/backend contract
  context/    AuthContext — session state + route guards
  components/  ui/ (Button, Field, Toast…) · layout/ (AppShell)
  features/   upload/ (UploadZone)
  pages/      Auth, Dashboard, Files, Settings
  lib/        formatting helpers
```

## Built (v1.0)
Auth (login, register, forgot/reset password, verify email, session expired) ·
Dashboard (storage, recent files, quick actions) ·
Files (grid/list, search, favorites, multi-select, delete, metadata panel) ·
Upload (drag & drop, queue, progress, retry) · Settings (profile, appearance, password)

## Architected-for, not yet built (needs backend first)
Folders/breadcrumbs · trash · sharing with expiry/revoke · MFA · API keys ·
active sessions/devices · audit log. Routing and component structure leave slots
for these; add them once the corresponding endpoints exist.
