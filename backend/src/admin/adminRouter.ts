import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validate, validateParams } from "../middlewares/validation.js";
import { fileIdSchema } from "../validations/file.validation.js";
import { userIdSchema, updateRoleSchema } from "./admin.validation.js";
import {
    listAllFiles,
    adminDeleteFile,
    listAllUsers,
    updateUserRole,
} from "./adminController.js";

const adminRouter = Router();

// Every route below runs authenticate (who are you) THEN authorize("ADMIN")
// (are you allowed here). authenticate alone only proves identity — it says
// nothing about permission, which is why RBAC needs its own gate on top of it.
adminRouter.use(authenticate, authorize("ADMIN"));

/**
 * @openapi
 * /admin/files:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List every user's files (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All files across all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — caller is not an admin
 */
adminRouter.get("/files", listAllFiles);

/**
 * @openapi
 * /admin/files/{id}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete any user's file (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted
 *       403:
 *         description: Forbidden — caller is not an admin
 *       404:
 *         description: File not found
 */
adminRouter.delete("/files/:id", validateParams(fileIdSchema), adminDeleteFile);

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List all users (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All registered users
 *       403:
 *         description: Forbidden — caller is not an admin
 */
adminRouter.get("/users", listAllUsers);

/**
 * @openapi
 * /admin/users/{id}/role:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Change a user's role (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *     responses:
 *       200:
 *         description: Role updated
 *       400:
 *         description: Invalid role or attempted self-demotion
 *       403:
 *         description: Forbidden — caller is not an admin
 *       404:
 *         description: User not found
 */
adminRouter.patch(
    "/users/:id/role",
    validateParams(userIdSchema),
    validate(updateRoleSchema),
    updateUserRole
);

export default adminRouter;
