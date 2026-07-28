# Authenticated File Listing

## Feature

Endpoint:

```http
GET /files
```

Returns all files owned by the authenticated user.

---

# Request Lifecycle

```text
Client
    │
GET /files
    │
    ▼
JWT Authentication Middleware
    │
Validate token
    │
Extract userId
    │
req.userId
    │
    ▼
listFiles Controller
    │
Prisma findMany()
    │
Retrieve user's files
    │
Serialize BigInt
    │
Return JSON Response
```

---

# Why Authentication?

The endpoint should return **only the files belonging to the currently authenticated user**.

Instead of accepting a user ID from the client, the server retrieves it from the verified JWT.

```ts
const ownerId = req.userId;
```

This prevents users from requesting another user's files by modifying request parameters.

---

# Why use findMany()?

A user can upload multiple files.

Example:

```
Resume.pdf
Notes.txt
Image.png
Invoice.pdf
```

Since one user can own many files, Prisma's `findMany()` is the appropriate query.

```ts
const files = await prisma.file.findMany(...)
```

---

# Why filter using ownerId?

```ts
where: {
    ownerId,
}
```

Equivalent SQL:

```sql
SELECT *
FROM files
WHERE owner_id = ?;
```

This ensures each request only accesses data belonging to the authenticated user.

---

# Why use select?

Instead of returning every database column:

```ts
select: {
    id: true,
    filename: true,
    mimeType: true,
    sizeBytes: true,
    createdAt: true,
}
```

we expose only the fields required by the client.

Internal fields remain private:

- storagePath
- iv
- updatedAt

Benefits:

- Better security
- Smaller responses
- Cleaner API design
- Reduced database payload

---

# Why orderBy?

```ts
orderBy: {
    createdAt: "desc",
}
```

Newest uploads appear first.

Benefits:

- Better user experience
- No frontend sorting required
- Consistent API responses

---

# BigInt Serialization

PostgreSQL stores file size as:

```prisma
sizeBytes BigInt
```

Prisma maps this to JavaScript:

```ts
BigInt
```

Example:

```ts
26691n
```

JSON does not support BigInt.

This causes:

```
TypeError:
Do not know how to serialize a BigInt
```

Solution:

```ts
const response = files.map((file) => ({
    ...file,
    sizeBytes: file.sizeBytes.toString(),
}));
```

Always return the serialized object instead of the original Prisma result.

---

# Response

```json
{
  "files": [
    {
      "id": "...",
      "filename": "resume.pdf",
      "mimeType": "application/pdf",
      "sizeBytes": "26691",
      "createdAt": "2026-07-27T13:45:06.795Z"
    }
  ]
}
```

---

# Why return 200 with an empty array?

If a user has never uploaded a file:

```json
{
    "files": []
}
```

Return:

```
200 OK
```

not

```
404 Not Found
```

Reason:

The resource exists; it simply contains no items.

---

# Backend Principles Learned

- Authentication identifies the current user.
- Never trust client-provided identifiers.
- Query only the authenticated user's data.
- Expose only necessary fields.
- Serialize unsupported data types before returning JSON.
- Keep API responses predictable.

---

# Interview Questions

## Easy

Why do we use `findMany()` instead of `findUnique()`?

---

Why shouldn't the client send the user ID?

---

What is the purpose of `select` in Prisma?

---

Why do we use `orderBy`?

---

## Medium

Why shouldn't APIs expose internal database fields?

---

Why does JSON fail to serialize `BigInt`?

---

How would you return a million files efficiently?

(Hint: pagination)

---

Why is authentication different from authorization?

---

## Advanced

How would you implement cursor-based pagination?

---

How would you add filtering by file type?

---

How would you implement searching by filename?

---

How would you cache frequently requested file lists?

---

# Key Takeaways

- Authenticate first.
- Query only authorized data.
- Keep API responses minimal.
- Convert unsupported data types before serialization.
- Design APIs for security, performance, and maintainability.