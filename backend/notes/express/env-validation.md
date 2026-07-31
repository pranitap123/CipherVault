# Environment Variable Validation

## Objective

Validate required environment variables during application startup.

## Why?

Environment variables configure the application.

Examples:

- PORT
- DATABASE_URL
- JWT_SECRET
- ENCRYPTION_KEY

Without validation, missing or invalid values cause runtime failures.

## Implementation

Created:

src/config/env.ts

Uses Zod to validate:

- PORT
- DATABASE_URL
- JWT_SECRET
- ENCRYPTION_KEY

Exports a centralized `env` object.

## Benefits

- Fail-fast startup
- Runtime validation
- Type-safe configuration
- Centralized configuration management
- Easier debugging

## Interview Questions

### Why use Zod?

- Runtime validation
- Better error messages
- Type inference
- Single source of truth

### Why not use process.env everywhere?

- Values are `string | undefined`
- No validation
- Configuration becomes scattered

A centralized configuration module is cleaner and easier to maintain.