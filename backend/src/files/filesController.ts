import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import fsPromises from "fs/promises";
import { encrypt, decrypt } from "../services/encryption.service.js";

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

export async function downloadFile(req: Request, res: Response){
        const fileId = req.params.id as string;
        const ownerId = req.userId;

        if(!ownerId){
            return res.status(401).json({
                message:"Unauthorized",
            });
        }

        const file = await prisma.file.findUnique({
            where: {
                id: fileId,
            },
        });
    
        // Step 3: Check if the file exists
        if (!file) {
            return res.status(404).json({
                message: "File not found",
            });
        }
        if (file.ownerId !== ownerId) {
            return res.status(403).json({
                message: "Forbidden",
            });
        }
 const encryptedFile = await fsPromises.readFile(file.storagePath);

 const decryptedFile = decrypt(
    encryptedFile,
    Buffer.from(file.iv)
);

res.setHeader("Content-Type", file.mimeType);

    // Step 8: Tell the browser to download it
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.filename}"`
    );

    // Step 9: Send the original file
    return res.send(decryptedFile);
}

