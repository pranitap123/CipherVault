Express — the fundamentals (SecureVault /health)

What Express is: a minimal web framework on top of Node's built-in HTTP server. Node can serve HTTP alone, but you'd hand-parse URLs, methods, and headers. Express gives you routing, middleware, and a clean request/response API.

Route: a rule mapping an HTTP method + path to a handler. Your app.get("/health", handler) says "when a GET request hits /health, run this function." The handler gets (req, res) — the incoming request and the tool to reply. res.json({status:"ok"}) sets JSON headers and sends the body.

Middleware (the concept interviewers probe most): functions that run in order on a request before it reaches its route handler — (req, res, next). Each can inspect/modify the request, then call next() to pass control down the chain, or end the response early. Auth checks, body-parsing, logging, and error handling are all middleware. You'll add these next: a JSON body-parser so uploads can be read, an auth middleware to identify the user. The request flows through a pipeline of middleware, then to the route. That pipeline model is the mental model to have.

app.listen(PORT): binds the server to a port and starts accepting connections. Until this runs, routes are just declarations.

Interview Q&A:
"What is middleware?" → A function in the request/response pipeline that runs before the handler, can modify req/res, and either passes control via next() or ends the response. Used for cross-cutting concerns: auth, logging, parsing, errors.
"Why Express over raw Node?" → Routing, middleware, and a cleaner API; you avoid manually parsing HTTP. Trade-off: it's unopinionated, so you design your own structure.
"What's a health check for?" → A lightweight endpoint (like /health) that load balancers and monitoring ping to confirm the service is alive; standard in production.

Common mistakes: template literals need backticks, not quotes (you hit this — ${} only substitutes inside `); forgetting next() in middleware (request hangs); putting business logic in route handlers instead of a service layer (we'll avoid this with your services/ folder).