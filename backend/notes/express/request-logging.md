# Request Logging Middleware

## Objective

Implement a centralized middleware to log every incoming HTTP request.

---

## Why is request logging important?

Request logging helps developers:

- Monitor incoming traffic
- Debug API requests
- Measure request execution time
- Track HTTP status codes
- Identify slow endpoints
- Diagnose production issues

Without logging, it is difficult to determine which requests were made, whether they succeeded, or how long they took.

---

## Implementation

Created:

```
src/middlewares/logger.ts
```

Registered globally in:

```
src/app.ts
```

Middleware:

```ts
import { NextFunction, Request, Response } from "express";

export function logger(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;

        console.log(
            `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
        );
    });

    next();
}
```

---

## How it works

1. Request arrives.
2. Record the current timestamp.
3. Pass control to the next middleware using `next()`.
4. Express processes the request.
5. When the response finishes, the `finish` event is emitted.
6. Calculate the request duration.
7. Log the request details.

---

## Why use `res.on("finish")`?

Logging before calling `next()` only provides request information.

```text
POST /auth/login
```

At that point, the response has not been sent, so the following information is unavailable:

- HTTP status code
- Response time

The `finish` event is triggered after Express completes the response, allowing accurate logging.

Example:

```text
POST /auth/login 200 - 32ms
```

---

## Why use `req.originalUrl`?

`req.originalUrl` preserves the complete original request path.

Example:

```
GET /files/123/download
```

This provides more accurate logs than `req.url`, especially when routers are mounted.

---

## Sample Logs

```text
POST /auth/register 201 - 45ms
GET /files 200 - 18ms
GET /files/123 404 - 4ms
DELETE /files/15 204 - 12ms
```

---

## Benefits

- Easier debugging
- Performance monitoring
- Better observability
- Useful for production monitoring
- Foundation for structured logging tools such as Pino or Winston

---

## Interview Questions

### Why log requests?

To monitor application usage, debug issues, analyze API performance, and troubleshoot production problems.

---

### Why use the `finish` event?

Because it fires after the response is completed, allowing access to:

- Response status code
- Total request duration

---

### Why calculate response time?

Response time helps identify slow endpoints and performance bottlenecks.

---

### Why use middleware instead of logging inside every controller?

Middleware centralizes logging, avoids code duplication, and automatically logs every request.

---

### How would you improve this in production?

Replace `console.log` with a structured logger such as **Pino** or **Winston**, add log levels, request IDs, timestamps, and persist logs to external systems (e.g., files or log aggregation services).