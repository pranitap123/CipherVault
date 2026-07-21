# package.json

## dependencies vs devDependencies

### dependencies

Packages required for the application to run in production.

Examples in SecureVault:

- express
- @prisma/client

Reason:

- Express runs the HTTP server.
- Prisma Client is imported by the application to communicate with PostgreSQL.

These packages are shipped to production.

---

### devDependencies

Packages required only during development.

Examples:

- typescript
- tsx
- prisma
- @types/node
- @types/express

Reason:

- TypeScript compiles code.
- tsx runs TypeScript during development.
- Prisma CLI generates migrations and Prisma Client.
- Type definitions help the compiler.

These packages are NOT shipped to production.

## SecureVault Usage

## SecureVault Usage

Express → HTTP server

Prisma Client → Database queries

Prisma CLI → Migrations

tsx → Development server

TypeScript → Compile TS → JS

---

## Interview Questions

### What is the difference between dependencies and devDependencies?

### Why is @prisma/client a dependency but prisma a devDependency?

### Which dependencies are required in production?
