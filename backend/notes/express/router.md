Express Router — organizing routes

Problem it solves: defining every route inline in app.ts doesn't scale. A real app has dozens of routes across areas (auth, files, users). Cramming them into one file makes it unreadable and unmergeable (everyone edits the same file → conflicts).

The Router: a mini, mountable Express app for one area. You define related routes on a Router() in their own file, export it, and mount it onto the main app with app.use(prefix, router).

The key idea — relative paths: inside the router you write paths relative to where it'll be mounted. Your health router defines router.get("/"), and app.use("/health", healthRouter) mounts it at /health — so the final path is /health. The router doesn't know or care about its prefix; that's decided at mount time. This keeps route files portable and self-contained.

Pattern you'll repeat in SecureVault:

routes/auth.route.ts   → mounted at /auth   → /auth/login, /auth/register
routes/files.route.ts  → mounted at /files  → /files, /files/:id

Each router owns its area; app.ts just wires them up with app.use.

Interview Q: "How do you structure routes in a large Express app?" → Group by domain into separate Router files, each defining paths relative to its mount point, wired into the app via app.use(prefix, router). Keeps files small, portable, and merge-friendly.

Why it matters at scale: separate files mean parallel work without conflicts, clear ownership per domain, and routes you can test in isolation.