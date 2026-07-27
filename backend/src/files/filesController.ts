import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

import { encrypt } from "../services/encryption.service.js";

const prisma = new PrismaClient();

export async function uploadFile(req: Request, res: Response) {
    // Step 1: Get uploaded file
    const file = req.file;

    // Step 2: Get authenticated user
    const ownerId = req.userId;

    if (!file) {
        return res.status(400).json({
            message: "File is required",
        });
    }

    if (!ownerId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    // Step 3: Encrypt file
    const { encrypted, iv } = encrypt(file.buffer);

    // Step 4: Save encrypted file to disk
    const extension = path.extname(file.originalname);
    const storedFilename = `${crypto.randomUUID()}${extension}`;

    const uploadDirectory = "uploads";

    if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, {
            recursive: true,
        });
    }

    const storagePath = path.join(uploadDirectory, storedFilename);

    fs.writeFileSync(storagePath, encrypted);

    // Step 5: Save metadata to database
    const uploadedFile = await prisma.file.create({
        data: {
            ownerId,
            iv: new Uint8Array(iv),
            filename: storedFilename,
            mimeType: file.mimetype,
            sizeBytes: BigInt(file.size),
            storagePath,
        },
    });

    // Step 6: Return metadata
    return res.status(201).json({
        message: "File uploaded successfully",
        file: {
            ...uploadedFile,
            sizeBytes: uploadedFile.sizeBytes.toString(),
            iv: Buffer.from(uploadedFile.iv).toString("hex"),
        },
    });
}