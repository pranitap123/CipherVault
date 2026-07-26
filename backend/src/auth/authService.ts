import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

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