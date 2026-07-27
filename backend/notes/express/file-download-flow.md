# Secure File Download - Backend Interview Notes

## Feature Overview

The download endpoint allows an authenticated user to securely retrieve a previously uploaded file.

The file remains encrypted while stored on disk and is decrypted only when requested by its owner.

Endpoint:

GET /files/:id

---

# Complete Request Lifecycle

Client
        │
        ▼
HTTP Request
        │
        ▼
Express Router
        │
        ▼
JWT Authentication Middleware
        │
        ▼
Download Controller
        │
        ▼
PostgreSQL (Fetch Metadata)
        │
        ▼
Ownership Verification
        │
        ▼
Filesystem
(Read Encrypted File)
        │
        ▼
AES Decryption
        │
        ▼
HTTP Response

---

# Why Authenticate First?

Authentication answers one question:

"Who is making this request?"

Without authentication, anyone could attempt to access protected resources.

JWT middleware verifies:

- token exists
- signature is valid
- token has not expired

If authentication fails:

HTTP 401 Unauthorized

---

# Authentication vs Authorization

Authentication

→ Who are you?

Authorization

→ What are you allowed to access?

Example

User A uploads

resume.pdf

↓

User B tries

GET /files/file-id

Authentication succeeds because User B is logged in.

Authorization fails because User B does not own the file.

Return:

403 Forbidden

Interview Tip:

Many candidates confuse authentication and authorization.

---

# Why Query PostgreSQL First?

The database stores metadata, not the actual file.

Metadata includes:

- File ID
- Owner ID
- Storage Path
- MIME Type
- IV
- File Size
- Created At

Without querying the database, we don't know:

- where the file is stored
- who owns it
- how to decrypt it

---

# Why Store Metadata Separately?

Database

↓

Small structured information

Filesystem

↓

Large binary files

Advantages:

- faster database queries
- smaller backups
- better scalability
- easy migration to cloud storage (AWS S3, Azure Blob)

---

# Why Not Store Files Inside PostgreSQL?

Possible but inefficient.

Problems:

- database grows rapidly
- slower backups
- slower replication
- expensive storage
- poor performance for large files

Instead:

Database

↓

Metadata

Filesystem

↓

Encrypted bytes

---

# Why Encrypt Files Before Saving?

If someone gains access to the server's uploads folder, they should NOT be able to open the files.

Instead of:

resume.pdf

Store:

Encrypted binary data

Even if stolen, it is unreadable without the encryption key.

---

# Why Store the IV?

AES encryption requires:

Encryption Key

+

Initialization Vector (IV)

The IV:

- is not secret
- must be unique
- is required for decryption

Therefore it is stored alongside the metadata.

The encryption key is NEVER stored in the database.

It remains inside environment variables.

---

# Why Read From Disk Before Decrypting?

The encrypted bytes exist only inside:

uploads/

The database contains only the path.

Flow:

Database

↓

storagePath

↓

Filesystem

↓

Encrypted Buffer

↓

decrypt()

↓

Original Buffer

---

# Why Use Buffers?

Uploaded files are binary data.

Node.js represents binary data using Buffer.

Examples:

PDF

Image

ZIP

Excel

All become Buffers.

Encryption algorithms operate directly on Buffers.

---

# Why Convert IV Using Buffer.from()?

Prisma stores Bytes.

Node's crypto module expects a Buffer.

Therefore:

Buffer.from(file.iv)

converts Prisma's byte array into a Node.js Buffer.

---

# Why Content-Type?

Without:

Content-Type

the browser does not know what kind of file is being returned.

Examples:

application/pdf

image/png

text/plain

application/zip

---

# Why Content-Disposition?

Setting

Content-Disposition: attachment

tells the browser:

Download the file instead of displaying it.

Without it, browsers may try to open the file directly.

---

# HTTP Status Codes Used

200 OK

Download successful.

401 Unauthorized

User is not authenticated.

403 Forbidden

User is authenticated but does not own the file.

404 Not Found

Requested file does not exist.

500 Internal Server Error

Unexpected server error.

---

# Security Checks

Authentication

↓

Does the user exist?

↓

Authorization

↓

Does the user own the file?

↓

Filesystem

↓

Does the encrypted file exist?

↓

Decryption

↓

Return original file

---

# Backend Principles Learned

Authentication

Authorization

Express Middleware

Request Lifecycle

REST APIs

Prisma Queries

Filesystem Operations

Binary Data (Buffers)

AES Encryption

Environment Variables

HTTP Response Headers

Separation of Concerns

---

# Interview Questions

## Easy

What is JWT?

Why use middleware?

Difference between 401 and 403?

Why use UUID instead of auto-increment IDs?

What is Buffer?

---

## Medium

Why not store files in PostgreSQL?

Why is the IV stored in the database?

Why is the encryption key stored in .env?

Why store metadata separately?

Why use Content-Disposition?

What happens if the file is deleted from disk but still exists in the database?

---

## Advanced

How would you migrate this project to AWS S3?

How would you support 5 GB files?

How would you stream files instead of loading them fully into memory?

How would you implement signed download URLs?

How would you rotate encryption keys?

How would you audit every file download?

How would you prevent IDOR attacks?

---

# Key Takeaways

Always authenticate before accessing protected resources.

Always authorize before returning sensitive data.

Store metadata separately from binary data.

Encrypt files before storage.

Never store encryption keys in the database.

Keep controllers responsible for orchestration, not business logic.

Every request should follow a predictable lifecycle from Router → Middleware → Controller → Database → Filesystem → Response.