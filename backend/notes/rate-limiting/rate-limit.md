# Rate Limiting

## Overview

Rate limiting protects an API from abuse by restricting how many requests a client can make within a given time period.

It helps prevent:

- Brute-force attacks
- Credential stuffing
- API abuse
- Denial-of-Service (DoS) attempts
- Resource exhaustion

---

# Package Used

```bash
npm install express-rate-limit
```

---

# Project Structure

```
src/
├── middlewares/
│   └── rateLimiter.ts
├── app.ts
└── auth/
    └── authRouter.ts
```

---

# Why Rate Limiting?

Without rate limiting, a client could send thousands of requests every second, causing:

- Server overload
- Increased database load
- Higher infrastructure costs
- Security risks

Rate limiting ensures fair usage and improves application stability.

---

# Implementation

The project uses **express-rate-limit** middleware.

Two rate limiters are configured:

## 1. Global Rate Limiter

Applied to every API request.

Configuration:

- Window: 15 minutes
- Max requests: 100

Purpose:

- Protect the entire API
- Reduce abuse
- Prevent excessive traffic

---

## 2. Authentication Rate Limiter

Applied only to:

- POST /auth/register
- POST /auth/login

Configuration:

- Window: 15 minutes
- Max requests: 5
- skipSuccessfulRequests: true

Purpose:

- Prevent brute-force login attempts
- Prevent credential stuffing
- Allow legitimate users to continue using the application after successful authentication

---

# Configuration Options

## windowMs

Defines the duration of the rate limit window.

Example:

```ts
windowMs: 15 * 60 * 1000
```

Meaning:

15 minutes.

---

## max

Maximum number of requests allowed during the time window.

Example:

```ts
max: 100
```

After the limit is exceeded, the server returns HTTP 429.

---

## standardHeaders

```ts
standardHeaders: true
```

Enables modern RateLimit headers.

Example:

```
RateLimit-Limit
RateLimit-Remaining
RateLimit-Reset
```

These headers help clients understand their current rate limit status.

---

## legacyHeaders

```ts
legacyHeaders: false
```

Disables older X-RateLimit-* headers.

Using standard headers keeps the API aligned with modern HTTP standards.

---

## skipSuccessfulRequests

```ts
skipSuccessfulRequests: true
```

Successful authentication requests are not counted toward the rate limit.

Only failed authentication attempts consume the available request quota.

This improves the experience for legitimate users while still protecting against brute-force attacks.

---

# Middleware Order

Global middleware is registered before application routes.

```
Express App
      │
      ▼
Global Rate Limiter
      │
      ▼
Routes
      │
      ▼
Controllers
```

Authentication routes use an additional, stricter limiter.

```
Request
   │
   ▼
Global Rate Limiter
   │
   ▼
Authentication Rate Limiter
   │
   ▼
Validation
   │
   ▼
Controller
```

---

# HTTP 429

When the rate limit is exceeded, the API returns:

Status Code

```
429 Too Many Requests
```

Example Response

```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

---

# Security Benefits

Rate limiting helps protect against:

- Brute-force attacks
- Credential stuffing
- Automated bots
- API abuse
- Resource exhaustion

---

# Best Practices

- Use different limits for sensitive endpoints.
- Apply stricter limits to authentication routes.
- Use standard RateLimit headers.
- Return meaningful error messages.
- Keep rate limiting configurable through environment variables in production.
- Monitor rate limit metrics to detect abuse.

---

# Interview Questions

## What is rate limiting?

Rate limiting restricts the number of requests a client can make within a specified time window to protect the API from abuse and ensure fair usage.

---

## Why is rate limiting important?

It helps prevent:

- Brute-force attacks
- Denial-of-Service attacks
- API abuse
- Server overload

---

## Why have separate rate limiters?

Different endpoints have different security requirements.

Authentication endpoints are more sensitive and therefore use stricter limits than general API routes.

---

## What is HTTP 429?

HTTP 429 (Too Many Requests) indicates that a client has exceeded the allowed number of requests within a defined time period.

---

## What does `windowMs` represent?

The duration of the rate limiting window.

Example:

```ts
windowMs: 15 * 60 * 1000
```

means 15 minutes.

---

## What does `max` represent?

The maximum number of requests permitted within the configured time window.

---

## Why use `skipSuccessfulRequests`?

It prevents successful authentication requests from consuming the request quota, ensuring that only failed attempts contribute to the rate limit.

---

## Why use standard headers?

Standard RateLimit headers provide clients with information about:

- Allowed requests
- Remaining requests
- Time until reset

This improves transparency and client-side handling.

---

# What I Learned

- How to implement rate limiting using `express-rate-limit`
- How to protect an API from abuse
- Why authentication routes require stricter limits
- How HTTP 429 is used
- How middleware order affects request processing
- The purpose of `windowMs`, `max`, `standardHeaders`, `legacyHeaders`, and `skipSuccessfulRequests`
- How rate limiting improves both API security and reliability

---

# Future Improvements

- Configure limits using environment variables.
- Use Redis-backed rate limiting for distributed deployments.
- Apply different limits based on user roles.
- Implement IP allowlists for trusted services.
- Log rate limit violations for security monitoring.