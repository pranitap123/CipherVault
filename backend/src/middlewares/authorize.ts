import { Request, Response, NextFunction } from "express";
import type { Role } from "@prisma/client";

/**
 * Role gate. Must run after `authenticate` (needs req.userRole).
 * Usage: router.get("/admin/x", authenticate, authorize("ADMIN"), handler)
 */
export function authorize(...allowedRoles: Role[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.userRole) {
            // authenticate() didn't run, or didn't find a user — fail closed.
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        if (!allowedRoles.includes(req.userRole)) {
            return res.status(403).json({
                message: "Forbidden: insufficient role",
            });
        }

        next();
    };
}
