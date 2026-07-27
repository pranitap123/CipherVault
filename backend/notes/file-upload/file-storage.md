1. Why UUID over auto-increment for primary keys?
Sequential IDs leak information. If your file ID is 42, an attacker knows there are at least 41 other files and can enumerate them. UUIDs are non-sequential and non-guessable — enumeration attacks fail immediately.

2. Why store file metadata in the DB, not the file itself?
Databases are optimized for structured queries, not binary blobs. Storing large files in a DB bloats storage, kills query performance, and doesn't scale. The DB holds the ticket (metadata + path); the disk/object store holds the coat (bytes). Coat-check pattern.

3. Why is the encryption key in env, not the DB?
A DB breach must not also hand over the key. If both live in the DB, one breach compromises everything. Separating them means an attacker needs two independent breaches — one for the encrypted data, one for the key.

4. Why store the IV per file, and why is that safe?
The IV must be unique per encryption operation to prevent pattern analysis across files. It's not secret — it's useless without the key — so storing it beside the ciphertext is fine. Key and IV have different jobs, different threat models, different homes.

5. Why bcrypt for passwords, not just hashing?
bcrypt is slow by design — it has a work factor (salt rounds). Fast hashes like SHA-256 let attackers brute-force millions of guesses per second. bcrypt makes each guess expensive, which makes bulk cracking infeasible.

6. Why does JWT move ownerId server-side?
If the client supplies ownerId in the request body, they can claim to be anyone. JWT is server-signed — the server creates the token, the client can't modify the payload without invalidating the signature. So the server reads userId from the verified token and sets ownerId itself. Clients never get to supply it.

7. Why memoryStorage over dest in multer?
dest writes the file to disk first, then your handler reads it back — two disk operations for no reason. memoryStorage keeps the bytes in a Buffer in RAM, your handler encrypts them directly, and you write once — the encrypted version. Fewer I/O operations, cleaner pipeline.

-----------------

# SecureVault Design Decisions

## 1. Why UUID over auto-increment for primary keys?

Sequential IDs leak information. If a file has ID `42`, an attacker knows there are at least 41 other files and may try to enumerate them.

UUIDs are non-sequential and difficult to guess, making enumeration attacks much harder.

---

## 2. Why store file metadata in the database instead of the file itself?

Databases are optimized for structured queries, relationships, and indexing—not large binary objects.

Large files increase database size, slow backups, and reduce query performance.

Instead:

- Database → metadata
- Filesystem/Object Storage → encrypted file contents

This follows the coat-check pattern:
- The database stores the ticket.
- The storage system keeps the actual coat.

---

## 3. Why store the encryption key in environment variables instead of the database?

If both encrypted files and encryption keys are stored in the same database, a single breach compromises everything.

Keeping the encryption key outside the database provides separation of secrets.

An attacker would need access to both:

- Database
- Environment secrets

to decrypt user files.

---

## 4. Why store an IV for every file?

AES requires a unique Initialization Vector (IV) for every encryption operation.

Reusing an IV with the same key weakens encryption and can reveal patterns.

The IV is **not secret**.

It only needs to be unique.

Therefore it's perfectly safe to store the IV alongside the encrypted file metadata.

---

## 5. Why bcrypt instead of SHA-256 for passwords?

Password hashing has different requirements than file hashing.

SHA-256 is intentionally fast, allowing attackers to try millions of guesses per second.

bcrypt is intentionally slow and includes configurable work factors (salt rounds), making brute-force attacks significantly more expensive.

---

## 6. Why derive ownerId from JWT instead of the request body?

Clients should never decide resource ownership.

If a client could send:

{
  "ownerId": "someone-else"
}

they could impersonate another user.

Instead:

1. User logs in.
2. Server signs a JWT.
3. JWT contains the authenticated user's ID.
4. Server verifies the JWT.
5. Server sets `req.userId`.

The client never controls ownership.

---

## 7. Why use Multer memoryStorage() instead of dest?

Using `dest` writes the uploaded file to disk before encryption.

Flow:

Client
→ Disk
→ Read
→ Encrypt
→ Disk

This performs unnecessary disk I/O.

Using `memoryStorage()` keeps the uploaded file in memory:

Client
→ Memory
→ Encrypt
→ Disk

Only the encrypted version is ever written to persistent storage.

This reduces disk operations and avoids temporarily storing unencrypted files.