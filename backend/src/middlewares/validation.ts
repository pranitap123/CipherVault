import { ZodType, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
];

export function validate(schema: ZodType) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: error.issues,
                });
            }

            return res.status(500).json({
                message: "Internal server error",
            });
        }
    };
}

export function validateParams(schema: ZodType) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.params);

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: error.issues,
                });
            }

            return res.status(500).json({
                message: "Internal server error",
            });
        }
    };
}

export function validateFileUpload(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!req.file) {
        return res.status(400).json({
            message: "File is required",
        });
    }


    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
        return res.status(400).json({
            message: "Unsupported file type",
        });
    }
    
    if (req.file.size > MAX_FILE_SIZE) {
        return res.status(400).json({
            message: "File size must not exceed 5 MB",
        });
    }

    next();
}