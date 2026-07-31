Swagger API Documentation Notes
What is Swagger?

Swagger is a collection of tools for documenting, testing, and exploring REST APIs.

It follows the OpenAPI Specification (OAS).

Benefits:

Interactive API documentation
API testing from the browser
Better collaboration between frontend and backend
API contract for consumers
Auto-generated documentation
OpenAPI vs Swagger
OpenAPI Specification (OAS): The standard that describes REST APIs.
Swagger: A set of tools built around the OpenAPI Specification.

Examples:

Swagger UI
swagger-jsdoc
Swagger Editor
Packages Used
swagger-ui-express
swagger-jsdoc
@types/swagger-ui-express
@types/swagger-jsdoc
Project Structure
src/
├── config/
│   └── swagger.ts
├── auth/
│   └── authRouter.ts
├── files/
│   └── filesRouter.ts
Swagger Configuration

Configured in:

src/config/swagger.ts

Main sections:

OpenAPI version
API information
Server configuration
Security schemes
Reusable schemas
Global security
Files to scan
Components

Reusable schemas are defined inside:

components:
  schemas:

Advantages:

Avoid duplication
Easier maintenance
Consistent API responses

Examples:

User
AuthResponse
ErrorResponse
File
UploadFileResponse
ListFilesResponse
MessageResponse
Security

JWT authentication is configured using:

components:
  securitySchemes:
    bearerAuth:

Global security:

security:
  - bearerAuth: []

Swagger automatically shows the Authorize button.

Documented Endpoints

Authentication

POST /auth/register
POST /auth/login

Files

POST /files
GET /files
GET /files/{id}
DELETE /files/{id}
Request Bodies

Swagger documents:

JSON requests
Multipart form uploads
Path parameters
Response schemas
Binary File Download

Downloads are documented as:

application/octet-stream

with

type: string
format: binary
Why use $ref?

Instead of repeating schemas:

$ref: '#/components/schemas/AuthResponse'

Benefits:

Reusable
Cleaner
Easier maintenance
Interview Questions
What is Swagger?

Interactive API documentation based on the OpenAPI Specification that allows developers to document, test, and understand REST APIs.

Why use Swagger?
API documentation
API testing
Frontend/backend collaboration
API contract
Reduces manual documentation
What is OpenAPI?

The industry-standard specification used to describe REST APIs.

Swagger tools implement this specification.

What is swagger-jsdoc?

It generates an OpenAPI document by reading JSDoc comments from the code.

Why use reusable schemas?

To avoid duplication and keep API documentation consistent.

What is Bearer Authentication?

JWT tokens are sent in the HTTP Authorization header.

Example:

Authorization: Bearer <JWT_TOKEN>
What is Swagger UI?

A browser interface that renders OpenAPI documentation and lets developers test endpoints interactively.

Why document APIs?
Improves developer experience
Helps frontend integration
Simplifies testing
Keeps documentation synchronized with the code
Things You Learned While Building
JSDoc YAML is indentation-sensitive.
Every line inside a Swagger JSDoc block must start with *.
responses: must align with requestBody:.
$ref is used to reference reusable schemas.
Invalid YAML can cause misleading swagger-jsdoc parser errors.
application/octet-stream is the correct content type for binary downloads.
Reusable schemas reduce duplication and make documentation easier to maintain.


Production Improvements
Add API versioning (/api/v1)
Group endpoints with tags
Add examples for all request bodies
Document error responses consistently (400, 401, 403, 404, 500)
Add operation IDs and endpoint summaries
Generate a downloadable OpenAPI JSON specification