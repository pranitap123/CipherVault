import { Request, Response } from "express";
import fsPromises from "fs/promises";
import prisma from "../config/prisma.js";
import { auditService } from "../audit/auditService.js";
import { AuditAction } from "../audit/audit.types.js";

// Admin view across ALL users' files, not just the caller's own.
// This is the endpoint that could not exist under plain ownership-based
// isolation (files/filesController.ts) — that model only ever proves
// "is this my file?", never "am I allowed to see everyone's files?".
export async function listAllFiles(req: Request, res: Response) {
    try {
        const files = await prisma.file.findMany({
            select: {
                id: true,
                ownerId: true,
                originalFilename: true,
                mimeType: true,
                sizeBytes: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        await auditService.log({
            userId: req.userId!,
            action: AuditAction.ADMIN_VIEW_ALL_FILES,
        });

        return res.status(200).json({
            files: files.map((file) => ({
                ...file,
                sizeBytes: file.sizeBytes.toString(),
            })),
        });
    } catch (error) {
        console.error("Admin List Files Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Admin can delete ANY user's file, not just their own.
export async function adminDeleteFile(req: Request, res: Response) {
    try {
        const fileId = req.params.id as string;

        const file = await prisma.file.findUnique({ where: { id: fileId } });

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        await fsPromises.unlink(file.storagePath).catch(() => {
            // File already missing from disk — still clean up the DB row.
        });

        await prisma.file.delete({ where: { id: fileId } });

        await auditService.log({
            userId: req.userId!,
            action: AuditAction.ADMIN_FILE_DELETE,
            resource: `${file.filename} (owner: ${file.ownerId})`,
        });

        return res.status(200).json({
            message: "File deleted successfully by admin",
        });
    } catch (error) {
        console.error("Admin Delete File Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function listAllUsers(req: Request, res: Response) {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        await auditService.log({
            userId: req.userId!,
            action: AuditAction.ADMIN_VIEW_ALL_USERS,
        });

        return res.status(200).json({ users });
    } catch (error) {
        console.error("Admin List Users Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Promote/demote a user's role. This is the only way a USER becomes an
// ADMIN — there is deliberately no self-service "make me an admin" path
// anywhere in the public API.
export async function updateUserRole(req: Request, res: Response) {
    try {
        const targetUserId = req.params.id as string;
        const { role } = req.body as { role: "USER" | "ADMIN" };

        if (targetUserId === req.userId && role === "USER") {
            // Prevents an admin from accidentally locking themselves out if
            // they're the only admin account — a cheap, worthwhile guard.
            return res.status(400).json({
                message: "You cannot demote your own account",
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: targetUserId },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updated = await prisma.user.update({
            where: { id: targetUserId },
            data: { role },
            select: { id: true, email: true, role: true },
        });

        await auditService.log({
            userId: req.userId!,
            action: AuditAction.ADMIN_ROLE_UPDATE,
            resource: `${updated.email} -> ${role}`,
        });

        return res.status(200).json({ user: updated });
    } catch (error) {
        console.error("Admin Update Role Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
