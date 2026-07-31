import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { env } from "../config/env.js";
import { auditService } from "../audit/auditService.js";
import { AuditAction } from "../audit/audit.types.js";


export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

export function generateToken(userId: string): string {
    return jwt.sign(
        { userId },
        env.jwtSecret,
        {
            expiresIn: "7d",
        }
    );
}

export async function registerUser(email: string, password: string) {
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
        },
    });

    await auditService.log({
        userId: user.id,
        action: AuditAction.USER_REGISTER,
      });

    const token = generateToken(user.id);

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
        },
    };
}

export async function loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatches) {
        throw new Error("Invalid email or password");
    }

    await auditService.log({
        userId: user.id,
        action: AuditAction.USER_LOGIN,
      });

    const token = generateToken(user.id);

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
        },
    };
}