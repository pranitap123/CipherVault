import { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/ApiError.js";

export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error({
        method: req.method,
        path: req.originalUrl,
        message: error.message,
        stack: error.stack,
    });

    if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
            message: error.message,
        });
    }

    return res.status(500).json({
        message: "Internal server error",
    });
}