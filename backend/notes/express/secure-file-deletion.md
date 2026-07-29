# Secure File Deletion

## Feature

Endpoint:

```http
DELETE /files/:id
```

Deletes an encrypted file and its metadata only if the authenticated user owns the file.

---

# Request Lifecycle

```text
Client
    │
DELETE /files/:id
    │
    ▼
JWT Authentication
    │
Validate Token
    │
Extract userId
    │
    ▼
Find File
    │
404 if missing
    │
    ▼
Ownership Verification
    │
403 if unauthorized
    │
    ▼
Delete encrypted file from filesystem
    │
    ▼
Delete metadata from PostgreSQL
    │
    ▼
Return Success
```

---

# Why authenticate?

Only logged-in users should be able to delete files.

The authenticated user's ID is obtained from the JWT.

```ts
const ownerId = req.userId;
```

---

# Why find the file first?

Before deleting anything, the server must verify:

- the file exists
- the authenticated user owns it

```ts
const file = await prisma.file.findUnique(...)
```

---

# Why return 404?

If the file does not exist:

```http
404 Not Found
```

There is nothing to delete.

---

# Why verify ownership?

```ts
if (file.ownerId !== ownerId)
```

Authentication tells us **who** the user is.

Authorization determines **what** the user is allowed to do.

Without this check, users could delete files belonging to other users.

---

# Why return 403?

The user is authenticated.

However, they are not allowed to delete another user's file.

Correct response:

```http
403 Forbidden
```

---

# Why delete the filesystem first?

Delete order:

```
Filesystem
    ↓
Database
```

If the database record is removed first and filesystem deletion fails, an encrypted orphan file remains on disk.

Deleting the encrypted file first keeps storage consistent.

---

# Filesystem Deletion

```ts
await fsPromises.unlink(file.storagePath);
```

Removes the encrypted file from disk.

---

# Database Deletion

```ts
await prisma.file.delete({
    where: {
        id: fileId,
    },
});
```

Removes the metadata after successful filesystem deletion.

---

# Success Response

```json
{
    "message": "File deleted successfully"
}
```

---

# HTTP Status Codes

| Status | Meaning |
|---------|----------|
|200|File deleted successfully|
|401|Authentication failed|
|403|Authenticated but not authorized|
|404|File not found|
|500|Unexpected server error|

---

# Backend Principles

- Authenticate before performing operations.
- Verify resource ownership.
- Delete resources in a safe order.
- Keep database and filesystem synchronized.
- Return meaningful HTTP status codes.

---

# Interview Questions

## Easy

Why do we use `DELETE` instead of `POST`?

---

Why do we verify ownership?

---

Why return 404 before 403?

---

## Medium

What happens if filesystem deletion fails?

---

Why shouldn't the client send the owner ID?

---

Why do we use the file ID as the primary key?

---

## Advanced

How would you make filesystem deletion and database deletion transactional?

---

How would you implement soft delete?

---

How would you delete files stored in AWS S3 instead of local disk?

---

How would you recover from partial failures?

---

# Key Takeaways

- Authentication identifies the user.
- Authorization protects resources.
- Always verify ownership.
- Delete filesystem data before database metadata.
- Keep storage consistent.