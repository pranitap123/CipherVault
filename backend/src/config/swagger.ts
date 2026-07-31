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
        
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            example: "clx123abc456",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "john@example.com",
                        },
                    },
                },
        
                AuthResponse: {
                    type: "object",
                    properties: {
                        token: {
                            type: "string",
                            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        },
                        user: {
                            $ref: "#/components/schemas/User",
                        },
                    },
                },
        
                ErrorResponse: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Validation failed",
                        },
                    },
                },
        
                File: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            example: "clxfile123",
                        },
                        filename: {
                            type: "string",
                            example: "resume.pdf",
                        },
                        mimeType: {
                            type: "string",
                            example: "application/pdf",
                        },
                        sizeBytes: {
                            type: "integer",                                                                                                                                                                
                            example: 245760,
                        },
                    },
                },

                UploadFileResponse: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "File uploaded successfully",
                      },
                      file: {
                        $ref: "#/components/schemas/File",
                      },
                    },
                  },
                  
                  ListFilesResponse: {
                    type: "object",
                    properties: {
                      files: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/File",
                        },
                      },
                    },
                  },
                  
                  MessageResponse: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "File deleted successfully",
                      },
                    },
                  },
        
                FileList: {
                    type: "array",
                    items: {
                        $ref: "#/components/schemas/File",
                    },
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