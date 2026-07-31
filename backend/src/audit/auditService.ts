import prisma from "../config/prisma.js";
import type { CreateAuditLogInput } from "./audit.types.js";

class AuditService {
    async log({
        userId,
        action,
        resource,
    }: CreateAuditLogInput): Promise<void> {
        try {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action,
                    resource,
                },
            });
        } catch (error) {
            console.error("Failed to create audit log:", error);
        }
    }
}

export const auditService = new AuditService();