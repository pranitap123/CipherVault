Why split app.ts from server.ts

The setup: app.ts creates and configures the Express app (middleware + routes) and exports it. server.ts imports it and calls app.listen(PORT).

Why separate them — one word: testability. Tests want to import the app and fire fake requests at it without binding a real network port. Tools like supertest take your exported app and simulate requests in-memory. If app.listen() were baked into the app definition, every test would try to open a port — slow, and ports collide when tests run in parallel. Separating "what the app is" from "run the app" keeps the app importable and pure.

Second benefit: flexibility. The same app can be started different ways — a normal server, a serverless function, multiple test configs — because starting it is decoupled from defining it.

Interview Q: "How do you structure an Express app for testing?" → Separate app definition (exported, no listen) from server startup (listen). Import the app directly in tests to avoid opening real ports.

Quirk worth knowing: with NodeNext module resolution, imports use the compiled .js extension (import app from "./app.js") even though the source is .ts. Trips people up; it's correct.