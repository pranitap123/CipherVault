# Swagger / OpenAPI Documentation

## What is OpenAPI?

OpenAPI is a specification used to describe REST APIs in a standard, machine-readable format.

It defines:

- Available endpoints
- HTTP methods
- Request parameters
- Request body
- Response body
- Status codes
- Authentication
- Error responses

The OpenAPI specification is independent of any programming language or framework.

---

## What is Swagger?

Swagger is a collection of tools built around the OpenAPI specification.

Popular Swagger tools include:

- Swagger UI
- Swagger Editor
- Swagger Codegen

Swagger UI generates interactive API documentation directly from an OpenAPI specification.

---

## OpenAPI vs Swagger

| OpenAPI | Swagger |
|---------|----------|
| Specification | Toolset |
| Defines API structure | Displays and interacts with API |
| Standard | Implementation |

---

## Packages Used

```bash
npm install swagger-ui-express swagger-jsdoc

npm install -D @types/swagger-ui-express
npm install -D @types/swagger-jsdoc
```

---

## Project Files

```
src/
├── config/
│   └── swagger.ts
├── auth/
│   └── authRouter.ts
└── app.ts
```

---

## Swagger Configuration

Swagger configuration lives in:

```
src/config/swagger.ts
```

Responsibilities:

- API metadata
- OpenAPI version
- Server URLs
- JWT configuration
- Route scanning

---

## Swagger UI

Mounted in:

```ts
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);
```

Documentation URL:

```
http://localhost:3000/api-docs
```

---

## Basic Configuration

```ts
definition: {
    openapi: "3.0.3",

    info: {
        title: "SecureVault API",
        version: "1.0.0"
    },

    servers: [
        {
            url: "http://localhost:3000"
        }
    ]
}
```

---

## Security Scheme

JWT Authentication

```ts
components: {
    securitySchemes: {
        bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
        }
    }
}
```

Global security

```ts
security: [
    {
        bearerAuth: []
    }
]
```

---

## Route Documentation

Swagger uses JSDoc comments.

Example:

```ts
/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register user
 */
```

swagger-jsdoc scans the specified files and generates the OpenAPI specification automatically.

---

## Current Endpoints

### Authentication

- POST /auth/register

---

## Benefits

- Interactive API testing
- Self-documenting API
- Easy frontend integration
- Improved developer experience
- Standardized documentation
- Generates OpenAPI specification

---

## Advantages

- Easy testing
- Automatic documentation
- Reduces documentation maintenance
- Supports JWT authentication
- Supports request validation
- Supports response schemas

---

## Interview Questions

### What is OpenAPI?

A specification that describes REST APIs in a standardized format.

---

### What is Swagger?

A set of tools that implement the OpenAPI specification.

---

### Difference between OpenAPI and Swagger?

OpenAPI defines the API specification.

Swagger provides tools to build, visualize, and test APIs using that specification.

---

### Why use Swagger?

- Interactive documentation
- Better collaboration
- Easier API testing
- Frontend/backend integration
- Automatic documentation generation

---

### What is swagger-jsdoc?

A library that generates an OpenAPI specification from JSDoc comments in source files.

---

### What is swagger-ui-express?

Middleware that serves Swagger UI in an Express application.

---

### What does @openapi do?

Marks a JSDoc block that swagger-jsdoc reads to generate the OpenAPI specification.

---

### Why document APIs?

- Easier onboarding
- Better maintainability
- Faster frontend integration
- Simpler API testing
- Clear contract between client and server

---

## Best Practices

- Keep documentation close to routes.
- Document every endpoint.
- Document request and response schemas.
- Reuse schemas with OpenAPI components.
- Include realistic examples.
- Document all error responses.
- Secure protected endpoints with Bearer authentication.
- Keep documentation updated whenever the API changes.