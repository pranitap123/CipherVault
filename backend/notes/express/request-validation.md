# Request Validation

## Feature

Request validation ensures incoming requests are checked before reaching the application's business logic.

---

# Why validate requests?

Without validation:

Client
    │
Invalid Data
    │
Controller
    │
Database
    │
Runtime Errors

With validation:

Client
    │
Validation Middleware
    │
400 Bad Request
    │
Controller never executes

---

# Validation Flow

Client

↓

Authentication

↓

Validation

↓

Controller

↓

Database

---

# UUID Validation

Routes:

```http
GET /files/:id
DELETE /files/:id
```

The route parameter is validated using Zod.

Invalid request:

```http
GET /files/abc
```

Response:

```http
400 Bad Request
```

---

# File Upload Validation

The upload middleware verifies:

- file exists
- supported MIME type
- maximum file size

Checks performed:

```text
✓ File present
✓ Allowed MIME type
✓ Maximum size
```

---

# Why validate after Multer?

Multer parses multipart/form-data and creates:

```ts
req.file
```

Validation must execute after Multer because `req.file` does not exist beforehand.

---

# Why use middleware?

Without middleware:

Controller

- validate request
- validate UUID
- validate file
- business logic

With middleware:

Validation

↓

Controller

Controllers remain focused only on application logic.

---

# Why use Zod?

- TypeScript-first
- Declarative schemas
- Reusable validation rules
- Consistent error handling

---

# Backend Principles

- Validate input early.
- Never trust client input.
- Keep controllers focused on business logic.
- Separate validation from application logic.
- Return consistent error responses.

---

# HTTP Status Codes

400 Bad Request

Invalid request data.

401 Unauthorized

Authentication failed.

403 Forbidden

Authenticated but not allowed.

404 Not Found

Requested resource not found.

500 Internal Server Error

Unexpected server error.

---

# Interview Questions

## Easy

Why validate requests?

---

Why use middleware?

---

Why validate UUIDs?

---

## Medium

Why should validation happen before controllers?

---

Why use Zod instead of manual validation?

---

Why validate uploads after Multer?

---

## Advanced

How would you validate request bodies?

---

How would you reuse validation schemas?

---

How would you support different validation rules for different endpoints?

---

# Key Takeaways

- Validate requests before business logic.
- Middleware improves code organization.
- Zod provides reusable validation.
- Controllers should not perform request validation.