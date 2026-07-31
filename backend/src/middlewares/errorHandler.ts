import { NextFunction, Request, Response } from "express";

export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error(error);

    return res.status(500).json({
        message: "Internal server error",
    });
}