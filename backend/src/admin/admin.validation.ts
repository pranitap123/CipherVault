import { z } from "zod";

export const userIdSchema = z.object({
    id: z.string().uuid("Invalid user ID"),
});

export const updateRoleSchema = z.object({
    role: z.enum(["USER", "ADMIN"]),
});
