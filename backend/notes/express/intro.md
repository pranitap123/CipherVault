# What is Express?

## What is it?

Express is a lightweight web framework built on top of Node.js that simplifies building web servers and APIs.

## Why do we need it?

Node.js can create an HTTP server using its built-in `http` module, but the API is low-level.

Without Express, developers have to manually:
- Parse URLs
- Handle HTTP methods
- Parse request bodies
- Manage routing
- Send responses

Express provides these features with a cleaner and more maintainable API.

## How does it work?

Express sits on top of Node's HTTP server and provides:

- Routing
- Middleware
- Request and Response objects
- Error handling

Example:

```ts
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});
```

## Why are we using Express in SecureVault?

- Clean API routing
- Middleware support
- Easy integration with JWT authentication
- Large ecosystem
- Industry-standard for Node.js backends

## Trade-offs

### Pros
- Lightweight
- Flexible
- Huge ecosystem
- Easy to learn

### Cons
- Unopinionated
- Folder structure is your responsibility
- Requires discipline for large projects

## Interview Questions

### What is Express?

Express is a minimal web framework built on top of Node.js that simplifies routing, middleware, and HTTP request handling.

### Why not use Node's `http` module directly?

Because Express removes repetitive boilerplate and provides a cleaner abstraction for building APIs.

### Why choose Express over NestJS?

Express gives more flexibility and is easier to understand while learning backend fundamentals. NestJS is more opinionated and better suited to larger enterprise applications.

## Key Takeaways

- Node.js provides the runtime.
- Express provides the web framework.
- Express simplifies building REST APIs.
- Express is built on top of Node's HTTP module.