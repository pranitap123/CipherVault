import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { env } from "../config/env.js";
import prisma from "../config/prisma.js";

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
        const userId = decoded.userId as string;

        // Role is looked up fresh from the DB on every request rather than
        // trusted from the JWT payload. Tokens live for 7 days; if we embedded
        // role in the token, demoting/promoting a user wouldn't take effect
        // until their token expired. One extra indexed lookup per request is
        // worth it to make role changes take effect immediately.
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true },
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid or expired token",
            });
        }

        req.userId = user.id;
        req.userRole = user.role;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}