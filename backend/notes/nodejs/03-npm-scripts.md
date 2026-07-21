# npm Scripts

## Development Script

```json
"dev": "tsx watch src/server.ts"
```

Runs the development server.

Automatically restarts when files change.

---

## Build Script

```json
"build": "tsc"
```

Compiles TypeScript into JavaScript.

Output:

dist/

---

## Production Script

```json
"start": "node dist/server.js"
```

Runs the compiled JavaScript.

---

## Development vs Production

Development

tsx → executes TypeScript directly.

Production

Node executes compiled JavaScript.

## SecureVault Usage

During development:

npm run dev

Before deployment:

npm run build

Production:

npm start
---

## Interview Questions

Why don't we run TypeScript directly in production?

Why do we build first?

Difference between dev and start?