import prisma from "../config/prisma.js";
import { CreateAuditLogInput } from "./audit.types.js";

class AuditService {
  async log({ userId, action, resource }: CreateAuditLogInput) {
    return prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
      },
    });
  }
}

export const auditService = new AuditService();