// Rotates the master key without touching a single file's content on disk.
//
// Usage:
//   OLD_MASTER_KEY=<current 64-hex-char key> \
//   NEW_MASTER_KEY=<new 64-hex-char key> \
//   npx tsx scripts/rotateMasterKey.ts
//
// This is the whole payoff of envelope encryption: only the small (32-byte)
// per-file Data Encryption Keys get unwrapped and re-wrapped here. The
// gigabytes of actual encrypted file content in uploads/ are never re-read
// or re-written. Rotation cost is O(number of files), not O(total bytes).
import "dotenv/config";
import prisma from "../src/config/prisma.js";
import { unwrapKey, wrapKeyWithMaster } from "../src/services/encryption.service.js";

async function main() {
    const oldHex = process.env.OLD_MASTER_KEY;
    const newHex = process.env.NEW_MASTER_KEY;

    if (!oldHex || oldHex.length !== 64) {
        throw new Error("Set OLD_MASTER_KEY to the 64-hex-char key currently in use.");
    }
    if (!newHex || newHex.length !== 64) {
        throw new Error("Set NEW_MASTER_KEY to the new 64-hex-char key to rotate to.");
    }
    if (oldHex === newHex) {
        throw new Error("OLD_MASTER_KEY and NEW_MASTER_KEY are identical — nothing to rotate.");
    }

    const oldKey = Buffer.from(oldHex, "hex");
    const newKey = Buffer.from(newHex, "hex");

    const files = await prisma.file.findMany({
        where: { encVersion: 2 },
        select: { id: true, wrappedKey: true, keyIv: true, keyAuthTag: true },
    });

    console.log(`Found ${files.length} envelope-encrypted file(s) to rotate.`);

    let rotated = 0;
    let skipped = 0;

    for (const file of files) {
        if (!file.wrappedKey || !file.keyIv || !file.keyAuthTag) {
            console.warn(`Skipping ${file.id} — missing envelope fields.`);
            skipped++;
            continue;
        }

        try {
            // Unwrap the file's DEK using the OLD master key...
            const dataKey = unwrapKey(
                Buffer.from(file.wrappedKey),
                Buffer.from(file.keyIv),
                Buffer.from(file.keyAuthTag),
                oldKey
            );

            // ...then re-wrap the SAME DEK under the NEW master key.
            const { wrappedKey, keyIv, keyAuthTag } = wrapKeyWithMaster(dataKey, newKey);
            dataKey.fill(0);

            await prisma.file.update({
                where: { id: file.id },
                data: {
                    wrappedKey: new Uint8Array(wrappedKey),
                    keyIv: new Uint8Array(keyIv),
                    keyAuthTag: new Uint8Array(keyAuthTag),
                },
            });

            rotated++;
        } catch (error) {
            console.error(`Failed to rotate ${file.id} — is OLD_MASTER_KEY correct?`, error);
            skipped++;
        }
    }

    console.log(`\nRotated: ${rotated}  Skipped: ${skipped}`);
    if (skipped === 0 && rotated === files.length) {
        console.log(
            "All keys rotated successfully. Update MASTER_KEY to NEW_MASTER_KEY in your environment and restart the app."
        );
    } else {
        console.log(
            "Some files were not rotated — do NOT switch MASTER_KEY to the new value until this is resolved."
        );
        process.exitCode = 1;
    }
}

main()
    .catch((error) => {
        console.error("Rotation failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
