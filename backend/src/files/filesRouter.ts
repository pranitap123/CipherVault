import multer from "multer";
import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import {
    uploadFile,
    downloadFile,
    listFiles,
    deleteFile,
    storageStats,
} from "./filesController.js";
import { fileIdSchema } from "../validations/file.validation.js";
import {
    validateParams,
    validateFileUpload,
} from "../middlewares/validation.js";

const upload = multer({
    storage: multer.memoryStorage(),
});

const fileRouter = Router();

/**
 * @openapi
 * /files:
 *   post:
 *     tags:
 *       - Files
 *     summary: Upload a file
 *     description: Uploads and securely stores a file for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadFileResponse'
 *       400:
 *         description: Invalid file or validation failed
 *       401:
 *         description: Unauthorized
 */
fileRouter.post(
    "/",
    authenticate,
    upload.single("file"),
    validateFileUpload,
    uploadFile
);

/**
 * @openapi
 * /files/stats:
 *   get:
 *     tags:
 *       - Files
 *     summary: Get storage statistics
 *     description: Returns storage usage statistics for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Storage statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usedBytes:
 *                   type: number
 *                 quotaBytes:
 *                   type: number
 *                 fileCount:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */
fileRouter.get(
    "/stats",
    authenticate,
    storageStats
);

/**
 * @openapi
 * /files:
 *   get:
 *     tags:
 *       - Files
 *     summary: List user files
 *     description: Returns all files belonging to the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListFilesResponse'
 *       401:
 *         description: Unauthorized
 */
fileRouter.get(
    "/",
    authenticate,
    listFiles
);

/**
 * @openapi
 * /files/{id}:
 *   get:
 *     tags:
 *       - Files
 *     summary: Download a file
 *     description: Downloads a previously uploaded file.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: File ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid file ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 */
fileRouter.get(
    "/:id",
    authenticate,
    validateParams(fileIdSchema),
    downloadFile
);

/**
 * @openapi
 * /files/{id}:
 *   delete:
 *     tags:
 *       - Files
 *     summary: Delete a file
 *     description: Deletes a file owned by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: File ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Invalid file ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 */
fileRouter.delete(
    "/:id",
    authenticate,
    validateParams(fileIdSchema),
    deleteFile
);

export default fileRouter;