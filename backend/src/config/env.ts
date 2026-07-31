import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),

    JWT_SECRET: z
        .string()
        .min(32, "JWT_SECRET must be at least 32 characters long"),

    ENCRYPTION_KEY: z
        .string()
        .length(
            64,
            "ENCRYPTION_KEY must be exactly 64 hexadecimal characters"
        ),

    DATABASE_URL: z
        .string()
        .min(1, "DATABASE_URL is required"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables");
    console.error(parsedEnv.error.format());
    process.exit(1);
}

export const env = {
    port: parsedEnv.data.PORT,
    jwtSecret: parsedEnv.data.JWT_SECRET,
    encryptionKey: parsedEnv.data.ENCRYPTION_KEY,
    databaseUrl: parsedEnv.data.DATABASE_URL,
};