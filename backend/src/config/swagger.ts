import swaggerJSDoc from "swagger-jsdoc";

const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: "3.0.3",
        info: {
            title: "SecureVault API",
            version: "1.0.0",
            description:
                "SecureVault is a secure file storage API built with Express, TypeScript, Prisma, PostgreSQL, and JWT authentication.",
        },

        servers: [
            {
                url: "http://localhost:3000",
                description: "Development Server",
            },
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },

        security: [
            {
                bearerAuth: [],
            },
        ],
    },

    apis: [
        "./src/auth/*.ts",
        "./src/files/*.ts",
    ],
});

export default swaggerSpec;