# Audit Logging

## Overview

Audit logging records important user actions performed within the application.

Unlike application logs, audit logs provide a permanent history of user activities for security, compliance, and traceability.

In SecureVault, audit logging tracks authentication events and file operations.

---

# Why Audit Logging?

Audit logs help answer questions such as:

- Who uploaded this file?
- Who deleted this file?
- When did a user log in?
- Which user downloaded a file?
- What actions were performed on the system?

Audit logging is commonly used in:

- Banking applications
- Healthcare systems
- Government services
- Enterprise software
- Cloud platforms

---

# Database Schema

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  action     String
  resource   String?
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
}
```

---

# Relationship

```
User
 │
 ├── File
 │
 └── AuditLog
```

One user can have many audit logs.

---

# Project Structure

```
src/
├── audit/
│   ├── auditService.ts
│   └── audit.types.ts
```

---

# Audit Actions

The project defines audit actions using an enum.

```ts
export enum AuditAction {
    USER_REGISTER,
    USER_LOGIN,

    FILE_UPLOAD,
    FILE_DOWNLOAD,
    FILE_DELETE
}
```

Using enums prevents typos and improves type safety.

---

# Audit Service

Instead of creating audit logs directly inside controllers or services, the project uses a dedicated AuditService.

Example:

```ts
await auditService.log({
    userId,
    action: AuditAction.FILE_UPLOAD,
    resource: file.filename,
});
```

Benefits:

- Reusable
- Centralized
- Easier to maintain
- Easier to test

---

# Logged Events

Current implementation records:

## Authentication

- User registration
- User login

## Files

- File upload
- File download
- File deletion

---

# Why Log Only Successful Operations?

Audit logs should represent completed actions.

For example:

❌ Failed login

No login actually occurred.

✅ Successful login

The user authenticated successfully and should be recorded.

Similarly:

- Upload logged only after database save succeeds.
- Download logged only after authorization succeeds.
- Delete logged only after file removal succeeds.

---

# Error Handling

Audit logging uses a try/catch block.

```ts
try {
    await prisma.auditLog.create(...)
} catch (error) {
    console.error(error)
}
```

If audit logging fails, the main application flow continues.

This prevents users from being blocked because audit logging failed.

---

# Benefits

Audit logging provides:

- Security
- Traceability
- Compliance
- User activity history
- Easier debugging

---

# Interview Questions

## What is audit logging?

Audit logging records important user actions for security, monitoring, and traceability.

---

## Why separate audit logs from application logs?

Application logs help developers debug.

Audit logs record business events performed by users.

---

## Why use a service instead of calling Prisma everywhere?

A dedicated service:

- Avoids duplicated code
- Centralizes logic
- Makes future enhancements easier

---

## Why use enums?

Enums:

- Prevent typos
- Improve autocomplete
- Improve type safety

---

## Why log only successful actions?

Audit logs should represent completed operations rather than failed attempts.

---

## What additional information could be stored?

Examples:

- IP address
- User-Agent
- Device information
- Request ID
- Metadata
- Previous and new values

---

# Future Improvements

- Store client IP
- Store browser information
- Store request ID
- Support filtering by user
- Add pagination
- Export audit logs
- Integrate with SIEM platforms

---

# What I Learned

- Designing audit trails
- Prisma relations
- Service-layer architecture
- Separation of concerns
- Recording security events
- Building enterprise backend features